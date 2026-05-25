import type { Adb } from "@yume-chan/adb";
import { useRef, useState } from "react";
import { takeScreenshot, tapScreen } from "./adb";
import { findButtonInScreenshot, drawMatchOnScreenshot } from "./opencv";

const TradeStep = {
  START_TRADE: 0,
  SELECT_MON: 1,
  CONFIRM_MON: 2,
  CONFIRM_TRADE: 3,
  CLOSE: 4,
} as const;

type TradeStep = (typeof TradeStep)[keyof typeof TradeStep];

export type MachineState = "off" | "running" | "success" | "stopped" | "error";

const BUTTONS: Record<TradeStep, string> = {
  [TradeStep.START_TRADE]: "/go-trader/templates/s0.png",
  [TradeStep.SELECT_MON]: "/go-trader/templates/s1.png",
  [TradeStep.CONFIRM_MON]: "/go-trader/templates/s2.png",
  [TradeStep.CONFIRM_TRADE]: "/go-trader/templates/s3.png",
  [TradeStep.CLOSE]: "/go-trader/templates/s4.png",
};

const STEPS_IN_ORDER: TradeStep[] = [
  TradeStep.START_TRADE,
  TradeStep.SELECT_MON,
  TradeStep.CONFIRM_MON,
  TradeStep.CONFIRM_TRADE,
  TradeStep.CLOSE,
];

const MATCH_THRESHOLDS: Record<TradeStep, number> = {
  [TradeStep.START_TRADE]: 0.7,
  [TradeStep.SELECT_MON]: 0.9,
  [TradeStep.CONFIRM_MON]: 0.9,
  [TradeStep.CONFIRM_TRADE]: 0.9,
  [TradeStep.CLOSE]: 0.75,
};

const AFTER_STEP_DELAY: Record<TradeStep, number> = {
  [TradeStep.START_TRADE]: 2000,
  [TradeStep.SELECT_MON]: 500,
  [TradeStep.CONFIRM_MON]: 1000,
  [TradeStep.CONFIRM_TRADE]: 8000,
  [TradeStep.CLOSE]: 1000,
};

const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 100;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const useStateMachine = (adb: Adb | null) => {
  const [step, setStep] = useState<TradeStep>(TradeStep.START_TRADE);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [completedTrades, setCompletedTrades] = useState<number>(0);
  const [currentState, setCurrentState] = useState<MachineState>("off");
  const [error, setError] = useState<string | null>(null);

  const stopRef = useRef(false);
  const stop = () => {
    stopRef.current = true;
    setCurrentState("stopped");
  };

  const updateScreenshot = (url: string) => {
    setScreenshotUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  };

  // Waits until the button for the given step is found, then taps it
  const processStep = async (currentStep: TradeStep): Promise<boolean> => {
    if (!adb) return false;

    const templateUrl = BUTTONS[currentStep];

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (stopRef.current) return false;

      const screenshotUrl = await takeScreenshot(adb);
      if (!screenshotUrl) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      const match = await findButtonInScreenshot(screenshotUrl, templateUrl);
      const accept = match.score > MATCH_THRESHOLDS[currentStep];
      const debugUrl = await drawMatchOnScreenshot(screenshotUrl, match, accept);
      updateScreenshot(debugUrl);

      console.log(
        `[Step ${currentStep}] score: ${match.score.toFixed(3)}, threshold: ${MATCH_THRESHOLDS[currentStep]} (attempt ${attempt + 1})`,
      );

      if (accept) {
        const centerX = match.location.x + match.width / 2;
        const centerY = match.location.y + match.height / 2;
        await tapScreen(adb, centerX, centerY);
        await sleep(AFTER_STEP_DELAY[currentStep]);
        return true;
      }

      const expired = await findButtonInScreenshot(
        screenshotUrl,
        "/go-trader/templates/expired.png",
      );
      if (expired.score > 0.9) {
        setError(`[Step ${currentStep}] failed. Trade Expired.`);
        return false;
      }

      const special = await findButtonInScreenshot(
        screenshotUrl,
        "/go-trader/templates/special.png",
      );
      if (special.score > 0.9) {
        setError(`[Step ${currentStep}] failed. Special Trade detected.`);
        return false;
      }

      await sleep(RETRY_DELAY_MS);
    }

    console.error(`[Step ${currentStep}] failed after ${MAX_RETRIES} attempts`);
    setError(`[Step ${currentStep}] failed after ${MAX_RETRIES} attempts`);
    return false;
  };

  const start = async (amount: number) => {
    if (!adb || currentState === "running") return;
    setCurrentState("running");
    setCompletedTrades(0);
    setError(null);
    stopRef.current = false;
    let failed = false;

    try {
      for (let i = 0; i < amount; i++) {
        for (const tradeStep of STEPS_IN_ORDER) {
          setStep(tradeStep);
          try {
            const success = await processStep(tradeStep);
            if (!success) {
              console.error(`Trade ${i + 1} aborted at step ${tradeStep}`);
              failed = true;
              return;
            }
          } catch (error: any) {
            failed = true;
            setError(error.toString());
            setCurrentState("error");
            return;
          }
        }
        console.log(`Trade ${i + 1} complete`);
        setCompletedTrades((prev) => prev + 1);
      }
    } finally {
      setStep(TradeStep.START_TRADE);
      if (stopRef.current) {
        setCurrentState("stopped");
      } else if (failed) {
        setCurrentState("error");
      } else {
        setCurrentState("success");
      }
    }
  };

  return {
    currentState,
    step,
    screenshotUrl,
    completedTrades,
    error,
    start,
    stop,
  };
};

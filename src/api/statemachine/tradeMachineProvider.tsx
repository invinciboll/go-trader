import React, { useMemo, useRef, useState } from "react";

import { TradeMachineContext } from "./tradeMachineContext";
import { DELAY_AFTER_TAP, MATCH_THRESHOLDS, MAX_RETRIES, RETRY_DELAY_MS, SCREENSHOT_FAIL_DELAY_MS, STEPS_IN_ORDER, TradeStep, type TradeMachineState } from "./constants";
import { useOpenCv } from "../opencv/useOpenCv";
import { useAdb } from "../adb/useAdb";
import { getErrorMessage } from "./error";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const TradeMachineProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isReady: adbReady, takeScreenshot, tapScreen } = useAdb();
    const { isReady: openCvReady, selectMonYOffset, findMatchInScreenshot, drawMatchOnScreenshot } = useOpenCv();
    const isReady = adbReady && openCvReady;

    const [currentMachineState, setCurrentMachineState] = useState<TradeMachineState>("OFF");
    const [currentTradeIndex, setCurrentTradeIndex] = useState<number>(0);

    const [currentTradeStep, setCurrentStep] = useState<TradeStep>(TradeStep.START_TRADE);
    const [currentScreenshotUrl, setCurrentScreenshotUrl] = useState<string | null>(null);

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const stopRef = useRef(false);

    const reset = () => {
        setCurrentMachineState('OFF');
        setCurrentTradeIndex(0);

        setCurrentStep(TradeStep.START_TRADE);
        setCurrentScreenshotUrl(null);

        setErrorMsg(null);
        stopRef.current = false;
    }

    const stop = () => {
        setCurrentMachineState("STOPPED");
        stopRef.current = true;
    };

    const setMachineError = (errorMsg: string) => {
        setCurrentMachineState("ERROR");
        setErrorMsg(errorMsg);
    }

    const start = async (numberOfTrades: number) => {
        if (!isReady || currentMachineState === "RUNNING") return;

        reset();
        setCurrentMachineState("RUNNING");

        for (let i = 0; i < numberOfTrades; i++) {
            if (stopRef.current) return;

            for (const tradeStep of STEPS_IN_ORDER) {
                if (stopRef.current) return;
                setCurrentStep(tradeStep); // Update Observers

                try {
                    await processStep(tradeStep);
                } catch (error: unknown) {
                    setMachineError(getErrorMessage(error));
                    return;
                }

            }
            setCurrentTradeIndex((prev) => prev + 1);
        }
        setCurrentMachineState("SUCCESS");
    };

    const processStep = async (currentStep: TradeStep) => {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            if (stopRef.current) return false;

            const screenshotUrl = await takeScreenshot();
            if (!screenshotUrl) {
                // Rare case where screenshot fails
                await sleep(SCREENSHOT_FAIL_DELAY_MS);
                continue;
            } else {
                setCurrentScreenshotUrl(screenshotUrl);
            }

            const match = await findMatchInScreenshot(screenshotUrl, currentStep);
            const accept = match.score > MATCH_THRESHOLDS[currentStep];

            const debugUrl = await drawMatchOnScreenshot(screenshotUrl, match, accept);
            setCurrentScreenshotUrl(debugUrl);

            if (accept) {
                const tapX = match.location.x + match.width / 2;
                let tapY = match.location.y + match.height / 2;

                if (currentStep === TradeStep.SELECT_MON) {
                    tapY += selectMonYOffset;
                }

                await tapScreen(tapX, tapY);
                await sleep(DELAY_AFTER_TAP[currentStep]);
                return;
            }

            // const expired = await findMatchInScreenshot(
            //     screenshotUrl,
            //     EXCEPTION_TEMPLATES["expired"],
            // );
            // if (expired.score > 0.9) {
            //     setMachineError(`[Step ${currentStep}] failed. Trade Expired.`);
            //     return;
            // }

            // const special = await findMatchInScreenshot(
            //     screenshotUrl,
            //     EXCEPTION_TEMPLATES["special"],
            // );
            // if (special.score > 0.9) {
            //     setMachineError(`[Step ${currentStep}] failed. Special Trade detected.`);
            //     return;
            // }

            await sleep(RETRY_DELAY_MS);
        }

        setMachineError(`[Step ${currentStep}] failed after ${MAX_RETRIES} attempts`);
        return;
    };


    const value = useMemo(
        () => ({
            isReady,
            currentMachineState,
            currentTradeIndex,
            currentTradeStep,
            currentScreenshotUrl,
            errorMsg,
            start,
            stop,
            reset,
        }),
        [
            isReady,
            currentMachineState,
            currentTradeIndex,
            currentTradeStep,
            currentScreenshotUrl,
            errorMsg,
        ]
    );

    return <TradeMachineContext.Provider value={value}>{children}</TradeMachineContext.Provider>;
};
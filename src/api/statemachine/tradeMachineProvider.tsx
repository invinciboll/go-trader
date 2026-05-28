import React, { useMemo, useRef, useState } from "react";

import { TradeMachineContext } from "./tradeMachineContext";
import { DELAY_AFTER_TAP, MATCH_THRESHOLDS, MAX_RETRIES, RETRY_DELAY_MS, SCREENSHOT_FAIL_DELAY_MS, STEPS_IN_ORDER, TradeStep, type TradeMachineState } from "./constants";
import { useOpenCv } from "../opencv/useOpenCv";
import { useAdb } from "../adb/useAdb";
import { getErrorMessage } from "./error";
import type { MatchResult } from "../opencv/openCvContext";

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
        stopRef.current = true;
        setErrorMsg(errorMsg);
    }

    const findOneMatchInScreenshot = async (screenshotUrl: string, currentStep: TradeStep): Promise<{ match: MatchResult, accept: boolean, errorMsg: string | null }> => {
        // Check if match is there
        let match = await findMatchInScreenshot(screenshotUrl, currentStep);
        let accept = match.score > MATCH_THRESHOLDS[currentStep];
        if (accept) {
            return { match, accept, errorMsg: null }
        }

        // If we are in TradeStep.CLOSE check for alternate variant
        if (currentStep === TradeStep.CLOSE) {
            match = await findMatchInScreenshot(screenshotUrl, "sizeRecord");
            accept = match.score > MATCH_THRESHOLDS["sizeRecord"];
            if (accept) {
                return { match, accept, errorMsg: null }
            }
        }

        // Check if "special trade" warning is visible
        const specialMatch = await findMatchInScreenshot(screenshotUrl, "special");
        accept = specialMatch.score > MATCH_THRESHOLDS["special"];
        if (accept) {
            return  {match: specialMatch, accept, errorMsg: "Special trade detected. Stopping trade machine."}
        }

        // Check if "trade expired" warning is visible
        const expiredMatch = await findMatchInScreenshot(screenshotUrl, "expired");
        accept = expiredMatch.score > MATCH_THRESHOLDS["expired"];
        if (accept) {
            return  {match: expiredMatch, accept, errorMsg: "Trade expired. Stopping trade machine."}
        }

        // Return match to show red render box for best attempt.
        return { match, accept, errorMsg: null }
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

            const {match, accept, errorMsg} = await findOneMatchInScreenshot(screenshotUrl, currentStep);
            if (errorMsg) {
                setMachineError(errorMsg);
                return;
            }

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
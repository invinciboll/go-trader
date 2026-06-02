import React, { useMemo, useRef, useState } from "react";

import { TradeMachineContext } from "./tradeMachineContext";
import { DELAY_AFTER_TAP, MATCH_THRESHOLDS, MAX_RETRIES, RETRY_DELAY_MS, SCREENSHOT_FAIL_DELAY_MS, STEPS_IN_ORDER, TradeStep, TradeStepName, type TradeMachineState } from "./constants";
import { useOpenCv } from "../opencv/useOpenCv";
import { useAdb } from "../adb/useAdb";
import { getErrorMessage } from "./error";
import type { MatchResult } from "../opencv/openCvContext";
import { useLogger } from "../logger/logger";


const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));



export const TradeMachineProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isReady: adbReady, takeScreenshot, tapScreen } = useAdb();
    const { isReady: openCvReady, selectMonYOffset, findMatchInScreenshot, drawMatchOnScreenshot } = useOpenCv();
    const isReady = adbReady && openCvReady;

    const [currentMachineState, setCurrentMachineState] = useState<TradeMachineState>("OFF");
    const [currentTradeIndex, setCurrentTradeIndex] = useState<number>(0);

    const [currentTradeStep, setCurrentStep] = useState<TradeStep | null>(null);
    const [currentScreenshotUrl, setCurrentScreenshotUrl] = useState<string | null>(null);
    const [tradeAmount, setTradeAmount] = useState<number>(0);

    const stopRef = useRef(false);

    const { log, ok, warn, err, clear } = useLogger();

    const reset = () => {
        setCurrentMachineState('OFF');
        setCurrentTradeIndex(0);

        setCurrentStep(TradeStep.START_TRADE);
        setCurrentScreenshotUrl(null);
        clear()

        stopRef.current = false;
    }

    const stop = () => {
        setCurrentMachineState("STOPPED");
        stopRef.current = true;
        warn("Trade process aborted.")
    };

    const setMachineError = (errorMsg: string) => {
        setCurrentMachineState("ERROR");
        stopRef.current = true;
        err(errorMsg);
    }

    const findOneMatchInScreenshot = async (screenshotUrl: string, currentStep: TradeStep): Promise<{ match: MatchResult, accept: boolean, errorMsg: string | null , wasSizeRecord: boolean }> => {
        // Check if match is there
        let match = await findMatchInScreenshot(screenshotUrl, currentStep);
        let accept = match.score > MATCH_THRESHOLDS[currentStep];
        if (accept) {
            return { match, accept, errorMsg: null, wasSizeRecord: false }
        }

        // If we are in TradeStep.CLOSE check for alternate variant
        if (currentStep === TradeStep.CLOSE) {
            match = await findMatchInScreenshot(screenshotUrl, "sizeRecord");
            accept = match.score > MATCH_THRESHOLDS["sizeRecord"];
            if (accept) {
                return { match, accept, errorMsg: null, wasSizeRecord: true }
            }
        }

        // Check if "special trade" warning is visible
        const specialMatch = await findMatchInScreenshot(screenshotUrl, "special");
        accept = specialMatch.score > MATCH_THRESHOLDS["special"];
        if (accept) {
            return  {match: specialMatch, accept, errorMsg: "Special trade detected. Stopping trade machine.", wasSizeRecord: false}
        }

        // Check if "trade expired" warning is visible
        const expiredMatch = await findMatchInScreenshot(screenshotUrl, "expired");
        accept = expiredMatch.score > MATCH_THRESHOLDS["expired"];
        if (accept) {
            return  {match: expiredMatch, accept, errorMsg: "Trade expired. Stopping trade machine.", wasSizeRecord: false}
        }

        // Return match to show red render box for best attempt.
        return { match, accept, errorMsg: null, wasSizeRecord: false }
    }

    const start = async (numberOfTrades: number) => {
        if (!isReady || currentMachineState === "RUNNING") return;

        reset();
        setTradeAmount(numberOfTrades);
        setCurrentMachineState("RUNNING");

        for (let i = 0; i < numberOfTrades; i++) {
            if (stopRef.current) return;
            log(`Starting Trade ${i}`);
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
        ok("All trades completed.")
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

            const {match, accept, errorMsg, wasSizeRecord} = await findOneMatchInScreenshot(screenshotUrl, currentStep);
            if (errorMsg) {
                setMachineError(errorMsg);
                return;
            }

            const debugUrl = await drawMatchOnScreenshot(screenshotUrl, match, accept);
            setCurrentScreenshotUrl(debugUrl);

            if (accept) {
                
                log(`${TradeStepName[currentStep]} matched with confidence ${match.score.toFixed(2)}.`);
                const tapX = match.location.x + match.width / 2;
                let tapY = match.location.y + match.height / 2;

                if (currentStep === TradeStep.SELECT_MON) {
                    tapY += selectMonYOffset;
                }
                
                await tapScreen(tapX, tapY);
                await sleep(DELAY_AFTER_TAP[currentStep]);
                
                if (wasSizeRecord) {
                    processStep(currentStep);
                    // We need to hit the close size info and then close the thing again
                }
                
                return;
            }

            await sleep(RETRY_DELAY_MS);
        }

        setMachineError(`${TradeStepName[currentStep]} failed after ${MAX_RETRIES} attempts.`);
        return;
    };


    const value = useMemo(
        () => ({
            isReady,
            currentMachineState,
            currentTradeIndex,
            currentTradeStep,
            currentScreenshotUrl,
            tradeAmount,
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
        ]
    );

    return <TradeMachineContext.Provider value={value}>{children}</TradeMachineContext.Provider>;
};
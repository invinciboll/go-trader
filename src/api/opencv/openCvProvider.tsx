import React, { useMemo, useRef, useState } from "react";
import { OpenCvContext, type MatchResult } from "./openCvContext";
import cv from "@techstark/opencv-js";
import { TEMPLATES, TradeStep } from "../statemachine/constants";


const referenceDevice = {
    HEIGHT: 2400,
    WIDTH: 1080,
    SELECT_MON_Y_OFFSET: 400
}

const urlToMat = (url: string): Promise<cv.Mat> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext("2d")!.drawImage(img, 0, 0);
            resolve(cv.imread(canvas));
        };
        img.onerror = reject;
        img.src = url;
    });
};


export const OpenCvProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {

    const [isReady, setIsReady] = useState(false);
    const [selectMonYOffset, setselectMonYOffset] = useState(0);
    const [userDeviceRes, setUserDeviceRes] = useState<{width: number, height: number}>({width: 0, height: 0})

    const templateCache = useRef<
        Map<TradeStep | "special" | "expired" | "sizeRecord", cv.Mat>
    >(new Map());

    const initialize = (remoteTradeButtonVisible: boolean, deviceWidth: number, deviceHeight: number) => {
        setUserDeviceRes({width: deviceWidth, height: deviceHeight})
        // Only scale if width differs
        let widthFactor: number;
        let heightFactor: number;

        if (deviceWidth !== referenceDevice.WIDTH) {
            widthFactor = deviceWidth / referenceDevice.WIDTH;
            heightFactor = deviceHeight / referenceDevice.HEIGHT;
            setselectMonYOffset(Math.round(referenceDevice.SELECT_MON_Y_OFFSET * heightFactor));
        } else {
            widthFactor = 1;
            heightFactor = 1;
            setselectMonYOffset(referenceDevice.SELECT_MON_Y_OFFSET);
        }
        
        preloadTemplates(remoteTradeButtonVisible, widthFactor, heightFactor);
    }

    const deinitialize = () => {
        setIsReady(false);
        setselectMonYOffset(0);
        setUserDeviceRes({width: 0, height: 0});
    }

    async function preloadTemplates(
        remoteTradeButtonVisible: boolean,
        widthFactor: number,
        heightFactor: number
    ) {
        // console.log("preloading factors", widthFactor, heightFactor);
        for (const [step, templateUrl] of Object.entries(TEMPLATES)) {

            let tradeStep: TradeStep | 'special' | "expired" | "sizeRecord";

            if (step === "special" || step === "expired" || step === "sizeRecord") {
                tradeStep = step;
            } else {
                tradeStep = Number(step) as TradeStep;
            }

            const original = await urlToMat(templateUrl);
            const scaled = new cv.Mat();
            
            let adjustedWidthFactor = remoteTradeButtonVisible && tradeStep === TradeStep.START_TRADE ? widthFactor * 0.8 : widthFactor; 
            let adjustedHeightFactor = remoteTradeButtonVisible && tradeStep === TradeStep.START_TRADE ? heightFactor * 0.8 : heightFactor; 
            // console.log(tradeStep, adjustedWidthFactor, adjustedHeightFactor);
            cv.resize(
                original,
                scaled,
                new cv.Size(
                    Math.round(
                        original.cols * adjustedWidthFactor
                    ),
                    Math.round(
                        original.rows * adjustedHeightFactor
                    )
                ),
                0,
                0,
                widthFactor < 1 || heightFactor < 1
                    ? cv.INTER_AREA
                    : cv.INTER_LINEAR
            );
            // console.log(widthFactor, original.cols, scaled.cols, heightFactor, original.rows, scaled.rows)
            original.delete();
            templateCache.current.set(tradeStep, scaled);
        }
        setIsReady(true);
    }

    async function findMatchInScreenshot(
        screenshotUrl: string,
        tradeStep: TradeStep | "special" | "expired" | "sizeRecord",
    ): Promise<MatchResult> {
        const tpl = templateCache.current.get(tradeStep);
        if (!tpl) {
            throw new Error(
                `Unable to load template from cache for trade step ${tradeStep}`
            );
        }
        const src = await urlToMat(screenshotUrl);

        // console.log("[findButton] src size:", src.cols, "x", src.rows, "| type:", src.type(), "| empty:", src.empty());
        // console.log("[findButton] tpl size:", tpl.cols, "x", tpl.rows, "| type:", tpl.type(), "| empty:", tpl.empty());

        if (src.empty()) throw new Error("Source image Mat is empty — urlToMat likely failed for screenshot");
        if (tpl.empty()) throw new Error("Template Mat is empty — urlToMat likely failed for button image");

        if (tpl.rows > src.rows || tpl.cols > src.cols) {
            throw new Error(
                `Template (${tpl.cols}x${tpl.rows}) is larger than source (${src.cols}x${src.rows}) — cannot matchTemplate`
            );
        }

        const result = new cv.Mat();
        cv.matchTemplate(src, tpl, result, cv.TM_CCOEFF_NORMED);

        const minMax = (cv as any).minMaxLoc(result);
        console.log("match score:", minMax.maxVal, "| location:", minMax.maxLoc);

        src.delete();
        result.delete();

        return {
            score: minMax.maxVal,
            location: minMax.maxLoc,
            width: tpl.cols,
            height: tpl.rows,
        };
    }


    async function drawMatchOnScreenshot(
        screenshotUrl: string,
        match: MatchResult,
        accept: boolean,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext("2d")!;
                ctx.drawImage(img, 0, 0);

                ctx.strokeStyle = accept ? "lime" : "red";
                ctx.lineWidth = 12;
                ctx.strokeRect(
                    match.location.x,
                    match.location.y,
                    match.width,
                    match.height,
                );

                const label = accept ? "best match" : "no match";;
                const fontSize = 48;
                ctx.font = `bold ${fontSize}px sans-serif`;
                const textWidth = ctx.measureText(label).width;
                const padding = 4;
                const labelX = match.location.x;
                const labelY = match.location.y - 8;

                ctx.fillStyle = accept ? "lime" : "red";
                ctx.fillRect(
                    labelX,
                    labelY - fontSize,
                    textWidth + padding * 2,
                    fontSize + padding,
                );

                ctx.fillStyle = accept ? "black" : "white";
                ctx.fillText(label, labelX + padding, labelY - 2);

                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = reject;
            img.src = screenshotUrl;
        });
    }

    const value = useMemo(
        () => ({
            isReady,
            userDeviceRes,
            selectMonYOffset,
            initialize,
            deinitialize,
            findMatchInScreenshot,
            drawMatchOnScreenshot,
        }),
        [isReady, selectMonYOffset]
    );

    return <OpenCvContext.Provider value={value}>{children}</OpenCvContext.Provider>;
};
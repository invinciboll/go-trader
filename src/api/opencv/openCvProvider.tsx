import React, { useMemo, useState } from "react";
import { OpenCvContext, type MatchResult } from "./openCvContext";
import cv from "@techstark/opencv-js";
import { useAdb } from "../adb/useAdb";

const referenceDevice = {
    HEIGHT: 2400,
    WIDTH: 1080,
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
    const [scalingFactors, setScalingFactors] = useState<{ widthFactor: number, heightFactor: number } | null>(null);
    const isReady = scalingFactors != null;

    const initialize = (deviceWidth: number, deviceHeight: number) => {
        setScalingFactors({ 
            widthFactor: deviceWidth / referenceDevice.WIDTH, 
            heightFactor: deviceHeight / referenceDevice.HEIGHT
        });
    }

    async function findMatchInScreenshot(
        screenshotUrl: string,
        buttonUrl: string,
    ): Promise<MatchResult> {
        console.log("[findButton] Loading src:", screenshotUrl);
        console.log("[findButton] Loading tpl:", buttonUrl);

        const src = await urlToMat(screenshotUrl);
        const tpl = await urlToMat(buttonUrl);

        console.log("[findButton] src size:", src.cols, "x", src.rows, "| type:", src.type(), "| empty:", src.empty());
        console.log("[findButton] tpl size:", tpl.cols, "x", tpl.rows, "| type:", tpl.type(), "| empty:", tpl.empty());

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
        console.log("[findButton] match score:", minMax.maxVal, "| location:", minMax.maxLoc);

        const tplWidth = tpl.cols;
        const tplHeight = tpl.rows;

        src.delete();
        tpl.delete();
        result.delete();

        return {
            score: minMax.maxVal,
            location: minMax.maxLoc,
            width: tplWidth,
            height: tplHeight,
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
            initialize,
            findMatchInScreenshot,
            drawMatchOnScreenshot,
        }),
        [isReady]
    );

    return <OpenCvContext.Provider value={value}>{children}</OpenCvContext.Provider>;
};
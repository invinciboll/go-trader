import React, { useMemo, useState } from "react";
import { AdbContext } from "./adbContext";
import type { Adb } from "@yume-chan/adb";

const mergeChunks = (chunks: Uint8Array[]): Uint8Array => {
    const total = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
};

export const AdbProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [adb, setAdb] = useState<Adb | null>(null);

    const isReady = !!adb;

    const initialize = (adb: Adb) => setAdb(adb);
    const deinitialize = () => setAdb(null);

    const tapScreen = async (x: number, y: number) => {
        if (!adb) return;
        await adb.subprocess.shellProtocol?.spawn(`input tap ${x} ${y}`);
    };

    const getDeviceDimensions = async () => {
        if (!adb?.subprocess?.shellProtocol) return null;

        const process = await adb.subprocess.shellProtocol.spawn(
            'wm size'
        );

        const reader = process.stdout.getReader();
        const decoder = new TextDecoder();
        let output = '';
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            if (value) {
                output += decoder.decode(value, { stream: true });
            }
        }
        output += decoder.decode();

        const match = output.match(/Physical size:\s*(\d+)x(\d+)/);
        if (!match) return null;
        
        return { deviceWidth: Number(match[1]), deviceHeight: Number(match[2]) };
    };

    const takeScreenshot = async () => {
        if (!adb) return null;

        const output = await adb.subprocess.shellProtocol?.spawn("screencap -p");
        if (!output) return null;

        const chunks: Uint8Array[] = [];
        const reader = output.stdout.getReader();

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) chunks.push(value);
            }
        } finally {
            reader.releaseLock();
        }

        const screenshot = mergeChunks(chunks);
        const blob = new Blob([screenshot.buffer as ArrayBuffer], {
            type: "image/png",
        });

        return URL.createObjectURL(blob);
    };

    const value = useMemo(
        () => ({
            adb,
            isReady,
            initialize,
            deinitialize,
            tapScreen,
            takeScreenshot,
            getDeviceDimensions
        }),
        [adb, isReady]
    );

    return <AdbContext.Provider value={value}>{children}</AdbContext.Provider>;
};
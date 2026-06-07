import type { Adb } from '@yume-chan/adb';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { AdbContext } from './adbContext';

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
	const [deviceName, setDeviceName] = useState<string | null>(null);
	const isReady = !!adb;

	const initialize = useCallback((adb: Adb, name: string) => {
		setAdb(adb);
		setDeviceName(name);
	}, []);

	const deinitialize = useCallback(() => setAdb(null), []);

	const tapScreen = useCallback(
		async (x: number, y: number) => {
			if (!adb) return;
			await adb.subprocess.shellProtocol?.spawn(`input tap ${x} ${y}`);
		},
		[adb],
	);

	const getDeviceDimensions = useCallback(async () => {
		if (!adb?.subprocess?.shellProtocol) return null;
		const process = await adb.subprocess.shellProtocol.spawn('wm size');
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
	}, [adb]);

	const takeScreenshot = useCallback(async () => {
		if (!adb) return null;
		const output = await adb.subprocess.shellProtocol?.spawn('screencap -p');
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
			type: 'image/png',
		});
		return URL.createObjectURL(blob);
	}, [adb]);

	const value = useMemo(
		() => ({
			adb,
			deviceName,
			isReady,
			initialize,
			deinitialize,
			tapScreen,
			takeScreenshot,
			getDeviceDimensions,
		}),
		[
			adb,
			deviceName,
			isReady,
			deinitialize,
			getDeviceDimensions,
			initialize,
			takeScreenshot,
			tapScreen,
		],
	);

	return <AdbContext.Provider value={value}>{children}</AdbContext.Provider>;
};

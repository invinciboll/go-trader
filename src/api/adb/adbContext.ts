import type { Adb } from '@yume-chan/adb';
import { createContext } from 'react';

export type AdbContextValue = {
	adb: Adb | null;
	deviceName: string | null;
	isReady: boolean;
	initialize: (adb: Adb, name: string) => void;
	deinitialize: () => void;
	tapScreen: (x: number, y: number) => Promise<void>;
	takeScreenshot: () => Promise<string | null>;
	getDeviceDimensions: () => Promise<{
		deviceWidth: number;
		deviceHeight: number;
	} | null>;
};

export const AdbContext = createContext<AdbContextValue | null>(null);

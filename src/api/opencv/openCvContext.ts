import { createContext } from "react";
import type { TradeStep } from "../statemachine/constants";

export type MatchResult = {
  score: number;
  location: { x: number; y: number };
  width: number;
  height: number;
};

export type OpenCvContextValue = {
  isReady: boolean;
  userDeviceRes: {width: number, height: number};
  selectMonYOffset: number;
  initialize: (remoteTradeButtonVisible: boolean, deviceWidth: number, deviceHeight: number) => void;
  deinitialize: () => void;
  findMatchInScreenshot: (screenshotUrl: string, tradeStep: TradeStep | 'special' | "expired" | "sizeRecord") => Promise<MatchResult>;
  drawMatchOnScreenshot: (screenshotUrl: string, match: MatchResult, accept: boolean) => Promise<string>
};

export const OpenCvContext = createContext<OpenCvContextValue | null>(null);
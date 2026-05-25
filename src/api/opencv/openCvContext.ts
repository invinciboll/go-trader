import { createContext } from "react";

export type MatchResult = {
  score: number;
  location: { x: number; y: number };
  width: number;
  height: number;
};

export type OpenCvContextValue = {
  isReady: boolean;
  initialize: (deviceWidth: number, deviceHeight: number) => void;
  findMatchInScreenshot: (screenshotUrl: string, buttonUrl: string) => Promise<MatchResult>;
  drawMatchOnScreenshot: (screenshotUrl: string, match: MatchResult, accept: boolean) => Promise<string>
};

export const OpenCvContext = createContext<OpenCvContextValue | null>(null);
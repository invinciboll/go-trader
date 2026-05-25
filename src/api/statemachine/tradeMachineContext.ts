import { createContext } from "react";
import type { TradeMachineState, TradeStep } from "./constants";

export type TradeMachineContextValue = {
    isReady: boolean,
    currentMachineState: TradeMachineState,
    currentTradeIndex: number,
    currentTradeStep: TradeStep,
    currentScreenshotUrl: string | null,
    errorMsg: string | null,
    start: (numberOfTrades: number) => Promise<void>,
    stop: () => void,
    reset: () => void,
};

export const TradeMachineContext = createContext<TradeMachineContextValue | null>(null);
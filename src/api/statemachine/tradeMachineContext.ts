import { createContext } from "react";
import type { TradeMachineState, TradeStep } from "./constants";

export type TradeMachineContextValue = {
    isReady: boolean,
    currentMachineState: TradeMachineState,
    currentTradeIndex: number,
    currentTradeStep: TradeStep | null,
    currentScreenshotUrl: string | null,
    tradeAmount: number,
    start: (numberOfTrades: number) => Promise<void>,
    stop: () => void,
    reset: () => void,
};

export const TradeMachineContext = createContext<TradeMachineContextValue | null>(null);
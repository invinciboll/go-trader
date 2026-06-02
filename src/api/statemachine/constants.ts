export type TradeMachineState = "OFF" | "RUNNING" | "SUCCESS" | "STOPPED" | "ERROR";
export const MAX_RETRIES = 100;
export const RETRY_DELAY_MS = 2000
export const SCREENSHOT_FAIL_DELAY_MS = 2000;


export const TradeStep = {
  START_TRADE: 0,
  SELECT_MON: 1,
  CONFIRM_MON: 2,
  CONFIRM_TRADE: 3,
  CLOSE: 4,
} as const;

type TradeStepName = keyof typeof TradeStep;
type TradeStepValue = (typeof TradeStep)[TradeStepName];
export const TradeStepName = Object.fromEntries(
    Object.entries(TradeStep).map(([k, v]) => [v, k])
) as Record<TradeStepValue, TradeStepName>;

export type TradeStep = (typeof TradeStep)[keyof typeof TradeStep];

export const STEPS_IN_ORDER = Object.values(TradeStep) as TradeStep[];

const BASE = import.meta.env.BASE_URL;

export const TEMPLATES: Record<TradeStep | "special" | "expired" | "sizeRecord", string> = {
  [TradeStep.START_TRADE]: `${BASE}templates/s0.png`,
  [TradeStep.SELECT_MON]: `${BASE}templates/s1.png`,
  [TradeStep.CONFIRM_MON]: `${BASE}templates/s2.png`,
  [TradeStep.CONFIRM_TRADE]: `${BASE}templates/s3.png`,
  [TradeStep.CLOSE]: `${BASE}templates/s4.png`,
  ["sizeRecord"]: `${BASE}templates/s4b.png`,
  ["special"]: `${BASE}templates/special.png`,
  ["expired"]: `${BASE}templates/expired.png`,
};

export const EXCEPTION_TEMPLATES: Record<string, string> = {
  ["expired"]: `${BASE}templates/expired.png`,
  ["special"]: `${BASE}templates/special.png`,
};


export const MATCH_THRESHOLDS: Record<TradeStep | "special" | "expired" | "sizeRecord", number> = {
  [TradeStep.START_TRADE]: 0.9,
  [TradeStep.SELECT_MON]: 0.9,
  [TradeStep.CONFIRM_MON]: 0.9,
  [TradeStep.CONFIRM_TRADE]: 0.9,
  [TradeStep.CLOSE]: 0.9,
  ["sizeRecord"]: 0.9,
  ["special"]: 0.9,
  ["expired"]: 0.9,
};

export const DELAY_AFTER_TAP: Record<TradeStep, number> = {
  [TradeStep.START_TRADE]: 2000,
  [TradeStep.SELECT_MON]: 500,
  [TradeStep.CONFIRM_MON]: 1000,
  [TradeStep.CONFIRM_TRADE]: 8000,
  [TradeStep.CLOSE]: 1000,
};

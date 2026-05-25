import {
  Button,
  Card,
  Flex,
  InputNumber,
  Progress,
  Tag,
  type ProgressProps,
} from "antd";
import TradeProgress from "./TradeProgress";
import Connect from "./Connect";
import type { Adb } from "@yume-chan/adb";
import { useState } from "react";
import DevicePreview from "./DevicePreview";
import { useStateMachine } from "../useStateMachine";

const TradingWindow: React.FC = () => {
  const [adb, setAdb] = useState<Adb | null>(null);
  const [tradeAmount, setTradeAmount] = useState(1);
  const {
    currentState,
    step,
    screenshotUrl,
    completedTrades,
    error,
    start,
    stop,
  } = useStateMachine(adb);

  const ready = adb != null ? true : false;

  let progressStatus: ProgressProps["status"] = "normal";
  if (currentState === "error") {
    progressStatus = "exception";
  } else {
    if (currentState === "running") {
      progressStatus = "active";
    }
    if (completedTrades === tradeAmount) {
      progressStatus = "success";
    }
  }

  return (
    <Flex vertical gap="large">
      <Connect adb={adb} setAdb={setAdb} />
      {adb && (
        <Flex gap="small" align="center">
          <InputNumber
            min={1}
            max={100}
            value={tradeAmount}
            onChange={(v) => setTradeAmount(v ?? 1)}
            disabled={currentState === "running" || !ready}
          />
          <Button
            onClick={() =>
              currentState === "running" ? stop() : start(tradeAmount)
            }
            disabled={!ready}
          >
            {currentState === "running" ? "Abort" : "Start"}
          </Button>
          {currentState !== "off" && (
            <>
              <Progress
                style={{ width: 200 }}
                percent={Math.floor((completedTrades / tradeAmount) * 100)}
                status={progressStatus}
                showInfo={false}
              />
              <Tag>
                {completedTrades} / {tradeAmount}
              </Tag>
            </>
          )}
        </Flex>
      )}
      {adb && currentState !== "off" && (
        <Flex gap={64} align="center" justify="center">
          <DevicePreview
            currentState={currentState}
            screenshotUrl={screenshotUrl}
          />
          <TradeProgress step={step} currentState={currentState} />

          {currentState === "error" && (
            <Card
              title={currentState}
              variant="borderless"
              style={{ width: 300 }}
            >
              <p>{error}</p>
            </Card>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default TradingWindow;

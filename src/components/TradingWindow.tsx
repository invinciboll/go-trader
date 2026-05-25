import {
  Button,
  Card,
  Flex,
  InputNumber,
  Progress,
  Tag,
  Form,
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
        <Flex gap={80} align="center">
          <Card title="Trade Settings" variant="borderless" style={{ width: 300 }}>
            <Form layout="vertical">
              <Form.Item label="Input number of trades">
                <InputNumber
                  min={1}
                  max={100}
                  value={tradeAmount}
                  onChange={(v) => setTradeAmount(v ?? 1)}
                  disabled={currentState === "running" || !ready}
                />
              </Form.Item>

              {/* <Form.Item label="Max number of retries per step">
                <InputNumber
                  min={10}
                  max={100}
                  value={retriesAmount}
                  onChange={(v) => setRetriesAmount(v ?? 10)}
                  disabled={currentState === "running" || !ready}
                />

              </Form.Item> */}

              <Form.Item>
                <Button
                  type="primary"
                  onClick={() =>
                    currentState === "running" ? stop() : start(tradeAmount)
                  }
                  disabled={!ready}
                >
                  {currentState === "running" ? "Abort" : "Start"}
                </Button>
              </Form.Item>

              {currentState !== "off" && currentState !== "stopped" && <Form.Item label="Trade Progress">
                <Flex align="center" gap={8}>
                  <Progress
                    percent={Math.floor((completedTrades / tradeAmount) * 100)}
                    status={progressStatus}
                    showInfo={false}
                  />
                  <Tag>
                    {completedTrades} / {tradeAmount}
                  </Tag>
                </Flex>
              </Form.Item>}
            </Form>
          </Card>
          {currentState !== "off" && currentState !== "stopped" && <DevicePreview
            currentState={currentState}
            screenshotUrl={screenshotUrl}
          />}
          {currentState !== "off" && currentState !== "stopped" && <TradeProgress step={step} currentState={currentState} />}
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

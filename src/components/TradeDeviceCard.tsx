import { Card, Flex, Skeleton, Timeline } from "antd";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";
import { useOpenCv } from "../api/opencv/useOpenCv";

import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import type { TradeMachineState } from "../api/statemachine/constants";
import TradeGlobalProgress from "./TradeGlobalProgress";


const deriveIcon = (
  index: number,
  step: number | null,
  currentState: TradeMachineState | null,
) => {
  if (step == null) {
    return <ClockCircleOutlined />;
  }

  // Done, always green success.
  if (currentState === "SUCCESS") {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />;
  }

  // In Progress
  if (index === step) {
    return currentState === "ERROR" ? (
      <CloseCircleFilled style={{ color: "red" }} />
    ) : currentState === "STOPPED" ? (
      <ExclamationCircleOutlined />
    ) : (
      <LoadingOutlined />
    );
  }
  if (index > step) {
    return currentState === "ERROR" || currentState === "STOPPED" ? (
      <ExclamationCircleOutlined style={{ color: "grey" }} />
    ) : (
      <ClockCircleOutlined />
    );
  }
  if (index < step) {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />;
  }
};

const TradeDeviceCard = () => {
  const {
    currentMachineState,
    currentTradeStep,
    currentScreenshotUrl,
  } = useTradeMachine();
  const { userDeviceRes } = useOpenCv();

  const previewMaxWidth = 200;
  const previewMaxHeight = 380;

  const { width: devW, height: devH } = userDeviceRes;

  // Scale by whichever dimension is the limiting factor; fall back to a portrait box pre-resolution
  const factor =
    devW && devH ? Math.min(previewMaxWidth / devW, previewMaxHeight / devH) : null;

  const previewWidth = factor ? devW * factor : previewMaxWidth;
  const previewHeight = factor ? devH * factor : previewMaxHeight;

  const items = [
    "Starting Trade",
    "Selecting Mon",
    "Confirming Mon",
    "Confirming Trade",
    "Closing",
  ].map((content, index) => ({
    content,
    icon: deriveIcon(index, currentTradeStep, currentMachineState),
  }));


  return (
    <Card title={currentMachineState.toLowerCase()} extra={
      <div style={{ width: 200 }}><TradeGlobalProgress /> </div>}>
      <Flex gap={40} align="center">
        {currentScreenshotUrl ? (
          <img
            src={currentScreenshotUrl}
            alt="device screenshot"
            style={{
              width: previewWidth,
              height: previewHeight,
              objectFit: "contain",
              borderRadius: 16,
            }}
          />
        ) : (
          <Skeleton.Image
            active
            style={{ width: previewWidth, height: previewHeight, borderRadius: 16 }}
          />
        )}
        <Flex vertical>
          <Timeline orientation="vertical" items={items} mode="start" />
        </Flex>
      </Flex>
    </Card>
  );
}

export default TradeDeviceCard;



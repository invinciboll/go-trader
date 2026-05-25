import React from "react";
import { Timeline } from "antd";
import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { useTradeMachine } from "../api/statemachine/useTradeMachine";
import type { TradeMachineState } from "../api/statemachine/constants";

const deriveIcon = (
  index: number,
  step: number,
  currentState: TradeMachineState,
) => {
  if (currentState === "SUCCESS") {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />;
  }

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

const TradeProgress: React.FC  = () => {
  const { currentMachineState, currentTradeStep } = useTradeMachine();

  if (currentMachineState === "OFF") {
    return null;
  }

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

  return <Timeline orientation="vertical" items={items} mode="start" />;
};
export default TradeProgress;

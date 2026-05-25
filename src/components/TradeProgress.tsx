import React from "react";
import { Timeline } from "antd";
import {
  CheckCircleTwoTone,
  ClockCircleOutlined,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { MachineState } from "../useStateMachine";

const deriveIcon = (
  index: number,
  step: number,
  currentState: MachineState,
) => {
  if (currentState === "success") {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />;
  }

  if (index === step) {
    return currentState === "error" ? (
      <CloseCircleFilled style={{ color: "red" }} />
    ) : currentState === "stopped" ? (
      <ExclamationCircleOutlined />
    ) : (
      <LoadingOutlined />
    );
  }
  if (index > step) {
    return currentState === "error" || currentState === "stopped" ? (
      <ExclamationCircleOutlined style={{ color: "grey" }} />
    ) : (
      <ClockCircleOutlined />
    );
  }
  if (index < step) {
    return <CheckCircleTwoTone twoToneColor="#52c41a" />;
  }
};

const TradeProgress: React.FC<{ step: number; currentState: MachineState }> = ({
  step,
  currentState,
}) => {
  const items = [
    "Starting Trade",
    "Selecting Mon",
    "Confirming Mon",
    "Confirming Trade",
    "Closing",
  ].map((content, index) => ({
    content,
    icon: deriveIcon(index, step, currentState),
  }));

  return <Timeline orientation="vertical" items={items} mode="start" />;
};
export default TradeProgress;

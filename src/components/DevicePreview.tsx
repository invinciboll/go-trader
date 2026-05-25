import { Flex, Typography } from "antd";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";

const DevicePreview: React.FC = () => {
  const { currentMachineState, currentScreenshotUrl } = useTradeMachine();
  
  if (!currentScreenshotUrl) return null;

  return (
    <Flex vertical>
      <Typography.Title level={5}>{currentMachineState.toLowerCase()}</Typography.Title>
      <img
        src={currentScreenshotUrl}
        alt="device screenshot"
        style={{ maxWidth: 200, borderRadius: 16 }}
      />
    </Flex>
  );
};

export default DevicePreview;

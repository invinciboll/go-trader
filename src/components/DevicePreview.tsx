import { Flex, Typography } from "antd";
import type { MachineState } from "../useStateMachine";

const DevicePreview: React.FC<{
  screenshotUrl: string | null;
  currentState: MachineState;
}> = ({ screenshotUrl, currentState }) => {
  if (!screenshotUrl) return null;

  return (
    <Flex>
      <Flex vertical>
        <Typography.Title level={5}>{currentState}</Typography.Title>
        <img
          src={screenshotUrl}
          alt="device screenshot"
          style={{ maxWidth: 200, borderRadius: 16 }}
        />
      </Flex>
    </Flex>
  );
};

export default DevicePreview;

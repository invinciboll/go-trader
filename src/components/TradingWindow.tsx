import {
  Card,
  Flex,
} from "antd";
import TradeProgress from "./TradeProgress";
import ConnectSteps from "./Connect";
import DevicePreview from "./DevicePreview";

import { useAdb } from "../api/adb/useAdb";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";
import TradeSettings from "./TradeSettings";

const TradingWindow: React.FC = () => {
  const { isReady: adbReady } = useAdb();
  
  const {
    currentMachineState,
    errorMsg,
  } = useTradeMachine();

  return (
    <Flex vertical gap="large">
      <ConnectSteps />
      {adbReady && (
        <Flex gap={80} align="center">
          {adbReady && <TradeSettings />}
          <DevicePreview />
          <TradeProgress />
          {currentMachineState === "ERROR" && (
            <Card
              title={currentMachineState}
              variant="borderless"
              style={{ width: 300 }}
            >
              <p>{errorMsg}</p>
            </Card>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default TradingWindow;

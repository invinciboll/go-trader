import { Flex, Progress, Tag, type ProgressProps } from "antd";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";

const TradeGlobalProgress = () => {
    const {
        currentMachineState,
        currentTradeIndex,
        tradeAmount,
    } = useTradeMachine();

    let progressStatus: ProgressProps["status"] = "normal";
    if (currentMachineState === "ERROR") {
        progressStatus = "exception";
    } else {
        if (currentMachineState === "RUNNING") {
            progressStatus = "active";
        }
        if (currentTradeIndex === tradeAmount) {
            progressStatus = "success";
        }
    }

    if (currentMachineState === "OFF") {
        return null;
    }

    return (
        <Flex align="center" gap={8}>
            <Progress
                percent={Math.floor((currentTradeIndex / tradeAmount) * 100)}
                status={progressStatus}
                showInfo={false}
            />
            <Tag>
                {currentTradeIndex} / {tradeAmount}
            </Tag>
        </Flex>
    );
}

export default TradeGlobalProgress;
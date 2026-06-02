import { Card, Form, InputNumber, Button, Flex, Tag, Switch } from "antd";
import { useState } from "react";
import { useAdb } from "../api/adb/useAdb";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";
import { useOpenCv } from "../api/opencv/useOpenCv";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { TradeInfoModal } from "./TradeInfoModal";

const TradeSettings: React.FC = () => {
    const { isReady: adbReady, getDeviceDimensions } = useAdb();
    const { isReady: openCvReady, initialize } = useOpenCv();
    const {
        isReady: tmReady,
        currentMachineState,
        start,
        stop,
    } = useTradeMachine();

    const [calibrationInfo, setCalibrationInfo] = useState<{ success: boolean, message: string } | null>(null);
    const [tradeAmount, setTradeAmount] = useState(0);
    const [remoteTradeButtonVisible, setRemoteTradeButtonVisible] = useState(false);
    const [needRecalibrate, setNeedRecalibrate] = useState(false);
    const [tradeInfoModalVisible, setTradeInfoModalVisible] = useState(false);
    const [userConfirmedPrep, setUserConfirmedPrep] = useState(false);
    const [progressVisible, setProgressVisible] = useState(false);

    const handleCalibrate = async () => {
        const dimensions = await getDeviceDimensions()
        if (!dimensions) {
            setCalibrationInfo({ success: false, message: "Calibration failed" })
            return;
        }
        initialize(remoteTradeButtonVisible, dimensions.deviceWidth, dimensions.deviceHeight);
        setCalibrationInfo({ success: true, message: `${dimensions.deviceWidth}px / ${dimensions.deviceHeight}px` })
        setNeedRecalibrate(false); // might have to move up
    }

    return (
        <Card title="Trade Settings" variant="borderless" style={{ width: 300 }}>
            <Form layout="vertical">
                <Form.Item label="Number of trades">
                    <InputNumber
                        min={1}
                        max={100}
                        value={tradeAmount}
                        onChange={(v) => {
                            setTradeAmount(v ?? 1);
                            if (progressVisible) setProgressVisible(false);
                        }}
                        disabled={currentMachineState === "RUNNING" || !adbReady}
                    />
                </Form.Item>

                <Form.Item label="Remote trade button visible">
                    <Switch disabled={currentMachineState === "RUNNING"} value={remoteTradeButtonVisible} onChange={() => { setRemoteTradeButtonVisible((prev) => !prev); setNeedRecalibrate(true) }} />
                </Form.Item>
                <Form.Item label="Calibrate for your device">
                    <Flex gap={8} align="center">
                        <Button
                            type="primary"
                            onClick={handleCalibrate}
                            disabled={!adbReady || currentMachineState === "RUNNING"}
                            icon={needRecalibrate && calibrationInfo ? <ExclamationCircleOutlined /> : null}
                        >
                            {needRecalibrate && calibrationInfo ? "Recalibrate" : "Calibrate"}
                        </Button>
                        {calibrationInfo && !needRecalibrate && <Tag color={calibrationInfo?.success ? "green" : "red"} variant={"outlined"}>
                            {calibrationInfo?.message}
                        </Tag>}
                    </Flex>
                </Form.Item>

                <Form.Item label="Prepared application">
                    <Switch disabled={currentMachineState === "RUNNING"} onClick={() => localStorage.getItem('hide-trade-info-modal') === "true" || userConfirmedPrep ? {} : setTradeInfoModalVisible(true)} value={userConfirmedPrep} onChange={setUserConfirmedPrep} />
                </Form.Item>


                <Form.Item >
                    <Button
                        style={{ width: "100%" }}
                        type="primary"
                        onClick={() => {
                            if (currentMachineState === "RUNNING") {
                                stop();
                            } else {
                                setProgressVisible(true);
                                start(tradeAmount)
                            }
                        }}
                        disabled={!adbReady || !openCvReady || !tmReady || needRecalibrate || !userConfirmedPrep}
                    >
                        {currentMachineState === "RUNNING" ? "Abort" : "Start"}
                    </Button>
                </Form.Item>
            </Form>
            <TradeInfoModal open={tradeInfoModalVisible} onClose={() => setTradeInfoModalVisible(false)} />
        </Card>
    )
};

export default TradeSettings;
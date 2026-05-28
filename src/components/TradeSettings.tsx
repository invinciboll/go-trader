import { Card, Form, InputNumber, Button, Flex, Progress, Tag, type ProgressProps, Switch } from "antd";
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
        currentTradeIndex,
        start,
        stop,
    } = useTradeMachine();

    const [calibrationInfo, setCalibrationInfo] = useState<{ success: boolean, message: string } | null>(null);
    const [tradeAmount, setTradeAmount] = useState(0);
    const [remoteTradeButtonVisible, setRemoteTradeButtonVisible] = useState(false);
    const [needRecalibrate, setNeedRecalibrate] = useState(false);
    const [tradeInfoModalVisible, setTradeInfoModalVisible] = useState(false);
    const [userConfirmedPrep, setUserConfirmedPrep] = useState(false);

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

    return <Card title="Trade Settings" variant="borderless" style={{ width: 300 }}>
        <Form layout="vertical">
            <Form.Item label="Number of trades">
                <InputNumber
                    min={1}
                    max={100}
                    value={tradeAmount}
                    onChange={(v) => setTradeAmount(v ?? 1)}
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
                <Switch disabled={currentMachineState === "RUNNING"} onClick={setTradeInfoModalVisible} value={userConfirmedPrep} onChange={setUserConfirmedPrep}/>
            </Form.Item>


            <Form.Item >
                <Button
                    style={{ width: "100%" }}
                    type="primary"
                    onClick={() =>
                        currentMachineState === "RUNNING" ? stop() : start(tradeAmount)
                    }
                    disabled={!adbReady || !openCvReady || !tmReady || needRecalibrate || !userConfirmedPrep}
                >
                    {currentMachineState === "RUNNING" ? "Abort" : "Start"}
                </Button>
            </Form.Item>
            {/* {currentMachineState} {tmReady ? "tmRdy" : "tmOff"} {adbReady ? "adbRdy" : "adbOff"} {openCvReady ? "cvRdy" : "cvOff"} */}
            {currentMachineState !== "OFF" && currentMachineState !== "STOPPED" && <Form.Item label="Trade Progress">
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
            </Form.Item>}
        </Form>
        <TradeInfoModal open={tradeInfoModalVisible} onClose={() => setTradeInfoModalVisible(false)}/>
    </Card>
};

export default TradeSettings;
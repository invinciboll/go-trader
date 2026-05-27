import { Card, Form, InputNumber, Button, Flex, Progress, Tag, type ProgressProps, Switch, Modal, Typography } from "antd";
import { useState } from "react";
import { useAdb } from "../api/adb/useAdb";
import { useTradeMachine } from "../api/statemachine/useTradeMachine";
import { useOpenCv } from "../api/opencv/useOpenCv";



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
        initialize(dimensions.deviceWidth, dimensions.deviceHeight);
        setCalibrationInfo({ success: true, message: `${dimensions.deviceWidth}px / ${dimensions.deviceHeight}px` })
    }

    const openInfoModal = async () => {
        Modal.info({
            title: "Prepare your phone",
            width: 600,
            content: <>
                <Typography.Title level={5}>1. Trade button visible?</Typography.Title>
                <Typography.Text>Make sure the button to start a trade is visible and not covered by other buttons (e.g. the close button on small devices).</Typography.Text>
                <Typography.Title level={5}>2. Complete one manual trade</Typography.Title>
                <Typography.Text>Complete one manual trade so the search string or tag remains in the mon selection menu.</Typography.Text>
            </>
            
        })
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

            <Form.Item label="Calibrate for your device">
                <Flex gap={8} align="center">
                    <Button
                        type="primary"
                        onClick={handleCalibrate}
                        disabled={!adbReady || currentMachineState === "RUNNING"}
                    >
                        Calibrate
                    </Button>
                    {calibrationInfo && <Tag color={calibrationInfo?.success ? "green" : "red"} variant={"outlined"}>
                        {calibrationInfo?.message}
                    </Tag>}
                </Flex>
            </Form.Item>

            {/* <Form.Item label="Prepared trade window">
                <Switch onClick={openInfoModal}/>
            </Form.Item> */}


            <Form.Item >
                <Button
                    style={{width: "100%"}}
                    type="primary"
                    onClick={() =>
                        currentMachineState === "RUNNING" ? stop() : start(tradeAmount)
                    }
                    disabled={!adbReady || !openCvReady || !tmReady}
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
    </Card>
};

export default TradeSettings;
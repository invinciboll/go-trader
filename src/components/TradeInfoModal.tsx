import { useState } from "react";
import { Modal, Typography, Checkbox, Flex } from "antd";

interface Props {
    open: boolean;
    onClose: () => void;
}

export function TradeInfoModal({ open, onClose }: Props) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleOk = () => {
        if (dontShowAgain) {
            localStorage.setItem("hide-trade-info-modal", "true");
        }
        onClose();
    };

    return (
        <Modal
            title="Prepare your phone"
            open={open}
            width={600}
            onOk={handleOk}
            onCancel={onClose}
            cancelButtonProps={{ style: { display: "none" } }}
            okText={"I'm ready"}
            footer={(_, { OkBtn }) => (
                <Flex align="center" justify="end" gap={16}>
                    <Checkbox
                        checked={dontShowAgain}
                        onChange={(e) => setDontShowAgain(e.target.checked)}
                    >
                        Don't show this again
                    </Checkbox>
                    <OkBtn />
                </Flex>
            )}
        >
            <>
                <Typography.Title level={5}>1. Prepare tag or search string </Typography.Title>
                <Typography.Text>Group all trade eligable mons in a tag or prepare a search string to filter the mon selection menu.</Typography.Text>
                <Typography.Title level={5}>2. Trade button must be visible</Typography.Title>
                <Typography.Text>Make sure the button to start a trade is visible and not covered by other buttons (e.g. the close button on small devices).</Typography.Text>
                <Typography.Title level={5}>3. Complete one manual trade</Typography.Title>
                <Typography.Text>Complete one manual trade so the search string or tag remains in the mon selection menu. </Typography.Text>
                <Typography.Text strong>The usage of a tag or any text in the search box is mandatory for the detection algorithm! </Typography.Text>
            </>
        </Modal>
    );
}
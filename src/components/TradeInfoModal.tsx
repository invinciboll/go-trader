import { Modal, Typography } from "antd";

interface Props {
    open: boolean;
    onClose?: () => void;
}

export function TradeInfoModal({ open, onClose }: Props) {
    return (
        <Modal
            title="Prepare your phone"
            open={open}
            width={600}
            onOk={onClose}
            onCancel={onClose}
            cancelButtonProps={{ style: { display: "none" } }}
            okText={"I'm ready"}
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


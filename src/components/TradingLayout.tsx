import { Flex } from 'antd';

import { useAdb } from '../api/adb/useAdb';
import { useOpenCv } from '../api/opencv/useOpenCv';
import TradeDeviceCard from './TradeDeviceCard';
import { TradeLogger } from './TradeLogger';
import TradeSettings from './TradeSettings';

const TradingLayout: React.FC = () => {
	const { isReady: adbReady } = useAdb();
	const { isReady: deviceCalibrated } = useOpenCv();

	const maxHeight = 480;

	if (!adbReady) return null;

	return (
		<Flex gap={60} align="top" justify="start" style={{ height: maxHeight }}>
			<TradeSettings />
			{deviceCalibrated && (
				<>
					<TradeDeviceCard />
					<TradeLogger title="Trade Log" style={{ flex: 1 }} maxHeight={430} />
				</>
			)}
		</Flex>
	);
};

export default TradingLayout;

import { App as AntApp, ConfigProvider, Flex, Layout, theme } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import { AdbProvider } from './api/adb/adbProvider';
import { OpenCvProvider } from './api/opencv/openCvProvider';
import { TradeMachineProvider } from './api/statemachine/tradeMachineProvider';
import InfoText from './components/InfoText';
import TradingLayout from './components/TradingLayout';

import './index.css';
import { LoggerProvider } from './api/logger/logger';
import ConnectSteps from './components/Connect';
import { AppHeader } from './Header';

function App() {
	const [isDark, setIsDark] = useState(
		localStorage.getItem('dark-mode') === 'true',
	);

	useEffect(() => {
		document.body.style.backgroundColor = isDark ? '#000' : '#fff';
	}, [isDark]);

	const setDarkMode = (checked: boolean) => {
		localStorage.setItem('dark-mode', String(checked));
		setIsDark(checked);
	};

	return (
		<ConfigProvider
			theme={{
				algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
			}}
		>
			<AntApp>
				<Layout>
					<AppHeader isDark={isDark} setDarkMode={setDarkMode} />
					<Content
						style={{ paddingLeft: 150, paddingRight: 150, paddingBottom: 80 }}
					>
						<LoggerProvider>
							<AdbProvider>
								<OpenCvProvider>
									<TradeMachineProvider>
										<Flex justify="center" vertical gap={60}>
											<InfoText />
											<ConnectSteps />
											<TradingLayout />
										</Flex>
									</TradeMachineProvider>
								</OpenCvProvider>
							</AdbProvider>
						</LoggerProvider>
					</Content>
				</Layout>
			</AntApp>
		</ConfigProvider>
	);
}

export default App;

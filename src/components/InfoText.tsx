import { Typography } from 'antd';
import type React from 'react';

const { Title, Paragraph, Link } = Typography;

const InfoText: React.FC = () => (
	<Typography>
		<Title level={3}>How does it work?</Title>
		<Paragraph>
			GO-TRADER automates button inputs on android devices to. It periodically
			captures screenshots via WebADB, uses OpenCV to locate specific buttons in
			those images, and then triggers touch input on the device, so no manual
			tapping is required.
		</Paragraph>

		<Title level={3}>What about your data?</Title>
		<Paragraph>
			Everything runs locally in your browser, no data is sent to any server.
			The full source code is available on{' '}
			<Link target="_blank" href="https://github.com/invinciboll/go-trader">
				GitHub.
			</Link>
		</Paragraph>

		<Title level={3}>Prerequisites</Title>
		<Paragraph>
			<ul>
				<li>USB Cable to connect your phone.</li>
				<li>
					Android device with USB Debugging enabled. Learn how to{' '}
					<Link
						target="_blank"
						href="https://developer.android.com/studio/debug/dev-options"
					>
						enable USB Debugging.
					</Link>
				</li>
				<li>
					Chromium based Browser, like{' '}
					<Link target="_blank" href="https://www.google.com/chrome">
						Google Chrome.
					</Link>
				</li>
			</ul>
		</Paragraph>

		<Title level={3}>Limitations</Title>
		<Paragraph>
			<ul>
				<li>Currently only one device can be connected at a time.</li>
			</ul>
		</Paragraph>
	</Typography>
);

export default InfoText;



import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph, Link } = Typography;


const InfoText: React.FC = () => (
  <Typography>
    <Title level={3}>How does it work?</Title>
    <Paragraph>
      Go-Trader automates button inputs on android devices. It periodically captures
      screenshots via WebADB, uses OpenCV to locate specific buttons in those images, and
      then triggers touch input on the device, so no manual tapping is required.
    </Paragraph>

    <Title level={3}>What about your data?</Title>
    <Paragraph>
      Everything runs locally in your browser, no data is sent to any server. The full
      source code is available on{' '}
      <Link target="_blank" href="https://github.com/invinciboll/go-trader">
        GitHub
      </Link>
      .
    </Paragraph>

    <Title level={3} >Prerequisites</Title>
    <Paragraph>
      <ul>
        <li>
          USB Cable to connect your phone.
        </li>
        <li>
          Android device with USB Debugging enabled. Learn how to <Link target="_blank" href="https://developer.android.com/studio/debug/dev-options">enable USB Debugging.</Link>
        </li>
        <li>
          Chromium based Browser, like  <Link target="_blank" href="https://www.google.com/chrome">Google chrome.</Link>
        </li>
      </ul>
    </Paragraph>
  </Typography>
);

export default InfoText;
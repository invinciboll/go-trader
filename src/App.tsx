import { Flex, Layout, Switch, Typography } from "antd";
import { Header, Content } from "antd/es/layout/layout";
import TradingWindow from "./components/TradingWindow";
import InfoText from "./components/InfoText";
import { AdbProvider } from "./api/adb/adbProvider";
import { OpenCvProvider } from "./api/opencv/openCvProvider";
import { TradeMachineProvider } from "./api/statemachine/tradeMachineProvider";

import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";
import { MoonFilled, SunOutlined } from "@ant-design/icons";

import "./index.css"



function App() {
  const [isDark, setIsDark] = useState(localStorage.getItem('dark-mode') === "true");

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? "#000" : "#fff";
  }, [isDark]);

  const setDarkMode = (checked: boolean) => {
    localStorage.setItem('dark-mode', String(checked));
    setIsDark(checked);
  }

  return (
    <ConfigProvider theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <Layout>
        <Header style={{ display: "flex", alignItems: "center", paddingLeft: 150, paddingRight: 150 }}>
          <Typography.Title level={4} style={{ margin: 0, color: "white", flex: 1 }}>
            Go Trader
          </Typography.Title>
          <Flex align="center" gap={8}>
            {isDark ? <SunOutlined style={{ color: "white" }} /> : <MoonFilled style={{ color: "white" }} />}
            <Switch value={isDark} onChange={setDarkMode} />
          </Flex>
        </Header>
        <Content style={{ paddingLeft: 150, paddingRight: 150, paddingBottom: 40 }}>
          <AdbProvider>
            <OpenCvProvider>
              <TradeMachineProvider>
                <Flex justify="center" vertical>
                  <InfoText />
                  <TradingWindow />
                </Flex>
              </TradeMachineProvider>
            </OpenCvProvider>
          </AdbProvider>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

export default App;

import { Flex, Layout, Typography } from "antd";
import { Header, Content, Footer } from "antd/es/layout/layout";
import TradingWindow from "./components/TradingWindow";
import InfoText from "./components/InfoText";
import { AdbProvider } from "./api/adb/adbProvider";
import { OpenCvProvider } from "./api/opencv/openCvProvider";
import { TradeMachineProvider } from "./api/statemachine/tradeMachineProvider";


function App() {
  return (
    <Layout>
      <Header style={{ paddingLeft: 250, paddingRight: 250, backgroundColor: "white" }}>
        <Flex align="center">
          <Typography.Title level={1} style={{ margin: 0 }}>
            Go Trader
          </Typography.Title>
        </Flex>
      </Header>
      <Content style={{ paddingLeft: 250, paddingRight: 250, paddingBottom: 40 }}>
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
      <Footer style={{ backgroundColor: "white" }}></Footer>
    </Layout>
  );
}

export default App;

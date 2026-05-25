import { Flex, Layout, Typography } from "antd";
import { Header, Content, Footer } from "antd/es/layout/layout";
import TradingWindow from "./components/TradingWindow";
import InfoText from "./components/InfoText";


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
        <Flex justify="center" vertical>
          <InfoText />
          <TradingWindow />
        </Flex>
      </Content>
      <Footer style={{ backgroundColor: "white" }}></Footer>
    </Layout>
  );
}

export default App;

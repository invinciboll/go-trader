import { Flex, Layout, Typography } from "antd";
import { Header, Content, Footer } from "antd/es/layout/layout";
import TradingWindow from "./components/TradingWindow";

function App() {
  return (
    <Layout>
      <Header style={{ backgroundColor: "white" }}>
        <Typography.Title level={1} style={{ margin: 0 }}>
          PoGo Trader
        </Typography.Title>
      </Header>
      <Content style={{ padding: 100 }}>
        <Flex justify="center" vertical gap={96}>
          <TradingWindow />
        </Flex>
      </Content>
      <Footer style={{ backgroundColor: "white" }}></Footer>
    </Layout>
  );
}

export default App;

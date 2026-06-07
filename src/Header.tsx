import { SunOutlined, MoonFilled } from "@ant-design/icons";
import { theme, Layout, Typography, Flex, Switch } from "antd";

const { Header } = Layout;

export function AppHeader({ isDark, setDarkMode }: { isDark: boolean; setDarkMode: (c: boolean) => void }) {
    const { token } = theme.useToken();
    return (
        <Header
            style={{
                display: "flex",
                alignItems: "center",
                paddingLeft: 150,
                paddingRight: 150,
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                justifyContent: "space-between"
            }}
        >
            <Flex gap={16} align="center">
                <Typography.Title level={4} style={{ margin: 0, color: token.colorText, flex: 1 }}>
                    Go Trader
                </Typography.Title>
                <Typography.Text style={{fontSize: 8, fontFamily: "monospace"}}>
                    build {__BUILD_NUMBER__}
                </Typography.Text>
            </Flex >
            <Flex align="center" gap={8}>
                {isDark ? <SunOutlined style={{ color: token.colorText }} /> : <MoonFilled style={{ color: token.colorText }} />}
                <Switch checked={isDark} onChange={setDarkMode} />
            </Flex>
        </Header >
    );
}
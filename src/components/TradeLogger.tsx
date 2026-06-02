import { useEffect, useRef } from "react";
import { Card, Tag, Typography, theme } from "antd";
import { useLogger, type LogLevel } from "../api/logger/logger";

const { Text } = Typography;
const { useToken } = theme;

interface TradeLoggerProps {
    title?: string;
    maxHeight?: number;
    style?: React.CSSProperties;
}

const levelConfig: Record<LogLevel, { color: string; label: string }> = {
    info: { color: "blue", label: "INFO" },
    success: { color: "success", label: "OK" },
    warning: { color: "warning", label: "WARN" },
    error: { color: "error", label: "ERROR" },
};

// Semantic colors that read well on both backgrounds
const levelStyle: Record<LogLevel, React.CSSProperties> = {
    info: { color: "inherit" },
    success: { color: "#52c41a" },
    warning: { color: "#d48806" },
    error: { color: "#ff4d4f" },
};

export const TradeLogger = ({ title = "Log", style, maxHeight }: TradeLoggerProps) => {
    const { logs } = useLogger();
    const { token } = useToken();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [logs]);

    return (
        <Card title={title} variant="borderless" style={style} styles={{ body: { padding: 0 } }}>
            <div
                ref={scrollRef}
                style={{
                    maxHeight,
                    overflowY: "auto",
                    padding: "8px 0",
                    fontFamily: "monospace",
                    fontSize: 12,
                    background: token.colorBgContainer,
                    color: token.colorText,
                    borderRadius: `0 0 ${token.borderRadiusLG}px ${token.borderRadiusLG}px`,
                }}
            >
                {logs.length === 0 ? (
                    <div style={{ padding: "12px 16px", color: token.colorTextDescription }}>
                        Waiting for output…
                    </div>
                ) : (
                    logs.map((entry) => (
                        <div
                            key={entry.id}
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: 8,
                                padding: "2px 12px",
                                lineHeight: "20px",
                                ...levelStyle[entry.level],
                            }}
                        >
                            <Text
                                style={{
                                    color: token.colorTextDescription,
                                    fontSize: 11,
                                    fontFamily: "monospace",
                                    flexShrink: 0,
                                }}
                            >
                                {entry.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })}
                            </Text>
                            <Tag
                                color={levelConfig[entry.level].color}
                                style={{ fontSize: 10, lineHeight: "16px", margin: 0, flexShrink: 0 }}
                            >
                                {levelConfig[entry.level].label}
                            </Tag>
                            <span style={{ wordBreak: "break-word" }}>{entry.message}</span>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};
import { createContext, useContext, useState, type ReactNode } from "react";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface LogEntry {
    id: number;
    timestamp: Date;
    level: LogLevel;
    message: string;
}

const LoggerContext = createContext<ReturnType<typeof useLoggerState> | null>(null);

let _id = 0;
function useLoggerState() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const append = (level: LogLevel, message: string) =>
        setLogs(prev => [...prev, { id: _id++, timestamp: new Date(), level, message }]);
    return {
        logs,
        log: (m: string) => append("info", m),
        ok: (m: string) => append("success", m),
        warn: (m: string) => append("warning", m),
        err: (m: string) => append("error", m),
        clear: () => setLogs([]),
    };
}

export const LoggerProvider = ({ children }: { children: ReactNode }) => (
    <LoggerContext.Provider value={useLoggerState()}>{children}</LoggerContext.Provider>
);

export const useLogger = () => {
    const ctx = useContext(LoggerContext);
    if (!ctx) throw new Error("useLogger must be used within LoggerProvider");
    return ctx;
};
import { createLogger, format, Logger, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const loggers = new Map<string, Logger>();

export function getLogger(
    name: string,
    logFiles = true,
    levels = ["error", "warn", "info", "verbose", "debug", "silly"],
): Logger {
    if (loggers.has(name)) return loggers.get(name)!;

    const logger = createLogger({
        levels: levels.reduce(
            (acc, level, index) => {
                acc[level] = index;
                return acc;
            },
            {} as { [key: string]: number },
        ),
        transports: [
            new transports.Console({
                level: "info",
                format: format.combine(
                    format.colorize({ all: true }),
                    format.timestamp({
                        format: "YYYY-MM-DD HH:mm:ss",
                    }),
                    format.printf(
                        (info) => `[${info["timestamp"]}] [${name.toUpperCase()}] ${info.level}: ${info.message}`,
                    ),
                ),
            }),
        ],
    });

    if (logFiles) {
        logger.add(
            new DailyRotateFile({
                filename: path.join(__dirname, "..", "..", "logs", name, "%DATE%.log"),
                maxSize: "32m",
                maxFiles: "7d",
                level: "debug",
                format: format.combine(
                    format.timestamp({
                        format: "YYYY-MM-DD HH:mm:ss",
                    }),
                    format.printf((info) => `[${info["timestamp"]}] ${info.level}: ${info.message}`),
                ),
            }),
        );
    }

    loggers.set(name, logger);
    logger.debug("=".repeat(55));

    return logger;
}

import fs from "node:fs";
import winston from "winston";
import { redactSensitiveData } from "../utils/masking.js";
import path from "node:path";
import chalk from "chalk";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

export interface LoggerOptions {
  level?: string;
  silent?: boolean;
  file?: string;
}

type ChalkColor =
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright";

const levelColorMap: Record<string, (text: string) => string> = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  http: chalk.cyan,
  verbose: chalk.magenta,
  debug: chalk.gray,
  silly: chalk.gray.dim,
};

const maskFormat = winston.format((info) => {
  if (typeof info.message === "string") {
    info.message = redactSensitiveData(info.message);
  }
  return info;
});

const fileFormat = winston.format.printf((info) => {
  const { level, message, timestamp, color, ...meta } = info as any;
  const metaKeys = Object.keys(meta || {});
  const metaStr = metaKeys.length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${String(level).toUpperCase()}]: ${message}${metaStr}`;
});

const consoleFormat = winston.format.printf((info) => {
  const { level, message, timestamp, color, ...meta } = info as any;
  const colorize = levelColorMap[level] || chalk.white;
  let formattedMessage = message;

  // Apply custom color if specified
  if (color && chalk[color as ChalkColor]) {
    formattedMessage = (chalk[color as ChalkColor] as any)(message);
  }

  const metaKeys = Object.keys(meta || {});
  const metaStr = metaKeys.length ? ` ${JSON.stringify(meta)}` : "";

  return `${chalk.dim(timestamp)} ${colorize(String(level).toUpperCase())}: ${formattedMessage}${metaStr}`;
});

export class Logger {
  private logger: winston.Logger;
  private isSilent: boolean = false;

  constructor(options: LoggerOptions = {}) {
    const level = options.level || "info";
    this.isSilent = options.silent || false;

    const errorFormat = winston.format((info) => {
      if (info instanceof Error) {
        return Object.assign({}, info, {
          message: info.message,
          stack: info.stack,
        });
      }
      if (info.error instanceof Error) {
        info.message += `\n${info.error.stack}`;
      }
      return info;
    });

    this.logger = winston.createLogger({
      levels: logLevels,
      level: level,
      format: winston.format.combine(
        errorFormat(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        maskFormat(),
      ),
      transports: this.createTransports(options.file),
      silent: this.isSilent,
    });

    // Add colors to winston
    winston.addColors({
      error: "red",
      warn: "yellow",
      info: "blue",
      http: "cyan",
      verbose: "magenta",
      debug: "gray",
      silly: "gray",
    });
  }

  error(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.error(message, { ...meta, color });
  }

  warn(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.warn(message, { ...meta, color });
  }

  info(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.info(message, { ...meta, color });
  }

  http(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.http(message, { ...meta, color });
  }

  verbose(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.verbose(message, { ...meta, color });
  }

  debug(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.debug(message, { ...meta, color });
  }

  silly(message: string, meta?: any, color?: ChalkColor): void {
    this.logger.silly(message, { ...meta, color });
  }

  setSilent(silent: boolean): void {
    this.isSilent = silent;
    this.logger.silent = silent;
  }

  getWinstonLogger(): winston.Logger {
    return this.logger;
  }

  private createTransports(filePath?: string): winston.transport[] {
    const transports: winston.transport[] = [];

    if (filePath) {
      // File transport
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      transports.push(
        new winston.transports.File({
          filename: filePath,
          format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            maskFormat(),
            fileFormat,
          ),
        }),
      );
    } else {
      // Console transport
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: "HH:mm:ss" }),
            maskFormat(),
            consoleFormat,
          ),
          stderrLevels: Object.keys(logLevels), // Redirect all log levels to stderr
        }),
      );
    }

    return transports;
  }
}

export const createLogger = (options: LoggerOptions = {}): Logger => {
  return new Logger(options);
};

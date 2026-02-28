import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const level = () => {
  try {
    const { config } = require("@config/index");
    return config.server.isDevelopment ? "debug" : "warn";
  } catch (error) {
    // Config not initialized yet (early module load)
    return "debug";
  }
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white"
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error"
  }),
  new winston.transports.File({ filename: "logs/all.log" })
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

export default logger;

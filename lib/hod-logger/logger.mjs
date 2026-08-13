/**
 * Browser and Foundry VTT logger with shared configuration and optional
 * per-instance context.
 *
 * Static methods use the configured default system ID:
 *   HodLogger.configure({
 *     systemId: "outside-the-wire",
 *     logLevel: HodLogger.LOG_LEVEL.DEBUG,
 *   });
 *   HodLogger.info("System initialized");
 *
 * Instance methods use their own system ID:
 *   const logger = new HodLogger("creator");
 *   logger.debug("Attribute roll", roll);
 */
export class HodLogger {
  static LOG_LEVEL = Object.freeze({
    DEBUG: 10,
    INFO: 20,
    WARN: 40,
    ERROR: 60,
  });

  static #LEVEL_CONFIG = Object.freeze({
    [HodLogger.LOG_LEVEL.DEBUG]: Object.freeze({
      name: "DEBUG",
      consoleMethod: "debug",
      notificationMethod: null,
      badgeStyle: "background: green; color: white;",
      messageStyle: "background: lightgreen; color: black;",
    }),
    [HodLogger.LOG_LEVEL.INFO]: Object.freeze({
      name: "INFO",
      consoleMethod: "info",
      notificationMethod: "info",
      badgeStyle: "background: blue; color: white;",
      messageStyle: "background: lightblue; color: black;",
    }),
    [HodLogger.LOG_LEVEL.WARN]: Object.freeze({
      name: "WARN",
      consoleMethod: "warn",
      notificationMethod: "warn",
      badgeStyle: "background: yellow; color: black;",
      messageStyle: "background: lightyellow; color: black;",
    }),
    [HodLogger.LOG_LEVEL.ERROR]: Object.freeze({
      name: "ERROR",
      consoleMethod: "error",
      notificationMethod: "error",
      badgeStyle: "background: red; color: white;",
      messageStyle: "background: #ffcccb; color: black;",
    }),
  });

  static #logLevel = HodLogger.LOG_LEVEL.INFO;
  static #defaultSystemId = "";

  #systemId;

  constructor(systemId) {
    this.#systemId = HodLogger.#normalizeSystemId(systemId);
  }

  /**
   * Configure the ID used by static calls and the shared minimum log level.
   */
  static configure({ systemId, logLevel = HodLogger.LOG_LEVEL.INFO } = {}) {
    HodLogger.#defaultSystemId = HodLogger.#normalizeSystemId(systemId);
    HodLogger.#assertLogLevel(logLevel);
    HodLogger.#logLevel = logLevel;
  }

  /**
   * Backward-compatible form of configure().
   */
  static init(systemId, logLevel = HodLogger.LOG_LEVEL.INFO) {
    HodLogger.configure({ systemId, logLevel });
  }

  static setLevel(logLevel) {
    HodLogger.#assertLogLevel(logLevel);
    HodLogger.#logLevel = logLevel;
  }

  setSystemId(systemId) {
    this.#systemId = HodLogger.#normalizeSystemId(systemId);
    return this;
  }

  static debug(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.DEBUG, message, data);
  }

  static info(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.INFO, message, data);
  }

  static warn(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.WARN, message, data);
  }

  static error(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.ERROR, message, data);
  }

  static notifyInfo(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.INFO, message, data, true);
  }

  static notifyWarn(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.WARN, message, data, true);
  }

  static notifyError(message, ...data) {
    HodLogger.#writeDefault(HodLogger.LOG_LEVEL.ERROR, message, data, true);
  }

  debug(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.DEBUG, message, data);
  }

  info(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.INFO, message, data);
  }

  warn(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.WARN, message, data);
  }

  error(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.ERROR, message, data);
  }

  notifyInfo(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.INFO, message, data, true);
  }

  notifyWarn(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.WARN, message, data, true);
  }

  notifyError(message, ...data) {
    this.#writeContext(HodLogger.LOG_LEVEL.ERROR, message, data, true);
  }

  static #writeDefault(logLevel, message, data, notify = false) {
    HodLogger.#write({
      systemId: HodLogger.#defaultSystemId,
      logLevel,
      message,
      data,
      notify,
    });
  }

  #writeContext(logLevel, message, data, notify = false) {
    HodLogger.#write({
      systemId: this.#systemId,
      logLevel,
      message,
      data,
      notify,
    });
  }

  static #write({ systemId, logLevel, message, data, notify = false }) {
    HodLogger.#assertLogLevel(logLevel);
    const levelConfig = HodLogger.#LEVEL_CONFIG[logLevel];

    if (logLevel >= HodLogger.#logLevel) {
      const consoleTarget = globalThis.console;
      const consoleMethod = consoleTarget?.[levelConfig.consoleMethod];
      if (typeof message === "object") {
        data.splice(0, 0, message);
        message = "";
      }

      if (typeof consoleMethod === "function") {
        consoleMethod.call(
          consoleTarget,
          `%c${levelConfig.name}%c ${systemId} | ${message} `,
          `${levelConfig.badgeStyle} padding: 5px;`,
          `${levelConfig.messageStyle} padding: 5px 0;`,
          ...data,
        );
      }
    }

    if (notify && levelConfig.notificationMethod) {
      const notifications = globalThis.ui?.notifications;
      const notificationMethod =
        notifications?.[levelConfig.notificationMethod];

      if (typeof notificationMethod === "function") {
        notificationMethod.call(notifications, String(message));
      }
    }
  }

  static #normalizeSystemId(systemId) {
    if (typeof systemId !== "string" || systemId.trim() === "") {
      throw new TypeError("HodLogger systemId must be a non-empty string.");
    }

    return systemId.trim().toUpperCase().replaceAll("-", " ");
  }

  static #assertLogLevel(logLevel) {
    if (!Object.hasOwn(HodLogger.#LEVEL_CONFIG, logLevel)) {
      throw new RangeError(`Unknown HodLogger log level: ${logLevel}`);
    }
  }
}

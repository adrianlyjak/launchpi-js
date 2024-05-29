export interface Logger {
  silly(s: string, attributes?: any): void;
  debug(s: string, attributes?: any): void;
  info(s: string, attributes?: any): void;
  warn(s: string, attributes?: any): void;
  error(s: string, attributes?: any): void;
}

const levels = ["SILLY", "DEBUG", "INFO", "WARN", "ERROR"] as const;
const configuredLevel = levels.indexOf("INFO");

export function createLogger(label: string): Logger {
  function out(
    level: "SILLY" | "DEBUG" | "INFO" | "WARN" | "ERROR",
    s: String,
    attributes?: any
  ): void {
    if (levels.indexOf(level) >= configuredLevel) {
      const message = `${level} ${new Date().toISOString()} [${label}] ${s}`;
      if (attributes) {
        console.log(message, attributes);
      } else {
        console.log(message);
      }
    }
  }
  return {
    silly(s: String, attributes?: any): void {
      out("SILLY", s, attributes);
    },
    debug(s: String, attributes?: any): void {
      out("DEBUG", s, attributes);
    },
    info(s: String, attributes?: any): void {
      out("INFO", s, attributes);
    },
    warn(s: String, attributes?: any): void {
      out("WARN", s, attributes);
    },
    error(s: String, attributes?: any): void {
      out("ERROR", s, attributes);
    },
  };
}

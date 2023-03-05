export interface Logger {
  debug(s: string, attributes?: any): void;
}

export function createLogger(label: string): Logger {
  return {
    debug(s: String, attributes?: any): void {
      const message = `DEBUG ${new Date().toISOString()} [${label}] ${s}`;
      if (attributes) {
        console.log(message, attributes);
      } else {
        console.log(message);
      }
    },
  };
}

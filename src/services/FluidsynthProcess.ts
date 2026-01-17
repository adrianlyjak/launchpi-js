import { spawn, ChildProcess } from "child_process";
import net from "net";
import { createLogger } from "../logger";

const logger = createLogger("FluidsynthProcess");

const FLUIDSYNTH_CMD = "/usr/bin/fluidsynth";
const SOUNDFONT_PATH = "/usr/share/sounds/sf2/GeneralUser_GS_v1.471.sf2";

export interface FluidsynthProcess {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
  readonly shellPort: number;
}

export interface FluidsynthProcessOptions {
  shellPort?: number;
  audioBackend?: string;
}

async function waitForPort(port: number, timeoutMs: number = 10000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(500);
        socket.on("connect", () => {
          socket.destroy();
          resolve();
        });
        socket.on("error", reject);
        socket.on("timeout", () => {
          socket.destroy();
          reject(new Error("timeout"));
        });
        socket.connect(port, "127.0.0.1");
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`Timed out waiting for port ${port}`);
}

export function createFluidsynthProcess(
  options?: FluidsynthProcessOptions
): FluidsynthProcess {
  const shellPort = options?.shellPort ?? 9800;
  const audioBackend = options?.audioBackend ?? "pulseaudio";

  let childProcess: ChildProcess | null = null;

  return {
    shellPort,

    async start() {
      if (childProcess) {
        logger.warn("FluidSynth already running");
        return;
      }

      logger.info("Starting FluidSynth...");

      childProcess = spawn(
        FLUIDSYNTH_CMD,
        [
          "-a",
          audioBackend,
          "-m",
          "alsa_seq",
          SOUNDFONT_PATH,
          "-o",
          `shell.port=${shellPort}`,
          "--server",
          "-i",
          "-p",
          "fluid",
        ],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      childProcess.stdout?.on("data", (data) => {
        logger.debug(`stdout: ${data.toString().trim()}`);
      });

      childProcess.stderr?.on("data", (data) => {
        logger.warn(`stderr: ${data.toString().trim()}`);
      });

      childProcess.on("exit", (code, signal) => {
        logger.info(`FluidSynth exited with code ${code}, signal ${signal}`);
        childProcess = null;
      });

      childProcess.on("error", (err) => {
        logger.error("FluidSynth process error", err);
        childProcess = null;
      });

      await waitForPort(shellPort);
      logger.info("FluidSynth started and shell port ready");
    },

    async stop() {
      if (!childProcess) {
        logger.debug("FluidSynth not running, nothing to stop");
        return;
      }

      logger.info("Stopping FluidSynth...");
      const proc = childProcess;
      childProcess = null;

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          logger.warn("FluidSynth did not exit gracefully, sending SIGKILL");
          proc.kill("SIGKILL");
          resolve();
        }, 5000);

        proc.on("exit", () => {
          clearTimeout(timeout);
          resolve();
        });

        proc.kill("SIGTERM");
      });

      logger.info("FluidSynth stopped");
    },

    isRunning() {
      return childProcess !== null;
    },
  };
}

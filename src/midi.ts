import React, { createElement as el } from "react";
import { WithSynthAndGrid } from "./components/WithSynthAndGrid";
import { createLogger } from "./logger";
import { HamfistAppPage } from "./pages/HamfistPage";
import { Container, render, waitForGridController } from "./react/render";
import { FluidsynthAudio } from "./services/FluidsynthAudio";
import {
  createFluidsynthProcess,
  FluidsynthProcess,
} from "./services/FluidsynthProcess";

const logger = createLogger(__filename);

async function renderIt() {
  // Start FluidSynth before initializing app
  const fluidsynthProcess = createFluidsynthProcess();
  await fluidsynthProcess.start();

  // Handle graceful shutdown
  const shutdown = async () => {
    logger.info("Shutting down...");
    await fluidsynthProcess.stop();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  const container = await waitForGridController();
  render(container, el(App, { container, fluidsynthProcess }));
}

const App: React.FC<{
  container: Container;
  fluidsynthProcess: FluidsynthProcess;
}> = ({ container, fluidsynthProcess }) => {
  return el(WithSynthAndGrid, {
    grid: container.grid,
    gridController: container.gridController,
    fluidsynthProcess,
    children: el(HamfistAppPage),
  });
};

renderIt()
  .catch((ex) => {
    logger.error("oops!", ex);
  })
  .then(() => logger.debug("initialization complete"));

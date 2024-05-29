import React, { createElement as el } from "react";
import { WithSynthAndGrid } from "./components/WithSynthAndGrid";
import { createLogger } from "./logger";
import { HamfistAppPage } from "./pages/HamfistPage";
import { Container, render, waitForGridController } from "./react/render";
import { FluidsynthAudio } from "./services/FluidsynthAudio";

async function renderIt() {
  const container = await waitForGridController();
  render(container, el(App, { container }));
}

const App: React.FC<{ container: Container }> = ({ container }) => {
  return el(WithSynthAndGrid, {
    grid: container.grid,
    gridController: container.gridController,
    children: el(HamfistAppPage),
  });
};
const logger = createLogger(__filename);
renderIt()
  .catch((ex) => {
    logger.error("oops!", ex);
  })
  .then(() => logger.debug("initialization complete"));

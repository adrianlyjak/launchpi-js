import { run } from "./presetHamfist";

run()
  .then(() => console.log("done!"))
  .catch((ex) => console.error("oops!", ex));

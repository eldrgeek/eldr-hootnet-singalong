import { createHook } from "overmind-react";
import { state } from "./state";
import { onInitialize } from "./onInitialize";
import * as actions from "./actions";
import * as effects from "./effects";
import { IConfig } from "overmind";
import { createOvermind } from "overmind";
import { merge, namespaced } from "overmind/config";
import messages from "./messages";
export const config = {
  onInitialize,
  state,
  actions,
  effects
};
console.log("messages", messages);
export const app = createOvermind(
  merge(
    config
    // ,namespaced({messages})
  ),
  {
    devtools: navigator.userAgent.match(/ CrOS /)
      ? "penguin.linux.test:3031"
      : "localhost:3031"
  }
);
console.log("Appstate", app.state);
export const useApp = createHook<typeof config>();

declare module "overmind" {
  interface Config extends IConfig<typeof config> {}
}

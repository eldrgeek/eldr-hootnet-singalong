import { createHook } from "overmind-react";
import { state, State } from "./state";
import { onInitialize } from "./onInitialize";
import { actions, Actions } from "./actions";
import * as effects from "./effects";
import { IConfig } from "overmind";
import { createOvermind } from "overmind";
// import { merge, namespaced } from "overmind/config";

export interface Action<argType = void, returnType = void> {
  (
    { state, actions }: { state?: State; actions?: Actions },
    arg?: argType
  ): returnType;
}
// export { State };

export const config = {
  onInitialize,
  state,
  actions,
  effects
};
export const app = createOvermind(
  // merge(
  config,
  // ,namespaced({messages})
  // )
  {
    devtools: navigator.userAgent.match(/ CrOS /)
      ? "penguin.linux.test:3031"
      : "localhost:3031"
  }
);
// console.log("Appstate", app.state);
export const useApp = createHook<typeof config>();

declare module "overmind" {
  interface Config extends IConfig<typeof config> {}
}

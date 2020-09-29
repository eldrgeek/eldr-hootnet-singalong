// import { Action, AsyncAction } from "overmind";

import { State as AppState } from "../state";

interface Action<argType = void, returnType = void> {
  (
    { state, actions }: { state?: AppState; actions?: any },
    arg?: argType
  ): returnType;
}
export type Actions = {
  setText: Action<string>;
  clear: Action;
};

export const actions: Actions = {
  setText: ({ state, actions }, message) => {
    state.messages.text = message;
    if (state.messages.timeout) clearTimeout(state.messages.timeout);
    state.messages.timeout = setTimeout(actions.messages.clear, 1000);
  },
  clear: () => {}
};
export type State = {
  text: string;
  timeout: any;
};

export const state: State = {
  text: "this tex",
  timeout: null
};

import {
  state as messages,
  State as MessagesState
} from "./namespaced/messages";
export type State = {
  messages: MessagesState;
};

export const state: State = {
  messages: messages
};

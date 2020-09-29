import { derived } from "overmind";
import messages, { MessagesState } from "./messages";
export type State = {
  messages: MessagesState;
};

export const state: State = {
  messages: messages.state
};

import {
  state as messages,
  State as MessagesState
} from "./namespaced/messages";
import { state as videos, State as VideosState } from "./namespaced/videos";
import {
  state as _debugger,
  State as DebuggerState
} from "./namespaced/_debugger";

export type State = {
  _debugger: DebuggerState;
  messages: MessagesState;
  videos: VideosState;
};
//
export const state: State = {
  _debugger: _debugger,
  messages: messages,
  videos: videos
};

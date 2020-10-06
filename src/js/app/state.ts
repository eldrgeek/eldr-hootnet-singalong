import {
  state as messages,
  State as MessagesState
} from "./namespaced/messages";
import { state as videos, State as VideosState } from "./namespaced/videos";
import {
  state as _debugger,
  State as DebuggerState
} from "./namespaced/_debugger";
import { state as UI, State as UIState } from "./namespaced/UI";
export type State = {
  _debugger: DebuggerState;
  messages: MessagesState;
  videos: VideosState;
  UI: UIState;
};
//
export const state: State = {
  _debugger,
  messages,
  videos,
  UI
};

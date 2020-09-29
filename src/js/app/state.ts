import {
  state as messages,
  State as MessagesState
} from "./namespaced/messages";
import { state as videos, State as VideosState } from "./namespaced/videos";
export type State = {
  messages: MessagesState;
  videos: VideosState;
};
//
export const state: State = {
  messages: messages,
  videos: videos
};

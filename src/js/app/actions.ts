// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Action, AsyncAction } from "overmind";
// import { State } from "./state";
// import {State} from './state'
// export const changeNewTodoTitle: Action<string> = ({ state }, title) => {
//   state.newTodoTitle = title;
// };
export const setMessage: Action<string, void> = (
  { state, actions },
  value = "default message"
) => {
  state._message.text = value;
  setTimeout(actions.clearMessage, state._message.delay);
};
export const clearMessage: Action = ({ state, actions }: { State }) => {
  state._message.text = "";
};

export type Editor = {
  set: Action<string, void>;
};

export const editor: Editor = {
  set({ state }, text) {
    state.directorText = text;
  }
};
export const PEGEditor: Editor = {
  set({ state }, text) {
    state.directorText = text;
  }
};

type RoomPair = {
  user: string;
  room: string;
};
export type Rooms = {
  join: Action<RoomPair, string>;
  leave: Action<RoomPair>;
  fiddle: AsyncAction<void, string>;
};
export const rooms: Rooms = {
  join({ state }, pair: RoomPair) {
    const { room, user } = pair;
    state._server.rooms[room].push(user);
    return "this";
  },
  leave({ state }, pair: RoomPair) {
    const { room, user } = pair;
    state._server.rooms[room] = state._server.rooms[room].filter(
      (entry) => user !== entry
    );
  },
  async fiddle() {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    //  return Promise.resolve("the string")
    return "this is here her thing";
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { Action, AsyncAction } from "overmind";
// import { State } from "./state";
import {
	actions as messages,
	Actions as MessageActions
} from './namespaced/messages';
import {
	actions as videos,
	Actions as VideoActions
} from './namespaced/videos';
import {
	actions as _debugger,
	Actions as _DebuggerActions
} from './namespaced/_debugger';
import { actions as UI, Actions as UIActions } from './namespaced/UI';
import {
	actions as firebase,
	Actions as FirebaseActions
} from './namespaced/firebase';

export type Actions = {
	messages: MessageActions;
	videos: VideoActions;
	_debugger: _DebuggerActions;
	UI: UIActions;
	firebase: FirebaseActions;
};

export const actions: Actions = {
	messages,
	videos,
	firebase,
	_debugger,
	UI
};

// import {actions as messages} from './namespaced/messages'
// import { State } from "./state";
// import {State} from './state'
// export const changeNewTodoTitle: Action<string> = ({ state }, title) => {
//   state.newTodoTitle = title;
// };
// export const setMessage: Action<string, void> = (
//   { state, actions },
//   value = "default message"
// ) => {
//   state._message.text = value;
//   setTimeout(actions.clearMessage, state._message.delay);
// };
// export const clearMessage: Action = ({ state, actions }: { State }) => {
//   state._message.text = "";
// };

// export type Editor = {
//   set: Action<string, void>;
// };

// export const editor: Editor = {
//   set({ state }, text) {
//     state.directorText = text;
//   }
// };
// export const PEGEditor: Editor = {
//   set({ state }, text) {
//     state.directorText = text;
//   }
// };

// type RoomPair = {
//   user: string;
//   room: string;
// };
// export type Rooms = {
//   join: Action<RoomPair, string>;
//   leave: Action<RoomPair>;
//   fiddle: AsyncAction<void, string>;
// };
// export const rooms: Rooms = {
//   join({ state }, pair: RoomPair) {
//     const { room, user } = pair;
//     state._server.rooms[room].push(user);
//     return "this";
//   },
//   leave({ state }, pair: RoomPair) {
//     const { room, user } = pair;
//     state._server.rooms[room] = state._server.rooms[room].filter(
//       (entry) => user !== entry
//     );
//   },
//   async fiddle() {
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     //  return Promise.resolve("the string")
//     return "this is here her thing";
//   }
// };

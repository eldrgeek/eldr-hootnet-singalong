// import { Action, AsyncAction } from "overmind";

// import { State as AppState } from "../state";

// interface Action<argType = void, returnType = void> {
//   (
//     { state, actions }: { state?: AppState; actions?: any },
//     arg?: argType
//   ): returnType;
// }
import { Action } from '../index';
import { C } from '../../util/1Hz';
const con = C(__filename);
con.warn('loaded');
export interface Actions {
	setText: Action<string>;
	clear: Action;
}

export const actions: Actions = {
	setText: ({ state, actions }, message) => {
		//@ts-ignore
		actions.messages.clear();
		state.messages.text = message;
		//@ts-ignore
		state.messages.timeout = setTimeout(actions.messages.clear, 5000);
	},
	clear: ({ state, actions }) => {
		if (state.messages.timeout) clearTimeout(state.messages.timeout);
		state.messages.timeout = null;
		state.messages.text = '';
	}
};
export interface State {
	text: string;
	timeout: any;
}

export const state: State = {
	text: 'this tex',
	timeout: null
};

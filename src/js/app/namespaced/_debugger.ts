import { Action } from '../index';
// import {  useApp, app } from '../../util/CurrentModule';

export type Element = () => JSX.Element; //eslint-disable-line
type Registration = {
	name: string;
	element: Element;
	path: string;
	show: boolean;
	after?: string;
};
export interface Actions {
	register: Action<Registration>;
	toggleApp: Action;
	toggleShowAll: Action;
}

export const actions: Actions = {
	// @ts-ignore: ignore error TS2339 property does not exist
	register: ({ state, actions }, { name, element, path, show = false }) => {
		const registration = {
			name,
			element,
			path,
			show
		};
		state!._debugger.registrations[name] = registration;
	},
	toggleApp: ({ state }) => {
		state!._debugger.showApp = !state!._debugger.showApp;
	},
	toggleShowAll: ({ state }) => {
		state!._debugger.showAll = !state!._debugger.showAll;
	}
};
export interface State {
	registrations: {
		[id: string]: Registration;
	};
	showApp: boolean;
	showAll: boolean;
}

export const state: State = {
	registrations: {},
	showApp: true,
	showAll: true
};

export default {
	state,
	actions
};

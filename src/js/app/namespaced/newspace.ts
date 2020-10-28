// import { Action } from 'overmind';
// import {  useApp, app } from '../../util/CurrentModule';
import { Action } from '../index';
export type Element = () => JSX.Element; //eslint-disable-line

export interface Actions {
	incr: Action;
}

export const actions: Actions = {
	// @ts-ignore: ignore error TS2339 property does not exist

	incr: ({ state }) => {
		//@ts-ignore
		state.newspace.count++;
	}
};
export interface State {
	count: number;
}

export const state: State = {
	count: 0
};

export default {
	state,
	actions
};

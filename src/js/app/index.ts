import { createHook } from 'overmind-react';
import { state, State } from './state';
import { onInitialize } from './onInitialize';
import { actions } from './actions';
import * as effects from './effects';
import { IConfig } from 'overmind';
import { createOvermind } from 'overmind';
import { merge, namespaced } from 'overmind/config';
import newspace from './namespaced/newspace';
import { registerApp } from '../util/1Hz';
// export { State };

export const config = {
	onInitialize,
	state,
	actions,
	effects
};

export const app = createOvermind(
	merge(
		// config,
		{ state: {}, actions: {}, effects: {} },
		config,
		// namespaced({ name: {state:{} }})
		namespaced({ newspace })
	),
	{
		devtools: navigator.userAgent.match(/ CrOS /)
			? 'penguin.linux.test:3031'
			: 'localhost:3031'
	}
);

console.log(typeof app.state.newspace);
export const useApp = createHook<typeof app>();
registerApp(app, useApp);
app.actions.newspace.incr();
export interface Action<argType = void, returnType = void> {
	(
		{ state, actions }: { state?: State; actions?: typeof app.actions },
		arg?: argType
	): returnType;
}

// console.log("Appstate", app.state);
console.log('COUNT', app.state.newspace.count);

declare module 'overmind' {
	interface Config extends IConfig<typeof app> {}
}

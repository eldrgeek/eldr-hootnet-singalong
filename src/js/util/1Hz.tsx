//@ts-ignore
import React from 'react'; //eslint-disable-line
import { render } from 'react-dom';
import { Provider } from 'overmind-react';
// import { app, useApp } from '../app';
import { C } from './Log';
import { useRadioGroup } from '@material-ui/core';
const con = C(__filename);
con.log('1Hz loaded');
let app, useApp;
export const registerApp = (a, ua) => {
	app = a;
	useApp = ua;
};
// eslint-disable-next-line no-unused-vars
const Nothing = () => {
	return 'The currrent module is 1Hz';
};

//@ts-ignore
const register = (path, element, show) => {
	const name = path.match(/(\w*)\./)[1];
	//@ts-ignore
	app.actions._debugger.register({ name, element, show, path });
};
const useRegistration = (actions, path, element, show) => {
	React.useEffect(() => {
		const name = path.match(/(\w*)\./)[1];
		actions._debugger.register({ name, element, show });
	}, []); //eslint-disable-line
};
//@ts-ignore
const CurrentModule = (Element, props?) => {
	const rootElement = document.getElementById('root');
	render(
		//@ts-ignore
		<Provider value={app}>
			<Element {...props} />
		</Provider>,
		rootElement
	);
};
export { CurrentModule, app, useApp, useRegistration, register, C };
export default CurrentModule;
CurrentModule(Nothing);

if (module.hot) {
	module.hot.dispose((data) => {
		con.log('disposing');
		data.app = app;
		data.useApp = useApp;
	});
	if (module.hot.data) {
		con.log('restoring');
		app = module.hot.data.app;
		useApp = module.hot.data.useApp;
	}
}

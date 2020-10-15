//@ts-ignore
import React from 'react'; //eslint-disable-line
import { render } from 'react-dom';
import { Provider } from 'overmind-react';
import { app, useApp } from '../app';
import { C, CLPrint } from './CL';
CLPrint('loading');
const CL = C(__filename, 'loading');
CL('Current Module Loaded');

// eslint-disable-next-line no-unused-vars
const Nothing = () => {
	return 'The currrent module is Currnet Module';
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
export { CurrentModule, app, useApp, useRegistration, register };
export default CurrentModule;
CurrentModule(Nothing);

import React from 'react';
import { CurrentModule, useApp } from '../util/CurrentModule';
import App from '../components/App';
import DebuggerButton from './DebuggerButton';
import { faPlus, faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';
const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};
CL('App wrapper Loaded');

const Component = () => {
	const { state, actions } = useApp();
	// console.log("call component wraps");
	return (
		<React.Fragment>
			{state._debugger.showApp ? (
				<App />
			) : (
				Object.keys(state._debugger.registrations).map((key) => {
					const EL = state._debugger.registrations[key].element;
					return (
						<div style={{ border: '1px solid black' }} key={key}>
							{state._debugger.registrations[key].name}
							<br />
							<EL key={key} />{' '}
						</div>
					);
				})
			)}
			<br />
			<DebuggerButton onClick={() => actions._debugger.toggleApp()} />
		</React.Fragment>
	);
};
export default Component;
CurrentModule(Component);

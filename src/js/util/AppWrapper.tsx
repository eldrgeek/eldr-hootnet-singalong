//@ts-ignore
import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp } from '../util/CurrentModule';
//@ts-ignore
import AppJoyride from '../components/AppJoyride';
import { Link } from '@material-ui/core';
import ButtonDebugger from './ButtonDebugger';
import ButtonShowAll from './ButtonShowAll';
import { dispatch, actions } from 'codesandbox-api';
//eslint-disable-next-line
import { C } from './CL';
const CL = C(__filename);
CL('this is a test if');

const openFile = (file) => {
	dispatch(actions.editor.openModule(file, 1));
};

const Component = () => {
	const { state, actions } = useApp();
	// console.log("call component wraps");
	return (
		<React.Fragment>
			{state._debugger.showApp ? (
				<AppJoyride />
			) : (
				<div>
					<ButtonShowAll
						onClick={
							//@ts-ignore
							() => actions._debugger.toggleShowAll()
						}
					/>

					{Object.keys(state._debugger.registrations).map((key) => {
						const entry = state._debugger.registrations[key];
						if (!state._debugger.showAll && !entry.show) return null;
						if (entry.path.match(/\/util\//)) return null;
						const EL = state._debugger.registrations[key].element;
						return (
							<div style={{ border: '1px solid black' }} key={key}>
								<EL key={key} />
								<Link
									style={{ marginLeft: '4px' }}
									component="button"
									variant="body2"
									onClick={() => {
										console.log(state._debugger.registrations[key].path);
										openFile(state._debugger.registrations[key].path);
									}}
								>
									{state._debugger.registrations[key].name}
								</Link>
								<br />
							</div>
						);
					})}
				</div>
			)}
			{false ? (
				<div>
					<ButtonDebugger
						onClick={
							//@ts-ignore
							() => actions._debugger.toggleApp()
						}
					/>{' '}
				</div>
			) : null}
		</React.Fragment>
	);
};
export default Component;
CurrentModule(Component);

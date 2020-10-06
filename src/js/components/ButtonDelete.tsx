import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import ButtonBase from './ButtonBase';

import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = ({ id }) => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				buttoncolor="gray"
				disabled={state.videos.recording}
				icon={faTrash}
				onClick={() => actions.videos.delete(id)}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

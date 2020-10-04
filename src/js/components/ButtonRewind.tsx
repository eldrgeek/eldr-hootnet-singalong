import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
import ButtonBase from './ButtonBase';

import { faUndo } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				buttonColor="red"
				disabled={state.videos.location === 0 || state.videos.playing}
				icon={faUndo}
				onClick={actions.videos.rewind}
			/>
		</React.Fragment>
	);
};

export default Component;
CurrentModule(Component);
register(__filename, Component, false);

import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
import ButtonBase from './ButtonBase';

import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				buttonColor="orange"
				disabled={state.videos.recording}
				icon={state.videos.playing ? faPause : faPlay}
				onClick={actions.videos.togglePlay}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

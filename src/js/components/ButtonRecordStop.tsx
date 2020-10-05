import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
import ButtonBase from './ButtonBase';

import { faStopCircle, faRecordVinyl } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	const doRecording = () => {};
	return (
		<React.Fragment>
			<ButtonBase
				buttonColor="red"
				disabled={
					!state.videos.cameraOn ||
					(state.videos.playing && !state.videos.recording)
				}
				icon={state.videos.recording ? faStopCircle : faRecordVinyl}
				onClick={actions.videos.toggleRecording}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
// import { IconButton } from '@material-ui/core';
import ButtonBase from './ButtonBase';
import { faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				disabled={state.videos.recording}
				onClick={actions.videos.toggleCameraOn}
				buttonColor="green"
				icon={state.videos.cameraOn ? faVideoSlash : faVideo}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

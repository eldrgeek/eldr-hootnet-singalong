import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
// import { IconButton } from '@material-ui/core';
import ButtonBase from './ButtonBase';
import { faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				id="button-camera"
				disabled={state.videos.recording}
				//@ts-ignore
				onClick={actions.videos.toggleCameraOn}
				buttoncolor={!state.videos.cameraOn ? 'green' : 'palered'}
				icon={state.videos.cameraOn ? faVideoSlash : faVideo}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

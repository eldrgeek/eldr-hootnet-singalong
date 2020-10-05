import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
// import { IconButton } from '@material-ui/core';
import ButtonBase from './ButtonBase';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				disabled={state.videos.playing || state.videos.addDialogOpen}
				onClick={actions.videos.toggleAddDialog}
				buttonColor="blue"
				icon={faPlus}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

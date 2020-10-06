import React from 'react';

import { CurrentModule, useApp, register } from '../util/CurrentModule';
// import { IconButton } from '@material-ui/core';
import ButtonBase from './ButtonBase';
import { faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@material-ui/core';
import { faChcck } from '@fortawesome/free-solid-svg-icons';
import Text from './Text';
const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	const setValue = (e) => {
		e.persist();
		CL('setting value', e.target.value);
		actions.videos.setVideoTitle(e.target.value);
		// CL('setting', e.target.value);
	};
	return (
		<React.Fragment>
			<Text text={`Enter Video URL`} />
			<br />
			<Input
				onChange={(e) => actions.videos.setVideoTitle(e.target.value)}
				value={state.videos.videoTitle}
				placeholder="Enter video URL"
			/>
			<ButtonBase
				disabled={false}
				onClick={() => actions.videos.add(state.videos.videoTitle)}
				buttonColor="blue"
				icon={faCheck}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

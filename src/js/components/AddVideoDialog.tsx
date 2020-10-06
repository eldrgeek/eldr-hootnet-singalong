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

const Component = ({ addSaveLoad = 'add' }) => {
	const { actions, state } = useApp();
	type Mode = {
		title: string;
		onClick: any;
	};
	const modeNull: Mode = {
		title: 'change title',
		onClick: () => console.log('change')
	};
	const [mode, setMode] = React.useState(modeNull);
	React.useEffect(() => {
		switch (addSaveLoad) {
			case 'loadconfig':
				setMode({
					title: 'Load singalong configuration',
					onClick: () => {
						console.log('Load congig');
					}
				});
				break;
			case 'saveconfig':
				setMode({
					title: 'Save configuration as',
					onClick: () => {
						console.log('Save congig');
					}
				});
				break;
			case 'add':
				setMode({
					title: 'Enter video URL',
					onClick: () => actions.videos.add(state.videos.videoTitle)
				});
				break;
			case 'save':
				setMode({
					title: 'Save file as...',
					onClick: () => {
						console.log('Save congig');
					}
				});
				break;
			case 'load':
		}
	}, []);
	const setValue = (e) => {
		e.persist();
		CL('setting value', e.target.value);
		actions.videos.setVideoTitle(e.target.value);
		// CL('setting', e.target.value);
	};
	return (
		<React.Fragment>
			<Text text={mode.title} />
			<br />
			<Input
				onChange={(e) => actions.videos.setVideoTitle(e.target.value)}
				value={state.videos.videoTitle}
				placeholder="Enter video URL"
			/>
			<ButtonBase
				disabled={false}
				onClick={mode.onClick}
				buttoncolor="blue"
				icon={faCheck}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

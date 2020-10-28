import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register, C } from '../util/CurrentModule'; //eslint-disable-line
import ButtonBase from './ButtonBase';
import { Input } from '@material-ui/core';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
const CL = C(__filename);
const Component = ({ move, id = null }) => {
	const { actions, state } = useApp();

	const clickToCloud = (e) => {
		//@ts-ignore
		actions.firebase.upload({
			path: 'testvideo',
			content: state.videos.videos[id].URL,
			metadata: 'video.webm'
		});
	};
	return (
		<React.Fragment>
			<ButtonBase move={move}
				buttoncolor={id ? 'gray' : 'blue'}
				icon={faCloudUploadAlt}
				//@ts-ignore
				onClick={(e) => clickToCloud(e)}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import ButtonBase from './ButtonBase';

import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = ({ id, move }) => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<ButtonBase
				move={move}
				id="button-delete"
				buttoncolor="gray"
				disabled={state.videos.recording}
				icon={faTrash}
				onClick={() => {
					const url = state.videos.videos[id].URL;
					if (url.match(/^blob:/)) {
						URL.revokeObjectURL(url);
					}
					//@ts-ignore
					actions.videos.delete(id);
				}}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

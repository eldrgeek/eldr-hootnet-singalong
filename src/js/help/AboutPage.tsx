import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import ButtonBase from '../components/ButtonBase';

import { faUndo } from '@fortawesome/free-solid-svg-icons';

//eslint-disable-next-line
const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
	const { actions, state } = useApp();
	return (
		<React.Fragment>
			<a href="https://trello.com/b/EkjlIyIn/hootnet-tasks">Trello tasks</a>
			<ButtonBase
				id="button-close-about"
				buttoncolor="blue"
				icon={faUndo}
				//@ts-ignore
				onClick={actions.UI.toggleAbout}
			/>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

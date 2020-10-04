import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
import { IconButton, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import DeleteIcon from '@material-ui/icons/Delete';

const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};
CL('Icon button registered ');

const Component = ({
	icon = faCoffee,
	onClick = () => console.log('connect this button'),
	disabled = false

	// icon=<QuestionMarkIcon/>
}) => {
	const { state, actions } = useApp();
	// useRegistration(actions, __filename, Component, true);

	// React.useEffect(() => {
	//   actions.videos._test();
	// }, []);
	return (
		<React.Fragment>
			{/* <Hover> */}
			{/* {(isHovered) => ( */}
			{/* // <Box sx={{ height: 9, bg: isHovered ? 'red600' : 'blue600' }}></Box> */}
			<IconButton disabled={disabled} color="primary" onClick={() => onClick()}>
				<FontAwesomeIcon icon={icon} />
			</IconButton>

			{/* )}
      </Hover> */}
		</React.Fragment>
	);
};

// export default Component;

export default Component;
CurrentModule(Component);
register(__filename, Component, true);

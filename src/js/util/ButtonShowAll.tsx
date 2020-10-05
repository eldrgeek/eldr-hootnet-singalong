import React from 'react';
import { CurrentModule, useApp, register } from './CurrentModule';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

import styled from 'styled-components';

const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};

const StyledButton = styled(IconButton)`
	background-color: #ccc;
	color: red;
	border: 1px solid black;
	box-shadow: 0 4px 6px rgba(50, 50, 93, 0.4), 0 1px 3px rgba(0, 0, 0, 0.08);
	padding: 2px 2px;
	/* border: 2px solid black; */
	&:hover {
		background-color: #000;
		border: 1px solid black;
	}
`;

const Component = ({
	onClick = () => console.log('connect this button')
	// icon=<QuestionMarkIcon/>
}) => {
	const { state } = useApp();
	return (
		<React.Fragment>
			<StyledButton color="primary" onClick={() => onClick()}>
				<FontAwesomeIcon icon={state._debugger.showAll ? faEyeSlash : faEye} />
			</StyledButton>
		</React.Fragment>
	);
};

// export default Component;

export default Component;
CurrentModule(Component);
register(__filename, Component, true);

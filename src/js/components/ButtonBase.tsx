import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

const CL = (...args) => {
	console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const StyledButton = styled(IconButton)`
	/* color: ${(props) => props.inputColor || 'palevioletred'}; */
  &&{
	color: ${(props) => props.buttoncolor || 'blue'};
	background-color: ${(props) => props.bg || 'red'};
	border: 1px solid black;
	box-shadow: 0 4px 6px rgba(50, 50, 93, 0.4), 0 1px 3px rgba(0, 0, 0, 0.08);
	padding: 5px 5px;
  margin: 3px; 
	position: ${(props) => (props.move ? 'relative' : undefined)};
  top: ${(props) => (props.move ? props.move : undefined)};
  /* & .MuiIconButton-root {
    color: red;
  } */
	}
	/* border: 2px solid black; */
	&:hover {
		background-color: #eee;
		border: 2px solid black;
	}
`;

const Component = ({
	id = 'none',
	disabled = false,
	onClick = () => CL('make this work'),
	icon = faCamera,
	color = 'red',
	buttoncolor = 'green',
	bg = 'white',
	move = ''
}) => {
	const { actions, state } = useApp(); //eslint-disable-line
	const onClickHandler = (e) => {
		onClick();
	};
	return (
		<React.Fragment>
			<StyledButton
				id={id}
				bg={bg}
				move={move}
				// color={color}
				buttoncolor={!disabled ? buttoncolor : 'gray'}
				disabled={disabled}
				color="primary"
				onClick={onClickHandler}
			>
				<FontAwesomeIcon icon={icon} />
			</StyledButton>
		</React.Fragment>
	);
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, true);

import React from 'react';
import { CurrentModule, useApp, register } from './CurrentModule';
import { IconButton } from '@material-ui/core';
import { SvgIcon } from '@material-ui/core';
import styled from 'styled-components';

const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};

const StyledButton = styled(IconButton)`
	background-color: #ccc;
	color: red;
	border: 1px solid black;
	box-shadow: 0 4px 6px rgba(50, 50, 93, 0.4), 0 1px 3px rgba(0, 0, 0, 0.08);
	padding: 5px 5px;
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
	return (
		<React.Fragment>
			<StyledButton color="primary" onClick={() => onClick()}>
				<SvgIcon>
					<path d="M3.463 12.86l-.005-.07l.005.07zm7.264.69l-3.034-3.049l1.014-1.014l3.209 3.225l3.163-3.163l1.014 1.014l-3.034 3.034l3.034 3.05l-1.014 1.014l-3.209-3.225L8.707 17.6l-1.014-1.014l3.034-3.034z" />
					<path
						// fill-rule="evenodd"
						// clip-rule="evenodd"
						d="M16.933 5.003V6h1.345l2.843-2.842l1.014 1.014l-2.692 2.691l.033.085a13.75 13.75 0 0 1 .885 4.912c0 .335-.011.667-.034.995l-.005.075h3.54v1.434h-3.72l-.01.058c-.303 1.653-.891 3.16-1.692 4.429l-.06.094l3.423 3.44l-1.017 1.012l-3.274-3.29l-.099.11c-1.479 1.654-3.395 2.646-5.483 2.646c-2.12 0-4.063-1.023-5.552-2.723l-.098-.113l-3.209 3.208l-1.014-1.014l3.366-3.365l-.059-.095c-.772-1.25-1.34-2.725-1.636-4.34l-.01-.057H0V12.93h3.538l-.005-.075a14.23 14.23 0 0 1-.034-.995c0-1.743.31-3.39.863-4.854l.032-.084l-2.762-2.776L2.65 3.135L5.5 6h1.427v-.997a5.003 5.003 0 0 1 10.006 0zm-8.572 0V6H15.5v-.997a3.569 3.569 0 0 0-7.138 0zm9.8 2.522l-.034-.09H5.733l-.034.09a12.328 12.328 0 0 0-.766 4.335c0 2.76.862 5.201 2.184 6.92c1.32 1.716 3.036 2.649 4.813 2.649c1.777 0 3.492-.933 4.813-2.65c1.322-1.718 2.184-4.16 2.184-6.919c0-1.574-.28-3.044-.766-4.335z"
					/>
				</SvgIcon>
			</StyledButton>
		</React.Fragment>
	);
};

// export default Component;

export default Component;
CurrentModule(Component);
register(__filename, Component, true);

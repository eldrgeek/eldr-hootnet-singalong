import React from 'react';
import { Typography } from '@material-ui/core';
import { CurrentModule } from '../util/CurrentModule';

export const H1 = (props) => {
	return (
		<Typography align="center" variant="h1" {...props}>
			{props.children}
		</Typography>
	);
};

export const H2 = (props) => {
	return (
		<Typography align="center" variant="h2" {...props}>
			{props.children}
		</Typography>
	);
};
export const H3 = (props) => {
	React.useEffect(() => {
		const tailwind = props.tailwind;
		if (tailwind) {
		}
	});
	return (
		<Typography align="center" variant="h3" {...props}>
			{props.children}
		</Typography>
	);
};
export const H4 = (props) => {
	React.useEffect(() => {
		const tailwind = props.tailwind;
		if (tailwind) {
		}
	});
	return (
		<Typography align="center" variant="h4" {...props}>
			{props.children}
		</Typography>
	);
};
function Test() {
	return <H1>Typography </H1>;
}
CurrentModule(Test);

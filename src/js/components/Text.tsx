import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
// import { Text } from "@modulz/radix";
const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};

CL('Registsering Text');
const Component = ({
	text = 'replace this text',
	onClick = () => console.log('connect this button')
	// icon=<QuestionMarkIcon/>
}) => {
	const { state, actions } = useApp();

	// React.useEffect(() => {
	//   actions.videos._test();
	// }, []);
	return (
		<React.Fragment>
			{/* <Text m={3} p={2} size={5}> */}
			{text}
			{/* </Text> */}
		</React.Fragment>
	);
};
export default Component;
CurrentModule(Component);

register(__filename, Component, true);

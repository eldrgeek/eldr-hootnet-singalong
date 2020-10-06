import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import { Button } from '@material-ui/core';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};
CL('Button registered ');
const Video = ({
	text = <FontAwesomeIcon icon={faCoffee} />,
	onClick = () => console.log('connect this button')
}) => {
	const { state, actions } = useApp(); //eslint-disable-line
	React.useEffect(() => {
		actions.videos._test();
	}, []); //eslint-disable-line
	return (
		<React.Fragment>
			<IconButton color="primary">
				<FontAwesomeIcon icon={faCoffee} />
			</IconButton>
			<Button onClick={() => onClick()}>{text}</Button>
		</React.Fragment>
	);
};
export default Video;
// CurrentModule(Video);s

register(__filename, Video, true);

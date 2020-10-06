import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp } from '../util/CurrentModule'; //eslint-disable-line
import Video from './Video';

const CL = (...args) => {
	//eslint-disable-line
	//eslint-disable-line
	console.log(...args, `(${__filename})`);
};
const Videos = () => {
	const { state, actions } = useApp(); //eslint-disable-line
	React.useEffect(() => {
		// actions.videos._test();
	}, []);
	return (
		<React.Fragment>
			{Object.keys(state.videos.videos).map((key, index) => {
				return <Video key={key} />;
			})}
		</React.Fragment>
	);
};
export default Videos;
// CurrentModule(Videos);

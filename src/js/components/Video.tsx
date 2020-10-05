import React from 'react';
import { CurrentModule, useApp, register } from '../util/CurrentModule';
import { Flex, Box, Text, Button } from '@modulz/radix';
import ReactPlayer from 'react-player';
const testURL = 'https://www.youtube.com/watch?v=ysz5S6PUM-U';
const CL = (...args) => {
	console.log(...args, `(${__filename})`);
};
const Video = ({ url = testURL }) => {
	const { state, actions } = useApp();
	const videoRef = React.useRef({});
	const [isLoaded, setLoaded] = React.useState(false);
	React.useEffect(() => {
		if (state.videos.playing) return;
		try {
			if (videoRef.current && videoRef.current.seekTo && isLoaded)
				videoRef.current.seekTo(0);
		} catch (e) {
			CL('seek', videoRef.current, videoRef.current.seekTo);
		}
	}, [state.videos.location, videoRef]);
	const handlePlay = () => {
		CL('hangle play');
		if (state.videos.playing) return;
		if (isLoaded) return;
		//started from the device
		actions.videos.togglePlay(); // start playing
		setTimeout(() => {
			actions.videos.togglePlay();
			actions.videos.setLocation(0);
			setLoaded(true);
		}, 200);
	};
	return (
		<React.Fragment>
			<ReactPlayer
				controls={true}
				height={'50%'}
				width={'50%'}
				url={url}
				ref={videoRef}
				playing={state.videos.playing}
				onPlay={handlePlay}
				onProgress={(e) => actions.videos.setLocation(e.playedSeconds)}
			/>
		</React.Fragment>
	);
};
export default Video;
// CurrentModule(Video);
// register(__filename, Video, true);

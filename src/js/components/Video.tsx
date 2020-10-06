import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import ReactPlayer from 'react-player';
import ButtonDownload from './ButtonDownload';
import ButtonDelete from './ButtonDelete';

const CL = (...args) => {
	//eslint-disable-line
	//esliint-disable-line
	console.log(...args, `(${__filename})`);
};
const Video = ({ id }) => {
	const { state, actions } = useApp();
	const videoRef = React.useRef({});
	React.useEffect(() => {
		// CL(id, state.videos.videos);
		if (state.videos.videos[id].URL.match(/^blob:/)) {
			CL('BlOB Found', state.videos.videos[id].URL);
			actions.videos.setLoadingState({ id, newState: 'loaded' });
			return;
		}
	}, []);
	React.useEffect(() => {
		// CL(id, state.videos.videos);
		if (state.videos.videos[id].rewinding) {
			videoRef.current.seekTo(0);
			actions.videos.clearRewinding(id);
		}
	}, [state.videos.videos[id].rewinding]); //eslint-disable-line
	const handlePlay = () => {
		if (state.videos.videos[id].loadingState !== 'initial') return;

		//started from the device
		actions.videos.setLoadingState({ id, newState: 'loading' });
		setTimeout(() => {
			actions.videos.setLoadingState({ id, newState: 'loaded' });
			videoRef.current.seekTo(0);
		}, 10);
	};
	return (
		<React.Fragment>
			<ReactPlayer
				style={{
					opacity: state.videos.videos[id].loadingState === 'loaded' ? 1 : 0.2
				}}
				controls={true}
				height={'50%'}
				width={'50%'}
				url={state.videos.videos[id].URL}
				ref={videoRef}
				playing={
					state.videos.videos[id].loadingState === 'loading' ||
					(state.videos.videos[id].loadingState === 'loaded' &&
						state.videos.playing)
				}
				onPlay={handlePlay}
				// onProgress={(e) => actions.videos.setLocation(e.playedSeconds)}
			/>
			<ButtonDownload id={id} />
			<ButtonDelete id={id} />
		</React.Fragment>
	);
};
const testURL = 'https://www.youtube.com/watch?v=o507bg_K6hs';
const VideoWrapper = ({ id }) => {
	const { state, actions } = useApp();
	if (id) return <Video id={id} />;
	const keys = Object.keys(state.videos.videos);
	if (keys.length > 0) {
		return <Video id={keys[0]} />;
	}
	const newKey = actions.videos.add(testURL);
	return <Video id={newKey} />;
};
export default VideoWrapper;
// CurrentModule(Video);
register(__filename, VideoWrapper, true);

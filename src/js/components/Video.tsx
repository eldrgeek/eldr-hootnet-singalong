import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import ReactPlayer from 'react-player';
import ButtonDownload from './ButtonDownload';
import ButtonBase from './ButtonBase';
import ButtonDelete from './ButtonDelete';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
const CL = (...args) => {
	//eslint-disable-line
	//esliint-disable-line
	console.log(...args, `(${__filename})`);
};
const Video = ({ id }) => {
	const { state, actions } = useApp();
	const videoRef = React.useRef({});
	const urlIsBlob = () => state.videos.videos[id].URL.match(/^blob:/);

	React.useEffect(() => {
		// CL(id, state.videos.videos);
		if (urlIsBlob()) {
			//@ts-ignore
			actions.videos.setLoadingState({ id, newState: 'loaded' });
			return;
		}
	}, []); //eslint-disable-line
	React.useEffect(() => {
		// CL(id, state.videos.videos);
		if (state.videos.videos[id].rewinding) {
			//@ts-ignore
			videoRef.current.seekTo(0);
			//@ts-ignore
			actions.videos.clearRewinding(id);
		}
	}, [state.videos.videos[id].rewinding]); //eslint-disable-line
	const handlePlay = () => {
		if (state.videos.videos[id].loadingState !== 'initial') return;

		//started from the device
		//@ts-ignore
		actions.videos.setLoadingState({ id, newState: 'loading' });
		setTimeout(() => {
			//@ts-ignore
			actions.videos.setLoadingState({ id, newState: 'loaded' });
			//@ts-ignore
			videoRef.current.seekTo(0);
		}, 10);
	};
	return (
		<React.Fragment>
			<div style={{ width: '400px', height: '300px' }}>
				{state.videos.videos[id].loadingState === 'loaded' ? (
					<div className="opacity-0 absolute top-0 bg-red-500 w-full h-full">
						{' '}
					</div>
				) : null}
				<ReactPlayer
					style={{
						opacity: state.videos.videos[id].loadingState === 'loaded' ? 1 : 0.2
					}}
					controls={true}
					height={'80%'}
					width={'80%'}
					url={state.videos.videos[id].URL}
					//@ts-ignore
					ref={videoRef}
					playing={
						state.videos.videos[id].loadingState === 'loading' ||
						(state.videos.videos[id].loadingState === 'loaded' &&
							state.videos.playing)
					}
					onPlay={handlePlay}
					// onProgress={(e) => actions.videos.setLocation(e.playedSeconds)}
				/>
				{urlIsBlob() ? (
					<ButtonDownload id={id} />
				) : (
					<ButtonBase icon={faArrowsAlt} />
				)}
				<ButtonDelete id={id} />
			</div>
		</React.Fragment>
	);
};
const testURL = 'https://www.youtube.com/watch?v=o507bg_K6hs';
const VideoWrapper = ({ id }) => {
	const { state, actions } = useApp();
	if (id) return <Video id={id} />;
	CL('Did not return first', id);
	const keys = Object.keys(state.videos.videos);
	if (keys.length > 0) {
		return <Video id={keys[0]} />;
	}
	//@ts-ignore
	const newKey = actions.videos.add(testURL);
	return <Video id={newKey} />;
};
export default VideoWrapper;
// CurrentModule(Video);
register(__filename, VideoWrapper, true);

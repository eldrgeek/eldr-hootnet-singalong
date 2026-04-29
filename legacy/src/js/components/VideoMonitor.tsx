import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp, register } from '../util/CurrentModule'; //eslint-disable-line
import ReactPlayer from 'react-player';
import getCameraStream from '../lib/getCameraStream';
import Blobber from '../lib/blobber';
import ButtonBase from './ButtonBase';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';

import DragWrapper from './DragWrapper';
//eslint-disable-next-line
const CL = (...args) => {
	console.log(...args, __filename);
};
const Monitor = () => {
	const [blobber, setBlobber] = React.useState(null);
	const { state, actions } = useApp();
	const [cameraStream, setCameraStream] = React.useState(null);

	React.useEffect(() => {
		if (state.videos.cameraOn && cameraStream === null) {
			getCameraStream().then((stream) => {
				setCameraStream(stream);
				const b = new Blobber(stream);
				// b.start();
				// b.pause();
				setBlobber(b);
			});
		} else if (!state.videos.cameraOn && cameraStream !== null) {
			cameraStream.getTracks().forEach((track) => track.stop());
			setCameraStream(null);
		}
	}, [state.videos.cameraOn]); //eslint-disable-line

	React.useEffect(() => {
		if (state.videos.recording) {
			blobber.start();
		} else if (blobber) {
			blobber.stopBlobber();
			//@ts-ignore
			actions.videos.add(URL.createObjectURL(new Blob(blobber.blobs)));
			setBlobber(null);
		}
	}, [state.videos.recording]); //eslint-disable-line
	return (
		<React.Fragment>
			{state.videos.cameraOn ? (
				<DragWrapper>
					<ReactPlayer
						height={'250px'}
						width={'400px'}
						muted={true}
						url={cameraStream}
						playing={true}
					/>
					<ButtonBase icon={faArrowsAlt} />
				</DragWrapper>
			) : null}
		</React.Fragment>
	);
};
export default Monitor;
// CurrentModule(Monitor);
register(__filename, Monitor, true);

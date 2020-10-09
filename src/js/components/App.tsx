import React from 'react'; //eslint-disable-line
import { CurrentModule, useApp } from '../util/CurrentModule'; //eslint-disable-line
// import Messages from "./Messages";
import Videos from './Videos';
import ButtonCamera from './ButtonCamera';
import ButtonPlayPause from './ButtonPlayPause';
import ButtonRecordStop from './ButtonRecordStop';
import ButtonRewind from './ButtonRewind';
import VideoMonitor from './VideoMonitor';
import ButtonAddVideo from './ButtonAddVideo';
import AddVideoDialog from './AddVideoDialog';
import ButtonUpload from './ButtonUpload';
import ButtonDownload from './ButtonDownload';
import ButtonJoyride from './ButtonJoyride';
import { H4 } from './Typography';
// import AppJoyride from "./AppJoyride";
//@ts-ignore
const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(${__filename})`);
};
const App = () => {
	// const { state, actions } = useApp();

	return (
		<React.Fragment>
			<div>
				<H4 style={{ display: 'flex', justifyContent: 'center' }}>
					HootNet SingAlong
				</H4>
				<div>
					<ButtonAddVideo />
					<ButtonCamera />
					<ButtonPlayPause />
					<ButtonRecordStop />
					<ButtonRewind />
					<ButtonUpload />
					<ButtonDownload />
					<ButtonJoyride />
				</div>
				<AddVideoDialog />
				<VideoMonitor />
				<br />
				<Videos />
				<br />
				{/* <Videos>
      Videos
      Video
        ReactPlayer
        VideoControls
          Button MUTE
          Button DELETE
          Button SAVE
        LocalPlayer
          Button OFF
    Controls
      Button: ADD
      Button: PLAY
      Button: RECORD
      Button: REWiND
      Button: CAMERA" */}
				{/* <Messages /> */}
			</div>
		</React.Fragment>
	);
};
export default App;
// CurrentModule(App);

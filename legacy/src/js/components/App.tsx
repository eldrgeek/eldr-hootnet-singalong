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
import ButtonDesktop from './ButtonDesktop';
import DragWrapper from './DragWrapper';
import { H4 } from './Typography';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// import AppJoyride from "./AppJoyride";
//@ts-ignore
const CL = (...args) => {
	//eslint-disable-line
	console.log(...args, `(${__filename})`);
};

// const Jitsi = () => {
// 	return (
// 		<div
// 			id="jitsi-div"
// 			style={{ overflow: 'hidden', paddingTop: '125%', position: 'relative' }}
// 		>
// 			<iframe
// 				title="Jitsi"
// 				style={{
// 					height: '100%',
// 					width: '100%',
// 					left: 0,
// 					position: 'absolute',
// 					top: 0
// 				}}
// 				allow="camera; microphone; fullscreen; display-capture"
// 				src="https://meet.jit.si/HootnetTestbed"
// 				// style={{ height: '90%', width: '70%' }}
// 			></iframe>
// 		</div>
// 	);
// };
const App = () => {
	const { state, actions } = useApp();
	React.useEffect(() => {
		//@ts-ignore
		actions.firebase.init();
	}, []);
	return (
		<React.Fragment>
			<div id="appMain" className="w-screen">
				<div id="title">
					<H4 style={{ display: 'flex', justifyContent: 'center' }}>
						HootNet SingAlong
					</H4>
				</div>
				{/* <div id="testdiv" className="h-32 bg-red-500 w-1/3"></div>
				<div classsName="w-screen">
					<DragWrapper>
						<div id="testdiv" className="absolute w-64 h-32 bg-blue-500"></div>
					</DragWrapper>
				</div> */}
				<div
					id="buttonMenu"
					style={{ display: 'flex', justifyContent: 'center' }}
				>
					<ButtonAddVideo />
					<ButtonCamera />
					<ButtonPlayPause />
					<ButtonRecordStop />
					<ButtonRewind />
					<ButtonUpload />
					<ButtonDownload />
					<ButtonJoyride />
					<ButtonDesktop />
				</div>
				{/* <Jitsi /> */}
				{/* <div id="Jitsi"><DragWrapper Element={Jitsi} /></div> */}
				<AddVideoDialog />
				<VideoMonitor />
				<br />
				{/* <TransformWrapper> */}
				<Videos />
				{/* </TransformWrapper> */}
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

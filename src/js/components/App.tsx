import React from 'react';
import { CurrentModule, useApp } from '../util/CurrentModule';
import Messages from './Messages';
import Videos from './Videos';
import IconButton from './IconButton';
import Input from './Input';
import Text from './Text';
import { faPlus, faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';
import { actions } from '../app/namespaced/messages';
const App = () => {
	const { state, actions } = useApp();
	return (
		<React.Fragment>
			This is the app
			<br />
			<IconButton icon={faPlus} />
			<br />
			and here
			{/* <IconButton icon={faCamera} /> */}
			{/* <br /> */}
			<Text text={`Enter Video URL or click button to upload`} />{' '}
			{/* <IconButton icon={faUpload} /> */}
			<Input value={state.videos._testData[0]} placeholder="Enter video URL" />
			{/* <Button text={<PlusIcon/>} onClick={actions.videos.add} /> */}
			{/* <Button text={<CameraIcon />} onClick={actions.videos.deleteAll} /> */}
			<Videos />
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
		</React.Fragment>
	);
};
export default App;
CurrentModule(App);

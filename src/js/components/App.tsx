import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import Messages from "./Messages";
import Videos from "./Videos";
import IconButton from "./IconButton";
import Input from "./Input";
import ButtonCamera from "./ButtonCamera";
import ButtonPlayPause from "./ButtonPlayPause";
import ButtonRecordStop from "./ButtonRecordStop";
import ButtonRewind from "./ButtonRewind";
import VideoMonitor from "./VideoMonitor";
import ButtonAddVideo from "./ButtonAddVideo";
import AddVideoDialog from "./AddVideoDialog";
import ButtonUpload from "./ButtonUpload";
import ButtonDownload from "./ButtonDownload";
const CL = (...args) => {
  console.log(...args, `(${__filename})`);
};
const App = () => {
  // const { state, actions } = useApp();
  return (
    <React.Fragment>
      HootNet Singalong
      <div>
        <ButtonAddVideo />
        <ButtonCamera />
        <ButtonPlayPause />
        <ButtonRecordStop />
        <ButtonRewind />
        <ButtonUpload />
        <ButtonDownload />
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
    </React.Fragment>
  );
};
export default App;
// CurrentModule(App);

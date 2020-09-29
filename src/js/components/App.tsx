import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Heading, Slider } from "@modulz/radix";
import Messages from "./Messages";
import Videos from "./Videos";
import Controls from "./Controls";
const App = () => {
  // const { state } = useApp();
  return (
    <React.Fragment>
      <Heading>Sing Along</Heading>
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
      <Messages />
    </React.Fragment>
  );
};
export default App;
CurrentModule(App);

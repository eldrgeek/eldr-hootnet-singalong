import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Heading, Slider } from "@modulz/radix";
import Messages from "./Messages";
import Videos from "./Videos";
import Button from "./Button";
import { actions } from "../app/namespaced/messages";
const App = () => {
  const { state, actions } = useApp();
  return (
    <React.Fragment>
      <Heading>Sin g Along</Heading>
      <Button text="Add" onClick={actions.videos.add} />
      <Button text="X" onClick={actions.videos.deleteAll} />
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
      <Messages />
    </React.Fragment>
  );
};
export default App;
CurrentModule(App);

import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
import ButtonBase from "./ButtonBase";

import { faStopCircle, faRecordVinyl } from "@fortawesome/free-solid-svg-icons";

const CL = (...args) => {
  //eslint-disable-line
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
  const { actions, state } = useApp();
  return (
    <React.Fragment>
      <ButtonBase
        id="button-record-stop"
        buttoncolor="red"
        disabled={
          !state.videos.cameraOn ||
          (state.videos.playing && !state.videos.recording)
        }
        icon={state.videos.recording ? faStopCircle : faRecordVinyl}
        //@ts-ignore
        onClick={actions.videos.toggleRecording}
      />
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

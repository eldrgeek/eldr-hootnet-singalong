import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
import ButtonBase from "./ButtonBase";

import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

const CL = (...args) => {
  //eslint-disable-line
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
  const { actions, state } = useApp();
  return (
    <React.Fragment>
      <ButtonBase
        id="button-play-pause"
        buttoncolor="orange"
        disabled={state.videos.recording}
        icon={state.videos.playing ? faPause : faPlay}
        //@ts-ignore
        onClick={actions.videos.togglePlay}
      />
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

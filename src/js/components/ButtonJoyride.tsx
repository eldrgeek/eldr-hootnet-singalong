import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
// import { IconButton } from '@material-ui/core';
import ButtonBase from "./ButtonBase";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const CL = (...args) => {
  //eslint-disable-line
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
  const { actions, state } = useApp();
  return (
    <React.Fragment>
      <ButtonBase
        id="button-joyride"
        disabled={state.videos.recording}
        onClick={() => {
          actions.UI.setJoyride(!state.UI.joyride);
        }}
        buttoncolor="blue"
        icon={faInfoCircle}
      />
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

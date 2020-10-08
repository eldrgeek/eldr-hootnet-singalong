import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
// import { IconButton } from '@material-ui/core';
import ButtonBase from "./ButtonBase";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const CL = (...args) => {
  //eslint-disable-line
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
  const { actions, state } = useApp();
  return (
    <React.Fragment>
      <ButtonBase
        id="button-add"
        disabled={state.videos.playing || state.videos.addDialogOpen}
        onClick={() => actions.UI.setDialogType("add")}
        buttoncolor="blue"
        icon={faPlus}
      />
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

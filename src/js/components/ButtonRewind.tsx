import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
import ButtonBase from "./ButtonBase";

import { faUndo } from "@fortawesome/free-solid-svg-icons";

//eslint-disable-next-line
const CL = (...args) => {
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
  const { actions, state } = useApp();
  return (
    <React.Fragment>
      <ButtonBase
        id="button-rewind"
        buttoncolor="red"
        disabled={!state.videos.hasPlayed || state.videos.playing}
        icon={faUndo}
        //@ts-ignore
        onClick={actions.videos.rewind}
      />
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

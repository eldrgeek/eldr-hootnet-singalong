import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
import ButtonBase from "./ButtonBase";
import { Input } from "@material-ui/core";

import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { saveAs } from "file-saver";
const CL = (...args) => {
  //eslint-disable-line
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = ({ id = null }) => {
  const { actions, state } = useApp();
  const computeDisabled = () => {
    if (id) return false;
    let disabled = true;
    const keys = Object.keys(state.videos.videos);
    keys.forEach((key) => {
      if (!state.videos.videos[key].URL.match(/^blob/)) {
        disabled = false;
      }
    });
    return disabled;
  };
  const clickDownload = (e) => {
    if (id) {
      CL("CALLING Saveas");
      saveAs(state.videos.videos[id].URL, "video.webm");
    } else {
      const config = {};
      const keys = Object.keys(state.videos.videos);
      keys.forEach((key) => {
        if (!state.videos.videos[key].URL.match(/^blob/)) {
          config[key] = state.videos.videos[key];
        }
      });
      const file = new File(
        [JSON.stringify(state.videos.videos, null, " ")],
        "hootnet.hoot",
        { type: "application/json" }
      );
      saveAs(file);
    }
  };
  return (
    <React.Fragment>
      <ButtonBase
        buttoncolor={id ? "gray" : "blue"}
        disabled={computeDisabled()}
        icon={faDownload}
        //@ts-ignore
        onClick={(e) => clickDownload(e)}
      />
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

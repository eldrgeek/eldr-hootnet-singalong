import React from "react";

import { CurrentModule, useApp, register } from "../util/CurrentModule";
// import { IconButton } from '@material-ui/core';
import ButtonBase from "./ButtonBase";
import { faCheck, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { Input } from "@material-ui/core";
import { faChcck } from "@fortawesome/free-solid-svg-icons";
import Text from "./Text";
const CL = (...args) => {
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};

const Component = () => {
  const { actions, state } = useApp();
  type Mode = {
    title: string;
    onClick: any;
  };
  const modeNull: Mode = {
    title: "change title",
    onClick: () => console.log("change")
  };
  const [mode, setMode] = React.useState(modeNull);
  React.useEffect(() => {
    switch (state.UI.dialogType) {
      case "loadconfig":
        setMode({
          title: "Load singalong configuration",
          onClick: () => {
            console.log("Load congig");
          }
        });
        break;
      case "saveconfig":
        setMode({
          title: "Save configuration as",
          onClick: () => {
            console.log("Save congig");
          }
        });
        break;
      case "add":
        setMode({
          title: "Enter video URL",
          onClick: () => {
            CL("select the video");
            actions.videos.add(state.videos.videoTitle);
            actions.UI.setDialogType("");
          }
        });
        break;
      case "save":
        setMode({
          title: "Save file as...",
          onClick: () => {
            console.log("Save congig");
          }
        });
        break;
      case "load":
        break;
      default:
        break;
    }
  }, [state.UI.dialogType]);
  const setValue = (e) => {
    e.persist();
    CL("setting value", e.target.value);
    actions.videos.setVideoTitle(e.target.value);
    // CL('setting', e.target.value);
  };
  if (state.UI.dialogType === "") return null;
  return (
    <React.Fragment>
      <div
        style={{ border: "1px solid black", padding: "6px", width: "500px" }}
      >
        <div>
          <Text text={mode.title} />
        </div>
        <div>
          <Input
            style={{ margin: "2px 23px 2px 10px", width: "350px" }}
            id="input-add"
            onChange={(e) => actions.videos.setVideoTitle(e.target.value)}
            value={state.videos.videoTitle}
            placeholder="Enter video URL"
          />
        </div>
        <div>
          <ButtonBase
            id="button-confirm"
            disabled={false}
            onClick={mode.onClick}
            buttoncolor="blue"
            icon={faCheck}
          />
          <ButtonBase
            id="button-cancel"
            disabled={false}
            onClick={() => actions.UI.setDialogType("")}
            buttoncolor="blue"
            icon={faWindowClose}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

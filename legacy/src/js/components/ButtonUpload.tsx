import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
// import { IconButton } from '@material-ui/core';
import ButtonBase from "./ButtonBase";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "@material-ui/core";
// import VideoLibrary from "@material-ui/icons/VideoLibrary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CL = (...args) => {
  //eslint-disable-line
  console.log(...args, `(/src/js/util/CreateModules.tsx)`);
};
const Component = ({ accept = "video/*,.json" }) => {
  const fileSelected = (e) => {
    // Set object URL as the video <source>
    CL("upload click", e.target.files.length, e.target.files);
    const file = e.target.files[0];
    if (file.name.match(/\.(hoot)|(json)$/)) {
      try {
        //@ts-ignore
        const spec = JSON.parse(e.target.files[0]);
      } catch (e) {
        alert("problem parsing the file");
      }
    } else {
      const blob = URL.createObjectURL(e.target.files[0]);
      //@ts-ignore
      actions.videos.add(blob);
    }
    CL("File ", e.target, e.target.files[0].name, e.target.files[0].type);
    e.target.value = "";
  };

  const { actions, state } = useApp();
  return (
    <React.Fragment>
      <input
        accept={accept}
        style={{ display: "none" }}
        id="icon-button-file"
        type="file"
        onChange={fileSelected}
      />

      <label htmlFor="icon-button-file">
        <IconButton
          id="button-upload"
          color="primary"
          aria-label="upload picture"
          component="span"
        >
          <FontAwesomeIcon icon={faUpload} />
        </IconButton>
      </label>
    </React.Fragment>
  );
};

export default Component;
// CurrentModule(Component);
register(__filename, Component, false);

import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Flex, Box, Text, Button } from "@modulz/radix";
import ReactPlayer from "react-player";
const testURL = "https://www.youtube.com/watch?v=ysz5S6PUM-U";

const Video = ({ url = testURL }) => {
  const { state, actions } = useApp();
  React.useEffect(() => {
    actions.videos._test();
  }, []);
  return (
    <React.Fragment>
      <ReactPlayer
        height={"50%"}
        width={"50%"}
        url={url}
        playing={state.videos.playing}
      />
    </React.Fragment>
  );
};
export default Video;
CurrentModule(Video);

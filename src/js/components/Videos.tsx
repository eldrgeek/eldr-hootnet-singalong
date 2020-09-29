import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Flex, Box, Text, Button } from "@modulz/radix";
import Video from "./Video";
const Videos = () => {
  const { state, actions } = useApp();
  React.useEffect(() => {
    actions.videos._test();
  }, []);
  return (
    <React.Fragment>
      {Object.keys(state.videos.videos).map((key) => {
        const vid = state.videos.videos[key];
        return <Video url={vid.URL} />;
      })}
    </React.Fragment>
  );
};
export default Videos;
CurrentModule(Videos);

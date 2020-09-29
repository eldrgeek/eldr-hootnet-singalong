import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Button } from "@modulz/radix";

const Video = ({
  text = "Button",
  onClick = () => console.log("connect this button")
}) => {
  const { state, actions } = useApp();
  React.useEffect(() => {
    actions.videos._test();
  }, []);
  return (
    <React.Fragment>
      <Button onClick={() => onClick()} sx={{ color: "white", bg: "blue600" }}>
        {text}
      </Button>
    </React.Fragment>
  );
};
export default Video;
CurrentModule(Video);

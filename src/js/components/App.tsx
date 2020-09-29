import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Heading, Slider } from "@modulz/radix";
import Messages from "./Messages";
const App = () => {
  // const { state } = useApp();
  return (
    <React.Fragment>
      <Heading>Sing Along</Heading>
      <Messages />
    </React.Fragment>
  );
};
export default App;
CurrentModule(App);

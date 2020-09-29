import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Heading, Slider } from "@modulz/radix";

const App = () => {
  const { state } = useApp();
  const [value, setValue] = React.useState(299);
  return (
    <React.Fragment>
      <Heading>Sing Along</Heading>
    </React.Fragment>
  );
};
export default App;
CurrentModule(App);

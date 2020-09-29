import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Heading, Slider } from "@modulz/radix";

const App = () => {
  const { state } = useApp();
  const [value, setValue] = React.useState(299);
  return (
    <React.Fragment>
      <Heading>
        <Slider
          sx={{ width: 400 }}
          onChange={(e) => console.log("changed", setValue(e.target.value))}
          value={value}
        ></Slider>
        {state.messages.lastMessage}
      </Heading>
    </React.Fragment>
  );
};
export default App;
CurrentModule(App);

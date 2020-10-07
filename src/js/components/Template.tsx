import React from "react";
import { CurrentModule, useApp, register } from "../util/CurrentModule";

const CL = (...args) => {
  console.log(...args, `(${__filename})`);
};

const Component = ({}) => {
  const { state, actions } = useApp();
  return <React.Fragment>stuff</React.Fragment>;
};

// export default Component;

export default Component;
// CurrentModule(Component);
register(__filename, Component, true);

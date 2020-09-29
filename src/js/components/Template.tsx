import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";

const Template = () => {
  const { state, actions } = useApp();
  React.useEffect(() => {}, []);
  return <React.Fragment></React.Fragment>;
};
export default Template;
CurrentModule(Template);

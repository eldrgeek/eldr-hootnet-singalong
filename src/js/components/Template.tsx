import React from "react";
import { CurrentModule, useApp } from "../CurrentModule";

const Template = () => {
  const { state, actions } = useApp();
  return (<React.Fragment>
    {state.title}
    </React.Fragment>)
}
export default Template
CurrentModule(Template);
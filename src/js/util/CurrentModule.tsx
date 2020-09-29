import React from "react";
import { render } from "react-dom";
import { Provider } from "overmind-react";
import { app, useApp } from "../app";
import { RadixProvider } from "@modulz/radix";
// import "../css/index.css";import { RadixProvider } from '@modulz/radix';

// eslint-disable-next-line no-unused-vars
const Nothing = () => {
  return "The currrent module is nothing";
};

const CurrentModule = (Element) => {
  const rootElement = document.getElementById("root");
  render(
    <Provider value={app}>
      <RadixProvider>
        <Element />
      </RadixProvider>
    </Provider>,
    rootElement
  );
};
export { CurrentModule, app, useApp };
export default CurrentModule;
CurrentModule(Nothing);

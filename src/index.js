import React from "react";
import AppWrapper from "./js/util/AppWrapper";
import { CurrentModule } from "./js/util/CurrentModule";
// import "./js/util/CreateModules";
console.log("INDEX", __filename);
if (module.hot) {
  module.hot.accept(
    ["./js/app", "./js/util/AppWrapper", "./js/util/CreateModules"],
    () => {
      CurrentModule(AppWrapper);
    }
  );
}
// CurrentModule(App);

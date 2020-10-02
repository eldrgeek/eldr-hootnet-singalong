import React from "react";
import AppWrapper from "./js/util/AppWrapper";
import { CurrentModule } from "./js/util/CurrentModule";
console.log("INDEX", __filename);
if (module.hot) {
  module.hot.accept(["./js/app", "./js/util/AppWrapper"], () => {
    CurrentModule(AppWrapper);
  });
}
// CurrentModule(App);

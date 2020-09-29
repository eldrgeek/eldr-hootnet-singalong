import React from "react";
import App from "./js/components/App";
import { CurrentModule } from "./js/util/CurrentModule";
if (module.hot) {
  module.hot.accept(["./js/app", "./js/components/App"], () => {
    CurrentModule(App);
  });
}
// CurrentModule(App);

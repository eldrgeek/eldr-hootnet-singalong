import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Container, Box } from "@material-ui/core";

const useTesting = (testing, action) => {
  React.useEffect(() => {
    console.log("testing");
    action();
  }, []);
};
const Testing = () => {
  const { state, actions } = useApp();

  return (
    <button onClick={() => actions.messages.setText("some text")}>
      testbutton
    </button>
  );
};
const Messages = ({ testing = false }) => {
  const { state, actions } = useApp();
  useTesting(testing, () => actions.messages.setText("this is the test"));
  return (
    <React.Fragment>
      {/* {testing ? <Testing /> : null} */}
      {state.messages.text ? (
        <Container sx={{ bg: "blue-500" }}>{state.messages.text}</Container>
      ) : null}
    </React.Fragment>
  );
};
export default Messages;
CurrentModule(Messages, { testing: "true" });

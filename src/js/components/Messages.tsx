import React from "react"; //eslint-disable-line
import { CurrentModule, useApp, register } from "../util/CurrentModule"; //eslint-disable-line
import { Container } from "@material-ui/core";

const useTesting = (testing, action) => {
  React.useEffect(() => {
    console.log("testing");
    action();
  }, []); //eslint-disable-line
};

const Testing = () => {
  //eslint-disable-line
  const { state, actions } = useApp(); //eslint-disable-line

  return (
    //@ts-ignore
    <button onClick={() => actions.messages.setText("some text")}>
      testbutton
    </button>
  );
};
const Messages = ({ testing = false }) => {
  const { state, actions } = useApp();
  //@ts-ignore
  useTesting(testing, () => actions.messages.setText("this is the test"));
  return (
    <React.Fragment>
      {/* {testing ? <Testing /> : null} */}
      {state.messages.text ? (
        //@ts-ignore
        <Container sx={{ bg: "blue-500" }}>{state.messages.text}</Container>
      ) : null}
    </React.Fragment>
  );
};
export default Messages;
register(__filename, Messages, false);

// CurrentModule(Messages, { testing: "true" });

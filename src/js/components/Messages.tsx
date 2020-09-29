import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Heading, Container, Box } from "@modulz/radix";

const Template = () => {
  const { state, actions } = useApp();
  React.useEffect(() => {}, []);
  return (
    <React.Fragment>
      {state.messages.text ? (
        <Container sx={{ bg: "blue-500" }}>{state.messages.text}</Container>
      ) : null}
    </React.Fragment>
  );
};
export default Template;
CurrentModule(Template);

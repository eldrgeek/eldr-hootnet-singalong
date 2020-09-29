import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Flex, Box, Text, Button } from "@modulz/radix";

const Template = () => {
  const { state, actions } = useApp();
  React.useEffect(() => {}, []);
  return (
    <React.Fragment>
      <Flex sx={{ color: "white", textAlign: "center" }}>
        <Box m={0} sx={{ flex: "1", height: 32, bg: "blue600" }}>
          Box1
        </Box>
        <Box py={1} mx={1} sx={{ flex: "1", height: 41, bg: "blue600" }}>
          <Button>click</Button>
        </Box>
        <Text
          mx={0}
          as="p"
          sx={{ flex: "1", bg: "blue600", color: "white", textAlign: "center" }}
        >
          Size 1
        </Text>
        <Box ml={1} sx={{ flex: "1", height: 32, bg: "blue600" }}>
          contents
        </Box>
      </Flex>
    </React.Fragment>
  );
};
export default Template;
CurrentModule(Template);

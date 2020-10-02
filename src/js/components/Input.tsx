import React from "react";
import { CurrentModule, useApp } from "../util/CurrentModule";
import { Input } from "@material-ui/core";
import IconButton from "./IconButton";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
const Component = ({
  placeholder = "placeholder",
  onChange = () => console.log("connect this button"),
  value
  // icon=<QuestionMarkIcon/>
}) => {
  const { state, actions } = useApp();
  // React.useEffect(() => {
  //   actions.videos._test();
  // }, []);
  return (
    <React.Fragment>
      <Input
        m={2}
        p={2}
        sx={{ border: "1px solid black", width: "80%", maxWidth: "400px" }}
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
      <IconButton icon={faCheck} />
    </React.Fragment>
  );
};
export default Component;
CurrentModule(Component);

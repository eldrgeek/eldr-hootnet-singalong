export type MessagesState = {
  lastMessage: string;
};

const state: MessagesState = {
  lastMessage: "This is the real last message" + 1234
};

const config = {
  state
};
export default config;

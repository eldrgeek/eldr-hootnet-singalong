// // import page from 'page';
// import { Action } from "overmind";
export const storage = {
  saveJoyride(joyride: any) {
    localStorage.setItem("joyride", JSON.stringify(joyride));
  },
  getJoyride(): any {
    return JSON.parse(localStorage.getItem("joyride") || "{}");
  }
};

// export const rooms = {
//   actions: null,
//   initialze(actions) {
//     rooms.actions = actions;
//   },
//   leave(room: string) {
//     rooms.actions.server.leaveRoom(room);
//   },
//   join(room: string) {
//     rooms.actions.server.joinRoom(room);
//   }
// };

// // export const router = {
// //   initialize(routes: { [url: string]: (params: object) => void }) {
// //     Object.keys(routes).forEach(url => {
// //       page(url, ({ params }) => routes[url](params));
// //     });
// //     page.start();
// //   },
// //   goTo(url: string) {
// //     page.show(url);
// //   },
// // };

// export const ids = {
//   create(): string {
//     return Date.now().toString();
//   }
// };

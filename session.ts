import session from "express-session";
import { GrantSession } from "grant";

export let sessionMiddleware = session({
  secret:
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1hr
  },
});

//指明express嗰session入面本身有data，即入面有username和id，然後在user.routes中都要import來用。
//若沒有declare module，系統會以為是program自己寫的interface，其他人要import這個Interface才用到。
//然而，express-session這library不會import，只有programmer import library，所以它猜不到我有一個session data放在這個file，它是在自己空間定義interface。
//因此programmer要與他溝通，它的空間要有interface，要有呢幾個column，現在是programmer改它的東西，不是它import programmer的東西。
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      name: string;
      avatar: string | null;
    };
    grant?: GrantSession;
  }
}

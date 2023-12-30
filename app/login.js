import m from "mithril";

import { Credentials } from "./credentials.js";
import { Header      } from "./header.js";
import { Nav         } from "./nav.js";
import { Request     } from "./request.js";

//========================================================================
const login = () => {
  Request.post("/sessions",
               { user: { email: Credentials.email(), password: Credentials.password() } },
               resp => {
                 Credentials.token(resp.data.token);
                 Credentials.name(resp.data.name);
                 Credentials.userId(resp.data.user_id);
                 Credentials.admin(resp.data.is_admin);
                 m.route.set("/scenarios");
               });
};

//========================================================================
export const Login = {
  view: (/*vnode*/) => {
    return [
      m(Header),
      m(Nav, { selected: "Login" }),
      m("div.main-content forgot-password",

        m("p",
          "Log in using your email and password. Both are case-sensitive!  New user? ",
          m(m.route.Link, { href: "/register" }, "Sign up!")
         ),

        m("table",
          m("tr",
            m("td", "Email"),
            m("td",
              m("input[type=email][name=email][size=40]", { onchange: ev => Credentials.email(ev.target.value) }))),

          m("tr",
            m("td", "Password"),
            m("td",
              m("input[type=password][name=password][size=40]", { onchange: ev => Credentials.password(ev.target.value) }))),

          m("tr.field-note",
            m("td", ""),
            m("td",
              m(m.route.Link, { class: "forgot-pw", href: "/forgot-pw" }, "Forgot your password?"))),

          m("tr",
            m("td", ""),
            m("td", m("button[value=Sign In][name=signin]", { onclick: () => login() }, "Sign In!")))
         ))
    ];
  }
};

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
/**
 * Mithril component for the Login page.
 *
 * @component
 */
export const Login = {
  view: (/*vnode*/) => {
    return [
      m(Header),
      m(Nav, { selected: "Login" }),
      m("div.main-content forgot-password",

        m("p", "Log in using your email and password. Both are ", m("b", "case-sensitive!")),

        m("form.two-column-grid",
          m("label[for=email]", "Email"),
          m("input[type=email][name=email][size=40]", { onchange: ev => Credentials.email(ev.target.value) }),

          m("label[for=password]", "Password"),
          m("input[type=password][name=password][size=40]", { onchange: ev => Credentials.password(ev.target.value) }),

          m(".grid-column-2",
            m("button[type=button][value=Sign In][name=signin]", { onclick: login }, "Sign In!"))),

        m("p",
          "New User? ", m(m.route.Link, { href: "/register" }, "Sign up!")),

        m("p", m(m.route.Link, { class: "forgot-pw", href: "/forgot-pw" }, "Forgot your password?")))
    ];
  }
};

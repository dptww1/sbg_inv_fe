import m from "mithril";
import prop from "mithril/stream";

import { Header  } from "./header.js";
import { Nav     } from "./nav.js";
import { Request } from "./request.js";

const email = prop();

//========================================================================
const reset_password = () => {
  Request.post("/reset-password",
               { user: { email: email() } },
               () => {
                 Request.messages("You should receive an email shortly with a link to reset your password.");
               });
};

//========================================================================
/**
 * Mithril component for the Forget Password page.
 *
 * @component
 */
export const ForgotPassword = {
  view() {
    return [
      m(Header),
      m(Nav, { selected: "Login" }),
      m("div.main-content", [
        m("p.text", "Forgot your password?"),
        m("div", [
          m("p.text", "Enter your email address to reset your password:"),
          m("p.text", m("input.email[type=email][size=40]", { onchange: ev => email(ev.target.value) })),
          m("p.text", m("button", { onclick: () => reset_password() }, "Reset")),
          m("p.text", "If you have difficulties, please email me at ", m("a[href=mailto:dave@davetownsend.org]", "dave@davetownsend.org"), ".")
        ])
      ])
    ];
  }
};

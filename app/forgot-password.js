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
               resp => {
                 Request.messages({errors: "Your password has been reset.  You should receive an email with your new password shortly."});
               });
};

//========================================================================
export const ForgotPassword = {
  view() {
    Request.errors({errors: "Automatic password reset isn't working at the moment. Send email to dave@davetownsend.org and I'll reset your password manually."});

    return [
      m(Header),
      m(Nav, { selected: "Login" }),
      m("div.main-content", [
        m("p.text", "Forgot your password?"),
        m("div", [
          m("p.text", "Enter your email address to reset your password:"),
          m("p.text", m("input.email[type=email][size=40]", { onchange: ev => email(ev.target.value) })),
          m("p.text", m("button", { onclick: () => reset_password() }, "Reset"))
        ])
      ])
    ];
  }
};

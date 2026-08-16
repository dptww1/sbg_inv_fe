import m from "mithril";
import prop from "mithril/stream";

import { FormField } from "./components/form-field.js";
import { Header  } from "./header.js";
import { Nav     } from "./nav.js";
import { Request } from "./request.js";
import * as U      from "./utils.js";

//========================================================================
const urlParams = {
  email: prop(),
  password: prop(),
  token: prop()
}

//========================================================================
const resetPassword = () => {
  if (U.isBlank(urlParams.token())) {
    Request.errors("You are missing the reset token needed to reset your password. Please use the link supplied in the email to reset your password");
    return;
  }

  if (U.isNoneBlank(urlParams.email(), urlParams.password())) {

  Request.post("/reset-password",
    { user: U.unpropertize(urlParams) },
    () => {
      Request.messages("Your password has been reset.")
      m.route.set("/login");
    });

  } else {
    Request.errors("Please enter both your email and a new password");
  }
};

//========================================================================
export const ResetPassword = {
  oninit() {
    U.emptyOutObject(urlParams);
    urlParams.token(m.route.param("token"));
  },

  view() {
    return [
      m(Header),
      m(Nav),
      m(".main-content",
        m("p.text", "Enter your email address and new password"),
        m("form.two-column-grid",
          FormField.text(urlParams.email, "Email", { placeholder: "abc@example.com" }),
          FormField.text(urlParams.password, "Password", { placeholder: "********" }),
          m(".grid-column-2", m("button", { onclick: resetPassword }, "Reset Password"))))
    ];
  }
};

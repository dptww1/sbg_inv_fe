/* global require module */

const m       = require("mithril");
const prop    = require("mithril/stream");

const Header  = require("header");
const Nav     = require("nav");
const Request = require("request");

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
var ForgotPassword = {
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

module.exports = ForgotPassword;

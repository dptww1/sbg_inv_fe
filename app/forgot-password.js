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
                     Request.errors({errors: "Your password has been reset.  You should receive an email with your new password shortly."});
                 });
};

//========================================================================
var ForgotPassword = {
    view() {
        return [
            m(Header),
            m(Nav, { selected: "Login" }),
            Request.errors() ? m("div.errors", Request.errors().errors) : null,
            m("div.main-content", [
                m("p.text", "Forgot your password?"),
                m("div", [
                    m("p.text", "Enter your email address to reset your password:"),
                    m("p.text", m("input.email[type=email][size=40]", { onchange: m.withAttr("value", email) })),
                    m("p.text", m("button", { onclick: () => reset_password() }, "Reset"))
                ])
            ])
        ];
    }
};

module.exports = ForgotPassword;

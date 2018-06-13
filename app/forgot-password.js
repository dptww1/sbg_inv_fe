/* global require module */

var m       = require("mithril");
var prop    = require("mithril/stream");

var Request = require("request");

//========================================================================
var ForgotPassword = function() {
    var errors = prop("");

    var reset_password = () => {
        Request.post("/reset-password",
                     { user: { email: ForgotPassword.email() } },
                     resp => {
                         errors({errors: "Your password has been reset.  You should receive an email with your new password shortly."});
                     });
    };

    return {
        email: prop(),

        view() {
            return [
                m(require("header")),
                m(require("nav"), { selected: "Login" }),
                errors() ? m("div.errors", errors().errors) : null,
                m("div.main-content", [
                    m("p.text", "Forgot your password?"),
                    m("div", [
                        m("p.text", "Enter your email address to reset your password:"),
                        m("p.text", m("input.email[type=email][size=40]", { onchange: m.withAttr("value", ForgotPassword.email) })),
                        m("p.text", m("button", { onclick: () => reset_password() }, "Reset"))
                    ])
                ])
            ];
        }
    };
}();

module.exports = ForgotPassword;

/* global require module */

var m       = require("mithril");
var Request = require("request");

//========================================================================
var ForgotPassword = function() {
    var errors = m.prop("");

    var reset_password = () => {
        Request.post("/reset-password",
                     { user: { email: ForgotPassword.email() } },
                     resp => {
                         errors({errors: "Your password has been reset.  You should receive an email with your new password shortly."});
                     });
    };

    return {
        email: m.prop(),

        view(ctrl) {
            return [
                m(require("header")),
                m(require("nav"), "Login"),
                errors() ? m("div.errors", errors().errors) : null,
                m("div.main-content", [
                    m("div", "Forgot your password?"),
                    m("div", [
                        m("div", "Enter your email address to reset your password:"),
                        m("input[type=text]", { onchange: m.withAttr("value", ForgotPassword.email) }),
                        m("button", { onclick: () => reset_password() }, "Reset")
                    ])
                ])
            ];
        }
    };
}();

module.exports = ForgotPassword;

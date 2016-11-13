/* global module require */

var m           = require("mithril");
var Credentials = require("credentials");
var Request     = require("request");

//========================================================================
var RegisterScreen = function() {
    var errors = m.prop("");

    var login = () => {
        Request.post("/sessions",
                     { user: { email: Credentials.email(), password: Credentials.password() } },
                     resp => {
                         Credentials.token(resp.data.token);
                         console.log(resp.data.token);
                         m.route("/scenarios");
                     },
                     RegisterScreen);
    };

    var register = () => {
        Request.post("/users",
                     { user: { name: Credentials.name(), email: Credentials.email(), password: Credentials.password() } },
                     login,
                     RegisterScreen);
    };

    var errorText = () => {
        var msgs = [];
        var errObj = errors().errors;
        for (var key in errObj) {
            msgs.push(key + ": " + errObj[key].join(", "));
        }
        return m.trust(msgs.join("<br/>"));
    };

    return {
        name: m.prop(),
        email: m.prop(),
        password: m.prop(),
        token: m.prop(),

        setError(str) {
            if (typeof(str) === "string") {
                errors({errors: {"Error": [str]}});
            } else {
                errors({errors: str});
            }
        },

        view(ctrl) {
            return [
                m(require("header")),
                m(require("nav"), "Login"),
                errors() ? m("div.errors", errorText()) : null,
                m("div.main-content", [
                    m("table", [
                        m("tr", [
                            m("td", "Name"),
                            m("td", [
                                m("input[type=text][name=name]", { onchange: m.withAttr("value", Credentials.name) })
                            ])
                        ]),
                        m("tr", [
                            m("td", "Email"),
                            m("td", [
                                m("input[type=text][name=email]", { onchange: m.withAttr("value", Credentials.email) })
                            ])
                        ]),
                        m("tr", [
                            m("td", "Password"),
                            m("td", [
                                m("input[type=password][name=password]", { onchange: m.withAttr("value", Credentials.password) })
                            ])
                        ]),
                        m("tr", [
                            m("td", ""),
                            m("button[value=Sign In][name=signin]", { onclick: () => register() }, "Sign Up!")
                        ])
                    ])
                ])
            ];
        }
    };
}();

module.exports = RegisterScreen;

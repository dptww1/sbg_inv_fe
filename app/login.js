/* global require module */

var m           = require("mithril");
var Credentials = require("credentials");
var Request     = require("request");

//========================================================================
var LoginScreen = function() {
    var errors = m.prop("");

    var login = () => {
        Request.post("/sessions",
                     { user: { email: Credentials.email(), password: Credentials.password() } },
                     resp => {
                         Credentials.token(resp.data.token);
                         Credentials.name(resp.data.name);
                         console.log(resp.data.token);
                         m.route("/scenarios");
                     });
    };

    return {
        email: m.prop(),
        password: m.prop(),
        token: m.prop(),

        setError(str) {
            errors({ errors: str});
        },

        view(ctrl) {
            return [
                m(require("header")),
                m(require("nav"), "Login"),
                errors() ? m("div.errors", errors().errors) : null,
                m("div.main-content", [
                    m("table", [
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
                            m("button[value=Sign In][name=signin]", { onclick: () => login() }, "Sign In!")
                        ])
                    ])
                ])
            ];
        }
    };
}();

module.exports = LoginScreen;

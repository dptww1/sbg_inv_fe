/* global module require */

var m           = require("mithril");
var prop        = require("mithril/stream");

var Credentials = require("credentials");
var Request     = require("request");

//========================================================================
var RegisterScreen = function() {
    var errors = prop("");

    var login = () => {
        Request.post("/sessions",
                     { user: { email: Credentials.email(), password: Credentials.password() } },
                     resp => {
                         Credentials.token(resp.data.token);
                         console.log(resp.data.token);
                         m.route.set("/scenarios");
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
        name: prop(),
        email: prop(),
        password: prop(),
        token: prop(),

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
                m(require("nav"), { selected: "Login" }),
                m("p.text", "Please fill in all fields completely."),
                m("div.main-content register", [
                    m("table", [
                        errors() ? m("tr", [ m("td"), m("td.errors", errorText()) ]) : null,

                        m("tr", [
                            m("td", "Name"),
                            m("td", [
                                m("input[type=text][name=name][size=40]", { onchange: m.withAttr("value", Credentials.name) })
                            ])
                        ]),
                        m("tr", [
                            m("td", "Email"),
                            m("td", [
                                m("input[type=text][name=email][size=40]", { onchange: m.withAttr("value", Credentials.email) })
                            ])
                        ]),
                        m("tr", [
                            m("td", "Password"),
                            m("td", [
                                m("input[type=password][name=password][size=40]", { onchange: m.withAttr("value", Credentials.password) })
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

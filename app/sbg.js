/* global require, module */

var m           = require("mithril");
var Credentials = require("credentials");
var Header      = require("header");
var K           = require("constants");
var Nav         = require("nav");
var Request     = require("request");
var ScenarioListScreen = require("scenario-list");


//==================================================================================================================================
var MainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='/inventory']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

//==================================================================================================================================
var RegisterScreen = function() {
    var errors = m.prop("");

    var login = () => {
        Request.post(K.API_URL + "/sessions",
                     { user: { email: Credentials.email(), password: Credentials.password() } },
                     resp => {
                         Credentials.token(resp.data.token);
                         console.log(resp.data.token);
                         m.route("/scenarios");
                     },
                     RegisterScreen);
    };

    var register = () => {
        Request.post(K.API_URL + "/users",
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
                m(Header),
                m(Nav, "Login"),
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

//==================================================================================================================================
var LoginScreen = function() {
    var errors = m.prop("");

    var login = () => {
        Request.post(K.API_URL + "/sessions",
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
                m(Header),
                m(Nav, "Login"),
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

module.exports.LoginScreen = LoginScreen;

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/"              : MainScreen,
    "/scenarios/:id" : require("scenario-details"),
    "/scenarios"     : require("scenario-list"),
    "/inventory"     : require("inventory"),
    "/login"         : LoginScreen,
    "/register"      : RegisterScreen
});

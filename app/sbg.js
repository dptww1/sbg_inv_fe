/* global require, module */

var m           = require("mithril");
var Credentials = require("credentials");
var Header      = require("header");
var K           = require("constants");
var Request     = require("request");
var ScenarioListScreen = require("scenario-list");

//==================================================================================================================================
var Nav = {
    view: function(ctl, which) {
        var loginActive           = which == "Login";
        var inventoryActive       = which == "Inventory";
        var scenariosActive       = which == "Scenario List";
        var scenarioDetailsActive = which == "Scenario Details";

        return m("div.nav", [
            m("div.nav-header",
              Credentials.token() ? [ m("div.login-name", Credentials.name(), m("br"), m("a", { onclick: function() { Credentials.clear(); } }, "Log out")) ]
                                    : [
                                        m("a[href=/login]", { config: m.route }, "Login"),
                                        "/",
                                        m("a[href=/register]", { config: m.route }, "Register")
                                      ]
             ),

            m("div.nav-header", [
                m("a",
                  { href: "/inventory", config: m.route, class: inventoryActive ? "nav-content-selected" : "nav-content-unselected" },
                  "Inventory"),
                m("br"),
            ]),

            m("div.nav-header", [
                m("a",
                  { href: "/scenarios", config: m.route, class: scenariosActive ? "nav-content-selected" : "nav-content-unselected" },
                  "Scenarios")
            ]),
            m("div.filter-group-header", ""),

            ScenarioListScreen.getSetFilters(null) > 1
                ? m("ul.filter-group", [ m("li", { onclick: () => ScenarioListScreen.unsetAllFilters() }, "Remove all") ])
                : null,

            m("select[name=source]", {
                onchange: function(ev) { ScenarioListScreen.setFilter("source", ev.target.value); }
              }, [
                  m("option[value=]", "... by Source"),
                  ScenarioListScreen.isFilterActive("source", "bpf")    ? null : m("option[value=bpf]", "The Battle of the Pelennor Fields"),
                  ScenarioListScreen.isFilterActive("source", "fotn")   ? null : m("option[value=fotn]", "Fall of the Necromancer"),
                  ScenarioListScreen.isFilterActive("source", "mordor") ? null : m("option[value=mordor]", "Mordor"),
                  ScenarioListScreen.isFilterActive("source", "roa")    ? null : m("option[value=roa]", "The Ruin of Arnor"),
                  ScenarioListScreen.isFilterActive("source", "saf")    ? null : m("option[value=saf]", "Shadow and Flame"),
                  ScenarioListScreen.isFilterActive("source", "site")   ? null : m("option[value=site]", "A Shadow in the East"),
                  ScenarioListScreen.isFilterActive("source", "sots")   ? null : m("option[value=sots]", "The Scouring of the Shire"),
                  ScenarioListScreen.isFilterActive("source", "ttt_jb") ? null : m("option[value=ttt_jb]", "The Two Towers Journeybook")
            ]),
            m("ul.filter-group", ScenarioListScreen.getSetFilters("source").map((f) => {
                return f.state ? m("li", { onclick: ev => ScenarioListScreen.unsetFilter("source",f.name) }, K.BOOK_NAMES[f.name])
                               : null;
            })),

            m("select[name=size]", {
                onchange: function(ev) { ScenarioListScreen.setFilter("size", ev.target.value); }
              }, [
                  m("option[value=]", "... by Size"),
                  ScenarioListScreen.isFilterActive("size", "tiny")   ? null : m("option[value=tiny]", "Tiny (<21)"),
                  ScenarioListScreen.isFilterActive("size", "small")  ? null : m("option[value=small]", "Small (21-40)"),
                  ScenarioListScreen.isFilterActive("size", "medium") ? null : m("option[value=medium]", "Medium (41-60)"),
                  ScenarioListScreen.isFilterActive("size", "large")  ? null : m("option[value=large]", "Large (61-100)"),
                  ScenarioListScreen.isFilterActive("size", "huge")   ? null : m("option[value=huge]", "Huge (101+)"),
            ]),
            m("ul.filter-group", ScenarioListScreen.getSetFilters("size").map(f => {
                return f.state ? m("li", { onclick: ev => ScenarioListScreen.unsetFilter("size", f.name) }, f.label)
                               : null;
            }))
        ]);
    }
};

module.exports.Nav = Nav;

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

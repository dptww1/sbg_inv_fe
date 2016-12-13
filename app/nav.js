/* global module require */

var m                  = require("mithril");
var Credentials        = require("credentials");
var K                  = require("constants");
var ScenarioListScreen = require("scenario-list");

//========================================================================
var loggedInTabs = (loginActive) => {
    if (!Credentials.token()) {
        return [];
    }

    return [
        m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" }, [ m("a[href=/account]", { config: m.route }, Credentials.name()) ]),
        m("div.nav-header", [ m("a[href=/scenarios]", { config: m.route, onclick: () => { Credentials.clear(); }  }, "Log Out") ])
    ];
}

//========================================================================
var loggedOutTabs = (loginActive, registerActive) => {
    if (Credentials.token()) {
        return [];
    }

    return [
        m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" }, [ m("a[href=/login]", { config: m.route }, "Login") ]),
        m("div.nav-header", { class: registerActive ? "nav-content-selected" : "" }, [ m("a[href=/register]", { config: m.route }, "Register") ])
    ];
};

//========================================================================
var Nav = {
    view(ctl, which) {
        var loginActive           = which == "Login";
        var inventoryActive       = which == "Inventory";
        var registerActive        = which == "Register";
        var scenarioListActive    = which == "Scenario List";

        return m("div.nav", [
            m("div.nav-header", { class: scenarioListActive ? "nav-content-selected" : "" }, [
                m("a",
                  { href: "/scenarios", config: m.route },
                  "Scenarios")
            ]),

            m("div.nav-header", { class: inventoryActive ? "nav-content-selected" : "" }, [
                m("a",
                  { href: "/inventory", config: m.route },
                  "Inventory")
            ])
        ].concat(loggedInTabs(loginActive))
         .concat(loggedOutTabs(loginActive, registerActive)));
    }
};

module.exports = Nav;

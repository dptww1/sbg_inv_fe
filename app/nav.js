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
        m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" }, [
            m("span.icon", K.ICON_STRINGS.account),
            m("a[href=/account]", { config: m.route }, Credentials.name())
          ]),
        m("div.nav-header", [
            m("span.icon", K.ICON_STRINGS.log_out),
            m("a[href=/scenarios]", { config: m.route, onclick: () => { Credentials.clear(); }  }, "Log Out")
          ])
    ];
}

//========================================================================
var loggedOutTabs = (loginActive) => {
    if (Credentials.token()) {
        return [];
    }

    return [
        m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" }, [
            m("span.icon", K.ICON_STRINGS.log_in),
            m("a[href=/login]", { config: m.route }, "Login")
          ])
    ];
};

//========================================================================
var Nav = {
    view(ctl, which) {
        var accountActive         = which == "Account";
        var loginActive           = which == "Login";
        var inventoryActive       = which == "Inventory";
        var scenarioListActive    = which == "Scenario List";

        return m("div.nav", [
            m("div.nav-header", { class: scenarioListActive ? "nav-content-selected" : "" }, [
                m("span.icon", K.ICON_STRINGS.scenarios),
                m("a",
                  { href: "/scenarios", config: m.route },
                  "Scenarios")
            ]),

            m("div.nav-header", { class: inventoryActive ? "nav-content-selected" : "" }, [
                m("span.icon", K.ICON_STRINGS.inventory),
                m("a",
                  { href: "/inventory", config: m.route },
                  "Inventory")
            ])
        ].concat(loggedInTabs(accountActive))
         .concat(loggedOutTabs(loginActive)));
    }
};

module.exports = Nav;

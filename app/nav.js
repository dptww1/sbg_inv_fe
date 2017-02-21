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
            m("a[href=/account]", { oncreate: m.route.link }, Credentials.name())
          ]),
        m("div.nav-header", [
            m("span.icon", K.ICON_STRINGS.log_out),
            m("a[href=/scenarios]", { oncreate: m.route.link, onclick: () => { Credentials.clear(); }  }, "Log Out")
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
            m("a[href=/login]", { oncreate: m.route.link }, "Login")
          ])
    ];
};

//========================================================================
var Nav = {
    view(vnode) {
        var accountActive         = vnode.attrs.selected == "Account";
        var loginActive           = vnode.attrs.selected == "Login";
        var figureListActive      = vnode.attrs.selected == "Figures";
        var scenarioListActive    = vnode.attrs.selected == "Scenario List";

        return m("div.nav", [
            m("div.nav-header", { class: scenarioListActive ? "nav-content-selected" : "" }, [
                m("span.icon", K.ICON_STRINGS.scenarios),
                m("a",
                  { href: "/scenarios", oncreate: m.route.link },
                  "Scenarios")
            ]),

            m("div.nav-header", { class: figureListActive ? "nav-content-selected" : "" }, [
                m("span.icon", K.ICON_STRINGS.figures),
                m("a",
                  { href: "/figures", oncreate: m.route.link },
                  "Figures")
            ])
        ].concat(loggedInTabs(accountActive))
         .concat(loggedOutTabs(loginActive)));
    }
};

module.exports = Nav;

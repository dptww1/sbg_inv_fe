/* global module require */

const m                  = require("mithril");
const Credentials        = require("credentials");
const K                  = require("constants");
const Request            = require("request");

//                 m("div.errors", Request.errors() && Request.errors.errors ? domErrors() : null),
//                 m("div.messages", Request.messages() ? domMessages() : null));

//========================================================================
const domErrors = () => {
    if (!Request.errors()) {
        return null;
    }

    let errObj = Request.errors();

    if (typeof errObj === "string") {
        return m(".errors.text", errObj);
    }

    if (typeof errObj.errors === "string") {
        return m(".errors.text", errObj.errors);

    } else if (typeof errObj.errors === "object") {
        errObj = errObj.errors;
    }

    return m(".errors.text",
             Object.keys(errObj)
                   .map((k, idx) => [ idx > 0 ? m("br") : null,  m("span", k + ": " + errObj[k]) ]));
};

//========================================================================
const domMessages = () => {
    return Request.messages() ? m(".messages.text", Request.messages()) : null;
};

//========================================================================
const domLoggedInTabs = (loginActive) => {
    if (!Credentials.token()) {
        return null;
    }

    return [
        m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" },
          m("a[href=/account]", { oncreate: m.route.link },
            m("span.icon", K.ICON_STRINGS.account),
            Credentials.name())),

        m("div.nav-header",
          m("a[href=/scenarios]", { oncreate: m.route.link, onclick: () => { Credentials.clear(); }  },
            m("span.icon", K.ICON_STRINGS.log_out),
            m("span.desktop", "Log Out")))
    ];
};

//========================================================================
const domLoggedOutTabs = (loginActive) => {
    if (Credentials.token()) {
        return null;
    }

    return m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" },
             m("a[href=/login]", { oncreate: m.route.link },
               m("span.icon", K.ICON_STRINGS.log_in),
               m("span.desktop", "Login")));
};

//========================================================================
const Nav = {

    view(vnode) {
        var aboutActive        = vnode.attrs.selected == "About";
        var accountActive      = vnode.attrs.selected == "Account";
        var loginActive        = vnode.attrs.selected == "Login";
        var figureListActive   = vnode.attrs.selected == "Figures";
        var scenarioListActive = vnode.attrs.selected == "Scenario List";

        return [
            m("div.nav",
              m("div.nav-header", { class: scenarioListActive ? "nav-content-selected" : "" },
                m("a", { href: "/scenarios", oncreate: m.route.link },
                  m("span.icon", K.ICON_STRINGS.scenarios),
                  m("span.desktop", "Scenarios"))),

              m("div.nav-header", { class: figureListActive ? "nav-content-selected" : "" },
                m("a", { href: "/figures", oncreate: m.route.link },
                  m("span.icon", K.ICON_STRINGS.figures),
                  m("span.desktop", "Figures"))),

              domLoggedInTabs(accountActive),

              domLoggedOutTabs(loginActive),

              m(".nav-header", { class: aboutActive ? "nav-content-selected" : "" },
                m("a", { href: "/about", oncreate: m.route.link },
                  m("span.icon", K.ICON_STRINGS.about),
                  m("span.desktop", "About")))),

            domErrors(),
            domMessages()
        ];
    }
};

module.exports = Nav;

/* global module require */

var m                  = require("mithril");
var Credentials        = require("credentials");
var K                  = require("constants");
var ScenarioListScreen = require("scenario-list");

//========================================================================
var loggedInHeaderElts = () => {
    return [
        m("a[href=/login]", { config: m.route }, "Login"),
        "/",
        m("a[href=/register]", { config: m.route }, "Register")
    ];
};

//========================================================================
var loggedOutHeaderElts = () => {
    return [
        m("div.login-name", Credentials.name()),
        m("a", { onclick: function() { Credentials.clear(); } }, "Log out")
    ];
};

//========================================================================
var Nav = {
    view(ctl, which) {
        var loginActive           = which == "Login";
        var inventoryActive       = which == "Inventory";
        var scenarioListActive    = which == "Scenario List";

        return m("div.nav", [
            m("div.nav-header", Credentials.token() ? loggedOutHeaderElts() : loggedInHeaderElts()),
/*
            m("div.nav-header", [
                m("a",
                  { href: "/inventory", config: m.route, class: inventoryActive ? "nav-content-selected" : "nav-content-unselected" },
                  "Inventory"),
                m("br"),
            ]),
*/
            m("div.nav-header", [
                m("a",
                  { href: "/scenarios", config: m.route, class: scenarioListActive ? "nav-content-selected" : "nav-content-unselected" },
                  "Scenarios")
            ]),

            scenarioListActive ? m("div", ScenarioListScreen.leftNav()) : null,
        ]);
    }
};

module.exports = Nav;

/* global require */

var m = require("mithril");

//==================================================================================================================================
var MainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='/inventory']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/scenarios", {
    "/"              : MainScreen,
    "/figures/:id"   : require("figure-details.js"),
    "/scenarios/:id" : require("scenario-details"),
    "/scenarios"     : require("scenario-list"),
    "/inventory"     : require("inventory"),
    "/login"         : require("login"),
    "/register"      : require("register"),
    "/forgot-pw"     : require("forgot-password"),
    "/account"       : require("account")
});

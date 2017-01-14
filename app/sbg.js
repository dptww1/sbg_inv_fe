/* global require */

var m = require("mithril");

//==================================================================================================================================
var MainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='/figures']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/scenarios", {
    "/"              : MainScreen,
    "/figures/:id"   : require("figure-details"),
    "/figures"       : require("figure-list"),
    "/scenarios/:id" : require("scenario-details"),
    "/scenarios"     : require("scenario-list"),
    "/login"         : require("login"),
    "/register"      : require("register"),
    "/forgot-pw"     : require("forgot-password"),
    "/account"       : require("account")
});

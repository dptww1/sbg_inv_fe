/* global require */

var m = require("mithril");

m.route.prefix("#");
m.route(document.getElementById("mainDiv"), "/scenarios", {
    "/about"         : require("about"),
    "/figures/:id"   : require("figure-details"),
    "/figures"       : require("figure-list"),
    "/scenarios/:id" : require("scenario-details"),
    "/scenarios"     : require("scenario-list"),
    "/login"         : require("login"),
    "/register"      : require("register"),
    "/forgot-pw"     : require("forgot-password"),
    "/account"       : require("account")
});

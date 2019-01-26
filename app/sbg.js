/* global require */

const m = require("mithril");

const About           = require("about");
const Account         = require("account");
const Credentials     = require("credentials");
const FigureDetails   = require("figure-details");
const FigureEdit      = require("figure-edit");
const FigureList      = require("figure-list");
const ForgotPassword  = require("forgot-password");
const Login           = require("login");
const Page404         = require("page-404");
const Register        = require("register");
const ScenarioDetails = require("scenario-details");
const ScenarioEdit    = require("scenario-edit");
const ScenarioList    = require("scenario-list");

const AuthenticatingResolver = component => {
  return {
    onmatch: () => {
      if (!Credentials.isAdmin()) {
        m.route.set("/scenarios");
        return undefined;

      } else {
        return component;
      }
    }
  };
};

m.route.prefix("#");
m.route(document.getElementById("mainDiv"), "/scenarios", {
  "/about"             : About,
  "/figures/:id"       : FigureDetails,
  "/figure-edit"       : FigureEdit,
  "/figures"           : FigureList,
  "/scenarios/:id"     : ScenarioDetails,
  "/scenarios"         : ScenarioList,
  "/scenario-edit/:id" : AuthenticatingResolver(ScenarioEdit),
  "/scenario-edit"     : AuthenticatingResolver(ScenarioEdit),
  "/login"             : Login,
  "/register"          : Register,
  "/forgot-pw"         : ForgotPassword,
  "/account"           : Account,
  "/:404"              : Page404
});

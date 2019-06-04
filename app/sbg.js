/* global require */

const m = require("mithril");

const About           = require("about");
const Account         = require("account");
const Credentials     = require("credentials");
const FactionEdit     = require("admin-components/faction-edit");
const FigureDetails   = require("figure-details");
const FigureEdit      = require("admin-components/figure-edit");
const FigureList      = require("figure-list");
const ForgotPassword  = require("forgot-password");
const Login           = require("login");
const Page404         = require("page-404");
const Register        = require("register");
const ScenarioDetails = require("scenario-details");
const ScenarioEdit    = require("admin-components/scenario-edit");
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

// Courtesy of http://ratfactor.com/mithril-route-scroll
m.route.setNoScroll = m.route.set;
m.route.set = (path, data, options) => {
  m.route.setNoScroll(path, data, options);
  window.scrollTo(0, 0);
};

m.route.linkNoScroll = m.route.link;
m.route.link = vnode => {
  m.route.linkNoScroll(vnode);
  window.scrollTo(0, 0);
};

m.route.prefix("#");
m.route(document.getElementById("mainDiv"), "/scenarios", {
  "/about"                  : About,
  "/faction-edit/:sid/:fid" : AuthenticatingResolver(FactionEdit),
  "/figures/:key"           : FigureDetails,
  "/figure-edit/:id"        : AuthenticatingResolver(FigureEdit),
  "/figure-edit"            : AuthenticatingResolver(FigureEdit),
  "/figures"                : FigureList,
  "/scenarios/:key"         : ScenarioDetails,
  "/scenarios"              : ScenarioList,
  "/scenario-edit/:id"      : AuthenticatingResolver(ScenarioEdit),
  "/scenario-edit"          : AuthenticatingResolver(ScenarioEdit),
  "/login"                  : Login,
  "/register"               : Register,
  "/forgot-pw"              : ForgotPassword,
  "/account"                : Account,
  "/:404"                   : Page404
});

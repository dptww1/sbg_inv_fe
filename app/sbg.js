import m from "mithril";

import { About }           from "./about.js";
import { Account }         from "./account.js";
import { CharacterEdit }   from "./character.js";
import { Credentials }     from "./credentials.js";
import { FactionEdit }     from "./admin-components/faction-edit.js";
import { FigureDetails }   from "./figure-details.js";
import { FigureEdit }      from "./admin-components/figure-edit.js";
import { FigureList }      from "./figure-list.js";
import { ForgotPassword }  from "./forgot-password.js";
import { Login }           from "./login.js";
import { Page404 }         from "./page-404.js";
import { Register }        from "./register.js";
import { ScenarioDetails } from "./scenario-details.js";
import { ScenarioEdit }    from "./admin-components/scenario-edit.js";
import { ScenarioList }    from "./scenario-list.js";
import { Stats }           from "./stats.js";

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

m.route.prefix = "#";
m.route(document.getElementById("mainDiv"), "/scenarios", {
  "/about"                  : About,
  "/characters"             : AuthenticatingResolver(CharacterEdit),
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
  "/stats"                  : Stats,
  "/"                       : ScenarioList,
  "/:404..."                : Page404
});

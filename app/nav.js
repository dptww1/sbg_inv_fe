import m from "mithril";

import { Credentials } from "./credentials.js";
import * as K          from "./constants.js";
import { Request }     from "./request.js";
import { Typeahead }   from "./components/typeahead.js";
import * as U          from "./utils.js";

let showSearch = false;

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
           Object.keys(errObj).map((k, idx) => [
             idx > 0 ? m("br") : null,
             m("span", k + ": " + stringify(errObj[k]))
           ]));
};

//========================================================================
const domMessages = () => {
  return Request.messages() ? m(".messages.text", Request.messages()) : null;
};

//========================================================================
const domLoggedInTabs = loginActive =>
  Credentials.token()
    ? m("div.nav-header",
        { class: loginActive ? "nav-content-selected" : "" },
        m(m.route.Link, { href: "/account" },
          m("span.action", K.ICON_STRINGS.account),
          m("span.desktop", Credentials.name())))
    : null;

//========================================================================
const domLoggedOutTabs = (loginActive) => {
  if (Credentials.token()) {
    return null;
  }

  return m("div.nav-header", { class: loginActive ? "nav-content-selected" : "" },
           m(m.route.Link, { href: "/login" },
             m("span.action", K.ICON_STRINGS.log_in),
             m("span.desktop", "Login")));
};

//========================================================================
const doSelect = target => {
   // cancelled?
  if (target == null) {
    showSearch = false;
    return;
  }

  switch (target.dataset.type) {
  case "f":
    showSearch = false;
    m.route.set("/figures/:id", { id: target.dataset.id });
    break;

  case "s":
    showSearch = false;
    m.route.set("/scenarios/:id", { id: target.dataset.id });
    break;
  }
};

//========================================================================
const findCompletions = (s, typeahead) => {
  Request.get("/search?q=" + s,
              resp => {
                typeahead.suggestions = resp.data.map(x => {
                  const bookStr = U.shortResourceLabel(x);
                  x.name = x.name + (bookStr ? " [" + bookStr + "]" : "");
                  x.len = s.length;
                  return x;
                });
              });
};

//========================================================================
const stringify = obj => {
  if (typeof obj === "string") {
    return obj;
  }

  if (typeof obj === "number") {
    return "" + obj;
  }

  // *sigh*, Javascript...
  if (Array.isArray(obj)) {
    return obj.join("; ");
  }

  if (!obj) {
    return "";
  }

  // Not sure what should happen with object
  return obj;
};

//========================================================================
export const Nav = {

  view(vnode) {
    const aboutActive        = vnode.attrs.selected == "About";
    const accountActive      = vnode.attrs.selected == "Account";
    const loginActive        = vnode.attrs.selected == "Login";
    const figureListActive   = vnode.attrs.selected == "Figures";
    const scenarioListActive = vnode.attrs.selected == "Scenario List";
    const statsActive        = vnode.attrs.selected == "Stats";

    return [
      m("div.nav",
        showSearch
        ? m(Typeahead,
            {
              findMatches: findCompletions,
              onItemSelect: doSelect
            })
        : [
            m(".nav-header", { class: scenarioListActive ? "nav-content-selected" : "" },
              m(m.route.Link, { href: "/scenarios" },
                m("span.action", K.ICON_STRINGS.scenarios),
                m("span.desktop", "Scenarios"))),

            m(".nav-header", { class: figureListActive ? "nav-content-selected" : "" },
              m(m.route.Link, { href: "/figures" },
                m("span.action", K.ICON_STRINGS.figures),
                m("span.desktop", "Figures"))),

            domLoggedInTabs(accountActive),

            domLoggedOutTabs(loginActive),

            m(".nav-header", { class: statsActive ? "nav-content-selected" : "" },
              m(m.route.Link, { href: "/stats" },
                m("span.action", K.ICON_STRINGS.stats),
                m("span.desktop", "Stats"))),

            m(".nav-header", { class: aboutActive ? "nav-content-selected" : "" },
              m(m.route.Link, { href: "/about" },
                m("span.action", K.ICON_STRINGS.about),
                m("span.desktop", "About"))),

            Credentials.isAdmin()
            ? m(".nav-header",
                m(m.route.Link, { href: "/characters" },
                  m("span.desktop", "Ch")))
            : null
        ],

        m(".nav-header",
          m(".search-container",
            m("span.action search", { onclick: () => showSearch = !showSearch }, K.ICON_STRINGS.search)
           ))
       ),

      domErrors(),
      domMessages()
    ];
  }
};

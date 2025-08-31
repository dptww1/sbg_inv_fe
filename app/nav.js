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
const doSearchSelect = target => {
   // cancelled?
  if (target == null) {
    showSearch = false;
    return;
  }

  const URL_MAPPINGS = {
    "c": "/characters/:id",
    "f": "/figures/:id",
    "s": "/scenarios/:id"
  };

  const url = URL_MAPPINGS[target.dataset.type];

  if (url) {
    showSearch = false;
    m.route.set(url, { id: target.dataset.id });
  }
};

//========================================================================
const findCompletions = (s, typeahead) => {
  Request.get("/search?q=" + s,
    resp => {
      const sortedResults = {
        "c": { items: [], header: "-- Characters --" },
        "f": { items: [], header: "-- Figures --" },
        "s": { items: [], header: "-- Scenarios --" }
      }

      resp.data.forEach(x => {
        const bookStr = U.shortResourceLabel(x);
        x.name = x.name + (bookStr ? " [" + bookStr + "]" : "");
        x.len = s.length;

        if (sortedResults[x.type]) {
          sortedResults[x.type].items.push(x);
        }
      });

      const showHeaders = Object.keys(sortedResults)
        .reduce((acc, ch) => acc + sortedResults[ch].items.length > 0 ? 1 : 0, 0)

      typeahead.suggestions = [];
      Object.keys(sortedResults).sort()
        .filter(ch => sortedResults[ch].items.length > 0)
        .forEach(ch => {
          if (showHeaders) {
            typeahead.suggestions.push( { name: sortedResults[ch].header } );
          }
          typeahead.suggestions = typeahead.suggestions.concat(sortedResults[ch].items);
        });
    });
};

//========================================================================
const stringify = obj => {
  if (typeof obj === "string") {
    return obj;
  }

  if (typeof obj === "number") {
    return String(obj);
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
              onItemSelect: doSearchSelect
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
              ? m("nav.nav-header.admin-menu",
                  m("span", "+",
                    m("ul",
                      m("li", m(m.route.Link, { href: "/army-list-edit" }, "Add Army List")),
                      m("li", m(m.route.Link, { href: "/characters"     }, "Add Character")),
                      m("li", m(m.route.Link, { href: "/figure-edit"    }, "Add Figure")),
                      m("li", m(m.route.Link, { href: "/scenario-edit"  }, "Add Scenario")))))
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

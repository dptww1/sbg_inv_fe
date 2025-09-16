import m from "mithril";
import prop from "mithril/stream";

import { Credentials     } from "./credentials.js";
import { Header          } from "./header.js";
import * as K              from "./constants.js";
import { Nav             } from "./nav.js";
import { Pie             } from "./components/pie.js";
import { Request         } from "./request.js";
import { ScenarioUpdater } from "./scenario-updater.js";
import { StarRating      } from "./components/star-rating.js";
import * as U              from "./utils.js";

const MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const scenario = prop();
const resourceId = prop();
const resourceType = prop("-1");
const title = prop("");
const book = prop();
const issue = prop();
const page = prop();
const sort_order = prop();
const url = prop();

//========================================================================
const domFactionsRollup = () => {
  if (!scenario().scenario_factions) {
    return null;
  }

  const f = [ m("div.section-header", "Participants") ];

  scenario().scenario_factions.forEach((faction, idx) => f.push(
    m("div.faction",
      m("div.section-subheader",
        idx === 0 ? "Good" : "Evil",
        Credentials.isAdmin()
          ? m("span.action",
              { onclick: () => m.route.set("/faction-edit/" + scenario().id + "/" + faction.id) },
              K.ICON_STRINGS.edit)
          : null),
      domRolesRollup(faction.roles))));

  return m("div.factions-container", f);
};

//========================================================================
const domFiguresRollup = (role, figuresList) => {
  if (figuresList.length > 1) {
    return m("div.figures-dropdown",
             {
               id: "figures-dropdown-" + role.id,
               onmouseover: () => menuShow(role.id),
               onmouseout: () => menuHide(role.id)
              },
              figuresList.reduce((acc, f) => {
                acc.push(m("div.figure-line",
                           m(Pie, { size: 24, n: role.amount, nPainted: f.painted, nOwned: f.owned }),
                           f.owned > 1 ? m("div.figure-line-amount", f.owned) : null,
                           m("div.figure-line-name",
                             m(m.route.Link, { href: "/figures/" + f.figure_id }, f.name))));
                return acc;
              }, []));
  }

  return null;
};

//========================================================================
const domResourceItem = function(res) {
  let html = [];
  html.push(res.url ? m("a", { href: res.url }, res.title || res.url)
                    : res.title + (res.issue ? " #" + res.issue : "") + (res.page ? ", page " + res.page : ""));

  if (Credentials.isAdmin()) {
    html.push(m("span.action", { onclick: () => { loadResourceIntoForm(res); } }, K.ICON_STRINGS.edit));
  }

  return html;
};

//========================================================================
const domResourcesRollupAdd = (eltArray, resourceArray, className, titleStr, iconCharStr) => {
  if (resourceArray && resourceArray.length > 0) {
    if (resourceArray.length == 1) {
      eltArray.push(m("div." + className, [
        m("span.icon", iconCharStr),
        m("span.scenario-" + className + "-title", titleStr + ": "),
        m("span.scenario-" + className + "-url", domResourceItem(resourceArray[0]))
      ]));

    } else {
      const items = resourceArray.map(res => {
        return m("li", { className: "span.scenario-" + className + "-url" }, domResourceItem(res));
      });
      eltArray.push(m("span.icon", iconCharStr));
      eltArray.push(m("span.scenario-" + className + "-title", titleStr + "s"));
      eltArray.push(m("ul.resource-list", items));
    }
  }

  return eltArray;
};

//========================================================================
const domResourcesRollupAddCheatsheet = (eltArray, resources) => {
  if (resources.cheatsheet) {
    resources.cheatsheet.forEach(rsrc =>
      eltArray.push(m("div.scenario-cheatsheet", [
        m("span.icon", K.ICON_STRINGS.cheatsheet),
        m("a", { href: rsrc.url }, rsrc.title || "Cheatsheet"),
        Credentials.isAdmin()
          ? m("span.action", { onclick: () => loadResourceIntoForm(rsrc) }, K.ICON_STRINGS.edit)
          : null
      ])));
  }
};

//========================================================================
const domResourcesRollupAddSource = (eltArray, resources) => {
  if (resources.source) {
    resources.source.forEach(function(resource) {
      eltArray.push(m("div.scenario-source", [
        m("span.scenario-source-title", "Source: "),
        m("span.scenario-source-book-title", U.resourceLabel(resource)),
        m("span.scenario-source-book-page", ", page " + resource.page)
      ]));
    });
  }
};

//========================================================================
const domResourcesRollup = () => {
  const r = [];

  const rsrcList = scenario().scenario_resources;
  if (rsrcList) {
    r.push(m("div.section-header", "Resources"));
    domResourcesRollupAddSource(r, rsrcList);
    domResourcesRollupAddCheatsheet(r, rsrcList);
    domResourcesRollupAdd(r, rsrcList.video_replay, "video-replay", "Video Replay", K.ICON_STRINGS.video_replay);
    domResourcesRollupAdd(r, rsrcList.web_replay, "web-replay", "Web Replay", K.ICON_STRINGS.web_replay);
    domResourcesRollupAdd(r, rsrcList.podcast, "podcast", "Podcast", K.ICON_STRINGS.podcast);
    domResourcesRollupAdd(r, rsrcList.magazine_replay, "magazine-replay", "Magazine Replay", K.ICON_STRINGS.magazine_replay);
  }

  return r;
};

//========================================================================
const domRolesRollup = (rolesList) => {
  const roles = [];

  if (rolesList != null) {
    rolesList.forEach(function(r) {
      roles.push(m("div.role-line",
                   m(Pie, { size: 24, n: r.amount, nPainted: r.num_painted, nOwned: r.num_owned }),
                   r.amount > 1 ? m("div.role-line-amount", r.amount) : null,
                   m("div.role-line-name", r.figures.length > 1
                     ? m("span",
                         {
                           onmouseover: () => menuShow(r.id),
                           onmouseout: () => menuHide(r.id)
                         },
                         r.name)
                     : m(m.route.Link, { href: "/figures/" + r.figures[0].figure_id }, r.name)),
                   domFiguresRollup(r, r.figures)));
    });

    if (roles.length == 0) {
      roles.push(m("div.role-line", "None (no, really!)"));
    }
  }

  return roles;
};

//========================================================================
const formatDate = (age, year, month, day) => {
  const a = [ ["", "FA", "SA", "TA"][age || 0] ];
  if (day > 0) {
    a.push(day);
  }
  if (month > 0) {
    a.push(MONTH_NAMES[month]);
  }
  a.push(year);
  return a.join(" ");
};

//========================================================================
const loadResourceIntoForm = (res) => {
  resourceId(res.id);
  resourceType(K.RESOURCE_TYPE_MAP[res.resource_type]);
  title(res.title);
  book(res.book);
  issue(res.issue);
  page(res.page ? String(res.page) : null); // services return page as a number
  sort_order(res.sort_order ? String(res.sort_order) : null); // likewise
  url(res.url);
};

//========================================================================
const menuHide = (id) => {
  const elt = document.getElementById("figures-dropdown-" + id);
  elt.style.display = "none";
};

//========================================================================
const menuShow = (id) => {
  const elt = document.getElementById("figures-dropdown-" + id);
  elt.style.display = "block";
};

//========================================================================
const refresh = function() {
  Request.get("/scenarios/" + m.route.param("key"),
              resp => {
                scenario(resp.data);
              });
};

//========================================================================
const RatingBreakdown = {
  view: function(vnode) {
    const breakdown = vnode.attrs.breakdown;
    const numVotes = vnode.attrs.numVotes;
    if (!breakdown || breakdown.length === 0) {
      return null;
    }

    return m("div.rating-breakdown", [
      [5,4,3,2,1].map(n => {
        const pct = breakdown[n - 1] ? (breakdown[n - 1] / numVotes) * 100 : 0;
        return m("div", { className: "rating-background-" + n }, [
          m("span.label", n + " Star"),
          m("div.rating-bar-background", [
            m("div.rating-bar-foreground", { style: "width: " + pct + "%"})
          ]),
          m("span.value", breakdown[n - 1] === 0 ? "" : pct.toFixed(2) + "%")
        ]);
      })
    ]);
  }
};

//========================================================================
export const ScenarioDetails = {
  oninit: function(/*vnode*/) {
    refresh();
  },

  view: function() {
    const it = scenario();

    if (!it) {
      return [];
    }

    const starParams = {
      id: it.id,
      active: Credentials.isLoggedIn(),
      votes: it.num_votes,
      rating: it.rating,
      userRating: it.user_scenario.rating,
      callback: ScenarioUpdater.update
    };

    return [
      m(Header),
      m(Nav, { selected: "Scenario Details" }),
        it && m("div.main-content", [
          m("div.scenario-details", [
            m("div.page-title",
              it.name,
              Credentials.isAdmin()
                ? m("span.action", { onclick: () => m.route.set("/scenario-edit/" + it.id) }, K.ICON_STRINGS.edit)
                : null),
            m("div.scenario-rating", m(StarRating, starParams)),
            m("div.scenario-date", formatDate(it.date_age, it.date_year, it.date_month, it.date_day)),
            m("div.scenario-location", K.LOCATIONS[it.location]),
            m("div.scenario-blurb", it.blurb),
            m("div.scenario-map", "Map Size: " + it.map_width + "\" x " + it.map_height + "\""),
            m("div.scenario-factions", domFactionsRollup(it)),
            m("div.section-header", "Ratings"),
            m(RatingBreakdown, { breakdown: it.rating_breakdown, numVotes: it.num_votes }),
            m("div.scenario-resources", domResourcesRollup(it))
          ])
        ])
    ];
  }
};

ScenarioUpdater.addObserver((/*id, newAvgRating, userRating, newNumVotes*/) => {
  if (scenario() && m.route.get().startsWith("/scenarios/")) {
    refresh();
  }
});

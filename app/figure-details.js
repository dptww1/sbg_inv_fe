/*global BOOK_INFO, FACTION_INFO */

import m from "mithril";

import { ArmyListDetails     } from "./army-list-details.js";
import { Credentials         } from "./credentials.js";
import { EditDialog          } from "./components/edit-dialog.js";
import { EditInventoryDialog } from "./components/edit-inventory-dialog.js";
import { Filters             } from "./components/filters.js";
import { FigureHistoryList   } from "./components/figure-history-list.js";
import { Header              } from "./header.js";
import * as K                  from "./constants.js";
import { Nav                 } from "./nav.js";
import { Pie                 } from "./components/pie.js";
import { Request             } from "./request.js";
import * as U                  from "./utils.js";

let figure = { factions: [], scenarios: [], history: [], rules: [], resources: [] };

//========================================================================
const domAllegiance = () =>
  domFactionSubList(figure.factions,
    "Allegiance",
    abbrev => FACTION_INFO.byAbbrev(abbrev).legacy);

//========================================================================
const domArmyLists = () =>
  domFactionSubList(figure.factions,
    "Army List",
    abbrev => !FACTION_INFO.byAbbrev(abbrev).legacy);

//========================================================================
const domFactionSubList = (factionsList, title, filterFn) => {
  const active = factionsList ? factionsList.filter(filterFn) : [];

  return m(".figure-factions",
    m(".section-header", title + (active.length === 1 ? "" : "s")),
    m("table",
      active.length > 0
        ? active.map(abbrev =>
          m("tr",
            m("td.faction-name",
              m(m.route.Link,
                {
                  href: `/army-list/${FACTION_INFO.byAbbrev(abbrev).id}`
                },
                FACTION_INFO.byAbbrev(abbrev).name))))
        : m("tr", m("td", "None"))));
}

//========================================================================
const domHistory = () => {
  if (!Credentials.isLoggedIn() || !figure.history || figure.history.length < 1) {
    return null;
  }

  return m(".figure-history",
           m(".section-header", "Activity"),
           m(FigureHistoryList,
             {
               list: figure.history.map(rec => Object.assign(rec, { name: figure.name, plural_name: figure.plural_name})),
               hideName: true,
               callbackFn: () => refresh(figure.id)
             }));
};

//========================================================================
const domInventory = total => {
  if (!Credentials.isLoggedIn()) {
    return null;
  }

  return m(".figure-inventory",
           m(".section-header", "Inventory"),
           m("table",

             total >= 1 ? m("tr", m("td.figure-scenarios-total", "Maximum Needed"), m("td", total)) : null,

             m("tr",
               m("td.figure-owned", "# Owned"),
               m("td", figure.owned),
               m("td",
                 m("span.action",
                   {
                     onclick: () => EditInventoryDialog.show(figure, "buy_unpainted", () => refresh(figure.id))
                   },
                   K.ICON_STRINGS.plus)),
               figure.owned > 0
                 ? m("td",
                     m("span.action",
                       {
                         onclick: () => EditInventoryDialog.show(figure, "sell_unpainted", () => refresh(figure.id)),
                       },
                       K.ICON_STRINGS.minus))
                 : null,
               figure.owned > 0 && figure.owned > figure.painted
                 ? m("td",
                     m("span.action",
                       {
                         onclick: () => EditInventoryDialog.show(figure, "paint", () => refresh(figure.id))
                       },
                       K.ICON_STRINGS.paint_figure))
                 : null),

             m("tr",
               m("td.figure-painted", "# Painted"),
               m("td", figure.painted),
               m("td",
                 m("span.action",
                   {
                     onclick: () => EditInventoryDialog.show(figure, "buy_painted", () => refresh(figure.id))
                   },
                   K.ICON_STRINGS.plus)),
               figure.painted > 0
                 ? m("td",
                     m("span.action",
                       {
                         onclick: () => EditInventoryDialog.show(figure, "sell_painted", () => refresh(figure.id))
                       },
                       K.ICON_STRINGS.minus))
                 : null)));
};

//========================================================================
const domResources = () => {
  if (figure.resources === null || figure.resources.length === 0) {
    return null;
  }

  return [
    m(".section-header", "Resources"),
    domResourcesForType(figure.resources, "painting_guide", "Painting Guides"),
    domResourcesForType(figure.resources, "analysis", "Analysis")
  ];
};

//========================================================================
const domResourcesForType = (resourceList, type, title) => {
  const activeResources = resourceList.filter(r => r.type === type);

  if (!activeResources.length) {
    return null;
  }

  return m("div.figure-resource-list",
           m("span.figure-resource-icon",
             m("span.icon", m.trust(K.IMAGE_STRINGS[type]))),
           m("span.figure-resource-type.section-subheader",
             title),
           m("table.figure-resources",
             activeResources.map(r => {
               const resourceTitle = r.title || BOOK_INFO.byKey(r.book).name
               return m("tr",
                        m("td",
                          r.url
                            ? m("a", { href: r.url }, resourceTitle)
                            : `${resourceTitle}${r.issue ? '#' + r.issue : ''}, page ${r.page}`));
             })));
};

//========================================================================
const domRules = () => {
  if (!figure.rules || figure.rules.length === 0) {
    return null;
  }

  return [
    m(".section-header", "Profile" + (figure.rules.length > 1 ? "s" : "")),
    m("ul.profile",
      figure.rules
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(ref => m("li",
          U.resourceReference(ref),
          ref.name_override ? ` (${ref.name_override})` : "",
          ref.obsolete ? " (obsolete)" : "")))
  ];
};

//========================================================================
const domScenarios = total => {
  const filteredScenarios = figure.scenarios.filter(f => Filters.filter(f));
  return m(".figure-scenarios", [
    m(".section-header", "Scenario" + (filteredScenarios.length === 1 ? "" : "s")),
    m("table",
      filteredScenarios == 0
        ? m("tr", m("td", "None"))
        : filteredScenarios.map(s => m("tr",
                                       m("td.pie", m(Pie, { size: 24, n: s.amount, nPainted: figure.painted, nOwned: figure.owned })),
                                       m("td.scenario-name",
                                         m(m.route.Link, { href: "/scenarios/" + s.scenario_id }, s.name),
                                         m("span", " " + U.shortResourceLabel(s.source))),
                                       m("td.scenario-amount", total > 1 ? s.amount : null))))
  ]);
};

//========================================================================
const domSilhouette = () =>
      figure.slug
        ? m(".silhouette",
            m("img", { src: U.silhouetteUrl(figure.slug) }))
        : null;

//========================================================================
const domTotals = () => [
  m(".section-header", "In All Collections"),
  m("table",
    m("tr", m("td", "Owned"), m("td", figure.total_owned)),
    m("tr", m("td", "Painted"), m("td", figure.total_painted)))
];

//========================================================================
const initializeFigure = () => {
  figure = {
    factions: [],
    scenarios: [],
    rules: [],
    resources: []
  };
};

//========================================================================
const requestFigureModelData = figureId => {
  Request.get("/figure/" + figureId,
              resp => {
                figure = resp.data;
              });
};

//========================================================================
const refresh = id => {
  requestFigureModelData(id);
  ArmyListDetails.refreshArmyDetails();
};

//========================================================================
export const FigureDetails = {
  oninit: (/*vnode*/) => {
    initializeFigure();
    requestFigureModelData(m.route.param("key"));
  },

  view() {
    const total = figure.scenarios ? figure.scenarios.reduce((acc, s) => Math.max(acc, s.amount), 0) : null;

    return [
      m(Header),
      m(Nav, { selected: "Figure Details" }),
      m("div.main-content.figure-details-main-content", [
        m(Filters, { activeFilters: "Book" }),
        m(".page-title", figure.name),
        Credentials.isAdmin() ? m("button",
                                  { onclick: () => m.route.set("/figure-edit/" + figure.id) },
                                  "Edit Figure")
                              : null,
        domSilhouette(),
        domInventory(total),
        domArmyLists(),
        domAllegiance(),
        domRules(),
        domScenarios(total),
        domResources(),
        domTotals(),
        domHistory(),
        m(EditDialog)
      ]),
    ];
  }
};

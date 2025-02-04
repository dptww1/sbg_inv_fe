/*global FACTION_INFO */

import m from "mithril";

import { ArmyListFilter      } from "./components/army-list-filter.js";
import { Credentials         } from "./credentials.js";
import { EditDialog          } from "./components/edit-dialog.js";
import { EditInventoryDialog } from "./components/edit-inventory-dialog.js";
import { Header              } from "./header.js";
import * as K                  from "./constants.js";
import { Nav                 } from "./nav.js";
import { Pie                 } from "./components/pie.js";
import { Request             } from "./request.js";
import * as U                  from "./utils.js";

let armyId = "";
let armyListSources = [];
let figuresMap = {};
let factionOverviewMap = {};
let unaffiliatedFigureMap = {};

//========================================================================
const computeTotals = figureList => {
  return figureList.reduce((acc, val) => {
                             acc.needed += val.needed;
                             acc.owned += val.owned;
                             acc.painted += val.painted;
                             return acc;
                           },
                           { needed: 0, owned: 0, painted: 0 });
};

//========================================================================
const computeUnaffiliatedTotals = figureMap => {
  return Object.keys(figureMap)
               .reduce((acc, key) => {
                         const subTotals = computeTotals(figureMap[key]);
                         acc.needed += subTotals.needed;
                         acc.owned += subTotals.owned;
                         acc.painted += subTotals.painted;
                         return acc;
                       },
                       { needed: 0, owned: 0, painted: 0 });
};

//========================================================================
const domArmyDetails = armyListId => [
  m("span.action",
    { onclick: () => FigureList.updateArmyDetails("") },
    K.ICON_STRINGS.back),
  m("span.clickable",
    { onclick: () => FigureList.updateArmyDetails("") },
    "Back"),

  m(".page-title", armyListId < 0 ? "Unaffiliated" : FACTION_INFO.byId(armyListId).name),

  m("table",
    m("tr.table-header",
      m("td.section-header"),
      Credentials.isLoggedIn() ? m("td.numeric.section-header", "Owned") : null,
      Credentials.isLoggedIn() ? m("td.numeric.section-header[colspan=2]", "Painted") : null,
      m("td.section-header[colspan=2]", "Needed"),
      m("td.section-header", "Resources"),
      Credentials.isAdmin() ? m("td") : null),
    domFigureListByType("Characters", figuresMap.heroes.filter(fig => fig.unique)),
    domFigureListByType("Heroes", figuresMap.heroes.filter(fig => !fig.unique)),
    domFigureListByType("Warriors", figuresMap.warriors),
    domFigureListByType("Monsters", figuresMap.monsters),
    domFigureListByType("Siege Equipment", figuresMap.siegers),
    domTotals()),

  domArmyListSources(),
];

//========================================================================
const domArmyLists = () => {
  const totals = factionOverviewMap["Totals"]
        || { owned: 0, painted: 0 };

  return [
    m(ArmyListFilter),
    m("table.striped",
      m("tr.table-header",
        m("td.section-header", "Army List"),
        Credentials.isLoggedIn() ? m("td.numeric.section-header", "Owned") : null,
        Credentials.isLoggedIn() ? m("td.numeric.section-header[colspan=2]", "Painted") : null),

      FACTION_INFO.all().map(f => {
        if (!ArmyListFilter.shouldShowArmyListName(f.abbrev)) {
          return null;
        }

        let thisMap = factionOverviewMap[f.abbrev];
        return m("tr",
                 m("td",
                   m("a", { onclick: () => FigureList.updateArmyDetails(f.id) }, f.name)),
                 m("td.numeric", thisMap ? thisMap.owned : ""),
                 m("td.numeric", thisMap ? thisMap.painted : ""),
                 m("td", thisMap ? m(Pie, { size: 24, n: thisMap.owned, nPainted: thisMap.painted, nOwned: thisMap.owned }) : "")
                );
      }),


      ArmyListFilter.isFilterActive() || ArmyListFilter.usingAllegianceMode()
        ? null
        : m("tr",
            m("td",
              m("a", { onclick: () => FigureList.updateArmyDetails(-1) }, "Unaffiliated")),
            unaffiliatedFigureMap
              ? [
                  m("td.numeric", unaffiliatedFigureMap.owned),
                  m("td.numeric", unaffiliatedFigureMap.painted),
                  m("td",
                    Credentials.isLoggedIn()
                      ? m(Pie, { size: 24, n: unaffiliatedFigureMap.owned, nPainted: unaffiliatedFigureMap.painted, nOwned: unaffiliatedFigureMap.owned })
                      : null)
                ]
              : [
                  m("td", ""),
                  m("td", ""),
                  m("td", "")
              ]),

        Credentials.isLoggedIn() && !ArmyListFilter.isFilterActive()
          ? [
              m("tr.totals",
                m("td", "Totals"),
                m("td.numeric", totals.owned.toLocaleString()),
                m("td.numeric", totals.painted.toLocaleString()),
                m("td", m(Pie, { size: 24, n: totals.owned, nPainted: totals.painted, nOwned: totals.owned })))
            ]
          : null
      ),
      Credentials.isLoggedIn() && !ArmyListFilter.isFilterActive()
        ? m("p.field-note",
            "Because figures can belong to multiple factions, Totals are not the sum of the faction numbers. " +
            "They are the actual number of figures in your collection.")
        : null
     ];
};

//========================================================================
const domArmyListSources = () => {
  if (!armyListSources || armyListSources.length === 0) {
    return null;
  }

  return [
    m(".section-header", "Source" + (armyListSources.length > 1 ? "s" : "")),
    m("ul.sources",
      armyListSources.map(src => m("li", U.resourceReference(src))))
  ];
};

//========================================================================
const domFigureListByType = (title, list) => {
  if (list.length === 0) {
    return null;
  }

  return [
    m("tr.figure-list-section", m("td.section-header", { colspan: 2 }, title)),
    list.map((fig, idx) => Credentials.isLoggedIn()
             ? m("tr.constant-height", { className: idx % 2 == 0 ? "striped" : null },
                 m("td",
                   {
                     class: "name" + (fig.slug ? " hasSilhouette" : ""),
                     style: `--img: url('${U.silhouetteUrl(fig.slug)}')`
                   },
                   m(m.route.Link, { href: "/figures/" + fig.id }, fig["name"])
                  ),
                 m("td.numeric",
                   m("a",
                     {
                       onclick: () => EditInventoryDialog.show(
                         fig,
                         "buy_unpainted",
                         FigureList.refreshArmyDetails) },
                     fig.owned)),
                 m("td.numeric",
                   fig.painted < fig.owned
                     ? m("a",
                         {
                           onclick: () => EditInventoryDialog.show(
                             fig,
                             "paint",
                             FigureList.refreshArmyDetails)
                         },
                         fig.painted)
                     : fig.painted),
                 m("td.pie", m(Pie, { size: 24, n: fig.owned, nPainted: fig.painted, nOwned: fig.owned })),
                 m("td.numeric", fig.needed),
                 m("td.pie",
                   fig.needed > 0
                     ? m(Pie, { size: 24, n: fig.needed, nPainted: fig.painted, nOwned: fig.owned })
                     : null),
                 m("td.resources",
                   domResources(fig)),
                 Credentials.isAdmin()
                   ? m("td.icon", { onclick: () => m.route.set(`/figure-edit/${fig.id}`) }, K.ICON_STRINGS.edit)
                   : null
                )

             : m("tr",
                 m("td.name",
                   m(m.route.Link, { href: "/figures/" + fig.id }, fig["name"])),

                 m("td.numeric", fig.needed),

                 m("td", ""),

                 m("td",
                   domResources(fig))
                )
            )
  ];
};

//========================================================================
const domResources = fig => {
  return [
    fig.num_painting_guides ? m("span", m.trust(K.IMAGE_STRINGS["painting_guide"])) : "",
    " ",
    fig.num_analyses ? m("span", m.trust(K.IMAGE_STRINGS["analysis"])) : ""
  ];
};

//========================================================================
const domTotals = () => {
  const stats = Object.keys(figuresMap)
                      .reduce((acc, k) => {
                                const totalsMap = computeTotals(figuresMap[k]);
                                acc.needed += totalsMap.needed;
                                acc.owned += totalsMap.owned;
                                acc.painted += totalsMap.painted;
                                return acc;
                              },
                              { needed: 0, owned: 0, painted: 0 });

  return [
    m("tr.totals",
      m("td", "Totals"),
      Credentials.isLoggedIn() ? m("td.numeric", stats.owned) : null,
      Credentials.isLoggedIn() ? m("td.numeric", stats.painted) : null,
      Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: stats.owned, nPainted: stats.painted, nOwned: stats.owned })) : null,
      m("td.numeric", stats.needed),
      Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: stats.needed, nPainted: stats.painted, nOwned: stats.owned })) : null
     )
  ];
};

//========================================================================
// The new "sources" element in the response data messes up the figure
// summations, so take it out.
//------------------------------------------------------------------------
const extractArmyListSources = respData => {
  if (respData.sources) {
    armyListSources = respData.sources;
    delete respData.sources;

  } else {
    armyListSources = [];
  }
};

//========================================================================
export const FigureList = {
  refreshArmyDetails: () => {
    if (armyId === "") {
      if (Credentials.isLoggedIn()) {
        Request.get("/faction",
                    resp => {
                      extractArmyListSources(resp.data);
                      factionOverviewMap = resp.data;
                      Request.get("/faction/-1",
                                  uresp => unaffiliatedFigureMap = computeUnaffiliatedTotals(uresp.data));
                    });
      } else {
        factionOverviewMap = {
          factions: FACTION_INFO.all().reduce((acc, f) => {
            acc[f.abbrev] = { owned: 0, painted: 0 };
            return acc;
          },
          {})
        };
      }
    } else {
      Request.get("/faction/" + armyId,
                  resp => {
                    extractArmyListSources(resp.data);
                    figuresMap = resp.data;
                    Object.keys(figuresMap)
                          .forEach(k => figuresMap[k].sort((a, b) => U.strCmp(a.name, b.name)));
                  });
    }
  },

  updateArmyDetails: id => {
    armyId = id;
    armyListSources = [];
    figuresMap = {
      characters: [],
      heroes: [],
      warriors: [],
      monsters: [],
      siegers: []
    };
    unaffiliatedFigureMap = {};
    FigureList.refreshArmyDetails();
  },

  oncreate: () => {
    FigureList.refreshArmyDetails();
  },

  view: () => {
    return [
      m(Header),
      m(Nav, { selected: "Figures" }),
      m("div.main-content figure-list-main-content",
        Credentials.isAdmin()
          ? [
              m("button", { onclick: () => m.route.set("/figure-edit") }, "Add Figure"),
              m("br")
            ]
          : null,
        armyId === ""
          ? domArmyLists()
          : domArmyDetails(armyId)),
        m(EditDialog)
    ];
  }
};

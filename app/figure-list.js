/* global require module */

const m           = require("mithril");

const Credentials = require("credentials");
const Editor2     = require("components/figure-inventory-editor2");
const Header      = require("header");
const K           = require("constants");
const Nav         = require("nav");
const Pie         = require("components/pie");
const Request     = require("request");
const U           = require("utils");

var armyId = "";
var figuresMap = {};
var factionOverviewMap = {};
var unaffiliatedFigureMap = {};

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
const domArmyDetails = () => {
  if (armyId === "") {
    const totals = factionOverviewMap["Totals"]
                   || { owned: 0, painted: 0 }
    return [
      m("table.striped",
        m("tr.table-header",
          m("td", ""),
          Credentials.isLoggedIn() ? m("td.owned", "Owned") : null,
          Credentials.isLoggedIn() ? m("td.painted[colspan=2]", "Painted") : null),

        K.SORTED_FACTION_NAMES.map(name => {
          let faction = K.FACTION_ABBREV_BY_NAME[name];
          let thisMap = factionOverviewMap[faction];
          return m("tr",
                   m("td",
                     m("a", { onclick: _ => FigureListScreen.updateArmyDetails(K.FACTION_ID_BY_NAME[name]) }, name)),
                   m("td.owned", thisMap ? thisMap.owned : ""),
                   m("td.painted", thisMap ? thisMap.painted : ""),
                   m("td", thisMap ? m(Pie, { size: 24, n: thisMap.owned, nPainted: thisMap.painted, nOwned: thisMap.owned }) : "")
                  );
        }),

        m("tr",
          m("td",
            m("a", { onclick: _ => FigureListScreen.updateArmyDetails(-1) }, "Unaffiliated")),
            unaffiliatedFigureMap
              ? [
                  m("td.owned", unaffiliatedFigureMap.owned),
                  m("td.painted", unaffiliatedFigureMap.painted),
                  m("td",
                    Credentials.isLoggedIn()
                      ? m(Pie, { size: 24, n: unaffiliatedFigureMap.owned, nPainted: unaffiliatedFigureMap.painted, nOwned: unaffiliatedFigureMap.owned })
                      : null)
                ]
              : [
                  m("td.owned", ""),
                  m("td.painted", ""),
                  m("td", "")
              ]
         ),
        Credentials.isLoggedIn()
          ? [
              m("tr",
                m("td", "Totals"),
                m("td.owned", totals.owned),
                m("td.painted", totals.painted),
                m("td", m(Pie, { size: 24, n: totals.owned, nPainted: totals.painted, nOwned: totals.owned })))
            ]
          : null
       ),
       Credentials.isLoggedIn()
         ? m("div.note",
             "(Because figures can belong to multiple factions, Totals are not the sum of the faction numbers. " +
             "They are the actual number of figures in your collection.)")
         : null
     ];
  }

  return m("table",
           m("tr.table-header",
             m("td.section-header"),
             Credentials.isLoggedIn() ? m("td.owned", "Owned") : null,
             Credentials.isLoggedIn() ? m("td.painted[colspan=2]", "Painted") : null,
             m("td.needed[colspan=2]", "Needed")),
           domFigureListByType("Characters", figuresMap.heroes.filter(fig => fig.unique)),
           domFigureListByType("Heroes", figuresMap.heroes.filter(fig => !fig.unique)),
           domFigureListByType("Warriors", figuresMap.warriors),
           domFigureListByType("Monsters", figuresMap.monsters),
           domFigureListByType("Siege Equipment", figuresMap.siegers),
           domTotals(figuresMap));
};

//========================================================================
const domFigureListByType = (title, list) => {
  if (list.length === 0) {
    return null;
  }

  return [
    m("tr.figure-list-section", m("td.section-header", { colspan: 2 }, title)),
    list.map(fig => Credentials.isLoggedIn()
             ? m("tr",
                 m("td",
                   {
                     class: "name" + (fig.slug ? " hasSilhouette" : ""),
                     style: "--img: url('" + U.silhouetteUrl(fig.slug) + "')"
                   },
                   m(m.route.Link, { href: "/figures/" + fig.id }, fig["name"])
                  ),
                 m("td.owned",
                   m("a",
                     { onclick: () => Editor2.createUnpaintedHistory(fig, FigureListScreen.refreshArmyDetails) },
                     fig.owned)),
                 m("td.painted",
                   fig.painted < fig.owned
                   ? m("a",
                       { onclick: () => Editor2.createPaintedHistory(fig, FigureListScreen.refreshArmyDetails) },
                       fig.painted)
                   : fig.painted),
                 m("td.pie", m(Pie, { size: 24, n: fig.owned, nPainted: fig.painted, nOwned: fig.owned })),
                 m("td.needed", fig.needed),
                 m("td.pie", m(Pie, { size: 24, n: fig.needed, nPainted: fig.painted, nOwned: fig.owned })))

             : m("tr",
                 m("td.name",
                   m(m.route.Link, { href: "/figures/" + fig.id }, fig["name"]),
                   //TODO
                  ),
                 m("td.needed", fig.needed))
            )
  ];
};

//========================================================================
const domTotals = figuresMap => {
  if (armyId === "") {
    return null;
  }

  const key = Object.keys(K.FACTION_INFO)
                    .find(key => K.FACTION_INFO[key].id === parseInt(armyId, 10));

  const name = key ? K.FACTION_INFO[key].name : "Unaffiliated";

  const stats = Object.keys(figuresMap)
                      .reduce((acc, key) => {
                                const totalsMap = computeTotals(figuresMap[key]);
                                acc.needed += totalsMap.needed;
                                acc.owned += totalsMap.owned;
                                acc.painted += totalsMap.painted;
                                return acc;
                              },
                              { needed: 0, owned: 0, painted: 0 });

  return [
    m("tr.figure-list-section",
      m("td.section-header", "Totals"),
      Credentials.isLoggedIn() ? m("td.owned", stats.owned) : null,
      Credentials.isLoggedIn() ? m("td.painted", stats.painted) : null,
      Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: stats.owned, nPainted: stats.painted, nOwned: stats.owned })) : null,
      m("td.needed", stats.needed),
      Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: stats.needed, nPainted: stats.painted, nOwned: stats.owned })) : null
     )
  ];
};

//========================================================================
const FigureListScreen = {
  refreshArmyDetails: () => {
    if (armyId === "") {
      if (Credentials.isLoggedIn()) {
        Request.get("/faction",
                    resp => {
                      factionOverviewMap = resp.data;
                      Request.get("/faction/-1",
                                  uresp => unaffiliatedFigureMap = computeUnaffiliatedTotals(uresp.data));
                    });
      } else {
        factionOverviewMap = {
          factions: K.SORTED_FACTION_NAMES.reduce((acc, name) => {
                                                    acc[K.FACTION_ABBREV_BY_NAME[name]] = { owned: 0, painted: 0 };
                                                    return acc;
                                                  },
                                                  {})
        };
      }
    } else {
      Request.get("/faction/" + armyId,
                  resp => {
                    figuresMap = resp.data;
                    Object.keys(figuresMap)
                          .forEach(k => figuresMap[k].sort((a, b) => U.strCmp(a.name, b.name)));
                  });
    }
  },

  updateArmyDetails: id => {
    armyId = id;
    figuresMap = {
      characters: [],
      heroes: [],
      warriors: [],
      monsters: [],
      siegers: []
    };
    unaffiliatedFigureMap = {};
    FigureListScreen.refreshArmyDetails();
  },

  oncreate: () => {
    FigureListScreen.refreshArmyDetails();
  },

  view: () => {
    return [
      m(Header),
      m(Nav, { selected: "Figures" }),
      m("div.main-content figure-list-main-content",
        Credentials.isAdmin() ? [ m("button", { onclick: _ => m.route.set("/figure-edit") }, "Add New Figure"), m("br") ] : null,
        armyId !== "" ? m("a",
                          { onclick: _ => FigureListScreen.updateArmyDetails("") },
                          m("span.icon", K.ICON_STRINGS.log_out),
                          armyId < 0 ? "Unaffiliated" : K.FACTION_NAME_BY_ID[armyId])
                      : null,
        domArmyDetails()),
      m(Editor2)
    ];
  }
};

module.exports = FigureListScreen;

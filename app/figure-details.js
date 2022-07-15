/* global module, require */

const m          = require("mithril");
const prop       = require("mithril/stream");

const Credentials   = require("credentials");
const FigureList    = require("figure-list");
const Filters       = require("components/filters");
const Editor        = require("components/figure-inventory-editor");
const FigureHistory = require("components/figure-history-list");
const Header        = require("header");
const K             = require("constants");
const Nav           = require("nav");
const Pie           = require("components/pie");
const Request       = require("request");
const U             = require("utils");

var figure = { factions: [], scenarios: [], history: [], rules: [] };

//========================================================================
const chooseFaction = (fid) => {
  FigureList.updateArmyDetails(Object.keys(K.FACTION_INFO).findIndex(f => f == fid ));
  m.route.set("/figures");
};

//========================================================================
const domFactions = () => {
  return m(".figure-factions",
           m(".section-header", "Army Lists"),
           m("table",
             figure.factions.length > 0
               ? figure.factions.map(f => m("tr", m("td.faction-name", m("a", { onclick: _ => chooseFaction(f) }, K.FACTION_INFO[f].name))))
               : m("tr", m("td", "None"))));
};

//========================================================================
const domHistory = () => {
  if (!Credentials.isLoggedIn() || !figure.history || figure.history.length < 1) {
    return null;
  }

  return m(".figure-history",
           m(".section-header", "Activity"),
           m(FigureHistory,
             {
               list: figure.history.map(rec => Object.assign(rec, { name: figure.name, plural_name: figure.plural_name})),
               hideName: true,
               callbackFn: _ => refresh(figure.id)
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
               m("td.action",
                 m("a",
                   {
                     onclick: () => Editor.createHistory(figure, "buy_unpainted", update)
                   },
                   K.ICON_STRINGS.plus)),
               figure.owned > 0
                 ? m("td.action",
                     m("a",
                       {
                         onclick: () => Editor.createHistory(figure, "sell_unpainted", update)
                       },
                       K.ICON_STRINGS.minus))
                 : null,
               figure.owned > 0 && figure.owned > figure.painted
                 ? m("td.action",
                     m("a",
                       {
                         onclick: () => Editor.createHistory(figure, "paint", update)
                       },
                       K.ICON_STRINGS.paint_figure))
                 : null),

             m("tr",
               m("td.figure-painted", "# Painted"),
               m("td", figure.painted),
               m("td.action",
                 m("a",
                   {
                     onclick: () => Editor.createHistory(figure, "buy_painted", update)
                   },
                   K.ICON_STRINGS.plus)),
               figure.painted > 0
                 ? m("td.action",
                     m("a",
                       {
                         onclick: () => Editor.createHistory(figure, "sell_painted", update)
                       },
                       K.ICON_STRINGS.minus))
                 : null)));
};

//========================================================================
const domRules = () => {
  if (!figure.rules || figure.rules.length === 0) {
    return null;
  }

  return [
    m(".section-header", "Rules"),

    figure.rules.length == 1
      ?
        m("", K.BOOK_NAMES[figure.rules[0].book], " page ", figure.rules[0].page)
      :
        figure.rules.map(ch =>
          m("", ch.name, " ", K.BOOK_NAMES[ch.book], " page ", ch.page, m("br"))),
  ];
};

//========================================================================
const domScenarios = total => {
  const filteredScenarios = figure.scenarios.filter(f => Filters.filter(f));
  return m(".figure-scenarios", [
    m(".section-header", "Scenarios"),
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
const domSilhouette = _ =>
      figure.slug
        ? m(".silhouette",
            m("img", { src: U.silhouetteUrl(figure.slug) }))
        : null;

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
  FigureList.refreshArmyDetails();
};

//========================================================================
const update = hist => {
  const amt = parseInt(hist.amount, 10);

  switch (hist.op) {
  case "buy_unpainted":
    hist.new_owned += amt;
    break;

  case "buy_painted":
    hist.new_owned += amt;
    hist.new_painted += amt;
    break;

  case "paint":
    if (amt > (hist.new_owned - hist.new_painted)) {
      Editor.addError("You can't paint more figures than you own!");
      return false;
    }
    hist.new_painted += amt;
    break;

  case "sell_unpainted":
    if (amt > (hist.new_owned - hist.new_painted)) {
      Editor.addError("You can't sell more figures than you own!");
      return false;
    }
    hist.new_owned -= amt;
    break;

  case "sell_painted":
    if (amt > hist.new_owned || amt > hist.new_painted) {
      Editor.addError("You can't sell more figures than you own!");
      return false;
    }
    hist.new_owned -= amt;
    hist.new_painted -= amt;
    break;

  default:
    alert(`Unknown op #{hist.op}!`);
    return false;
  }

  Request.post("/userfigure",
               { user_figure: hist },
               resp => {
                 refresh(figure.id);
               });

  return true;
};

//========================================================================
const FigureDetailScreen = {
  oninit: (/*vnode*/) => {
    figure = { factions: [], scenarios: [], rules: [] };
    requestFigureModelData(m.route.param("key"));
  },

  view() {
    const total = figure.scenarios ? figure.scenarios.reduce((acc, s) => Math.max(acc, s.amount), 0) : null;

    return [
      m(Header),
      m(Nav, { selected: "Figure Details" }),
      m("div.main-content", [
        m(Filters, { activeFilters: "Book" }),
        m(".detail-page-title", figure.name),
        Credentials.isAdmin() ? m("button",
                                  { onclick: ev => m.route.set("/figure-edit/" + figure.id) },
                                  "Edit Figure")
                              : null,
        domSilhouette(),
        domInventory(total),
        domRules(),
        domFactions(),
        domScenarios(total),
        domHistory(),
        m(Editor)
      ]),
    ];
  }
};

module.exports = FigureDetailScreen;

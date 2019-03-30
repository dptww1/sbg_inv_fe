/* global require module */

const m           = require("mithril");

const Credentials = require("credentials");
const Header      = require("header");
const K           = require("constants");
const Nav         = require("nav");
const Pie         = require("components/pie");
const Request     = require("request");

var armyId = "";
var figuresMap = {};

//========================================================================
const domArmyDetails = () => {
  if (armyId === "") {
    return null;
  }

  return m("table",
           armyId >= 0
             ? m("tr.table-header",
                 m("td", ""),
                 Credentials.isLoggedIn() ? m("td.owned", "Owned") : null,
                 Credentials.isLoggedIn() ? m("td.painted[colspan=2]", "Painted") : null,
                 m("td.needed[colspan=2]", "Needed"))
             : null,
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
    list.map(fig => {
      return m("tr",
               m("td.name", m("a", { href: "/figures/" + fig.id, oncreate: m.route.link }, fig["name"])),
               Credentials.isLoggedIn() ? m("td.owned", fig.owned) : null,
               Credentials.isLoggedIn() ? m("td.painted", fig.painted) : null,
               Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: fig.owned, nPainted: fig.painted, nOwned: fig.owned })) : null,
               m("td.needed", fig.needed),
               Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: fig.needed, nPainted: fig.painted, nOwned: fig.owned })) : null
              );
    })
  ];
};

//========================================================================
const domTotals = figuresMap => {
  if (armyId === "") {
    return null;
  }

  const key = Object.keys(K.FACTION_INFO)
                    .find(key => K.FACTION_INFO[key].id === parseInt(armyId, 10));

  const name = K.FACTION_INFO[key].name;

  const stats = Object.keys(figuresMap)
                      .reduce((acc, key) => {
                                figuresMap[key].forEach(fig => {
                                                          acc.needed += fig.needed;
                                                          acc.owned += fig.owned;
                                                          acc.painted += fig.painted;
                                });
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
    if (armyId !== "") {
      Request.get("/faction/" + armyId,
                  resp => figuresMap = resp.data);
    }
  },

  updateArmyDetails: (ev) => {
    armyId = ev.target.value;
    figuresMap = {
      characters: [],
      heroes: [],
      warriors: [],
      monsters: [],
      siegers: []
    };
    FigureListScreen.refreshArmyDetails();
  },

  view: () => {
    return [
      m(Header),
      m(Nav, { selected: "Figures" }),
      m("div.main-content figure-list-main-content",
        m("select.faction",
          { onchange: ev => FigureListScreen.updateArmyDetails(ev) },

          m("option",
            { value: "" },
            "-- Select an Army --"),

          K.SORTED_FACTION_NAMES.map(name => m("option",
                                               {
                                                 value: K.FACTION_ID_BY_NAME[name],
                                                 selected: K.FACTION_ID_BY_NAME[name] === armyId
                                               },
                                               name)),

          m("option",
            {
              value: "-1",
              selected: armyId === "-1"
            },
            "Unaffiliated")),

        Credentials.isAdmin() ? m("span.icon", { onclick: _ => m.route.set("/figure-edit") }, K.ICON_STRINGS.plus) : null,
        domArmyDetails())
    ];
  }
};

module.exports = FigureListScreen;

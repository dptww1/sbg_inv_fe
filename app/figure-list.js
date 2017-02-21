/* global require module */

var FigureListScreen = {};
module.exports = FigureListScreen;

var m       = require("mithril");
var K       = require("constants");
var Request = require("request");

var armyId = "";
var figuresMap = {};

//========================================================================
function figureListByType(title, list) {
    if (list.length === 0) {
        return null;
    }

    return m("div.figure-list-section", [
               m("div.section-header", title),
               m("div.list", list.map(fig => {
                   return m("div.name", m("a", { href: "/figures/" + fig.id, oncreate: m.route.link }, fig["name"]));
               }))
             ]);
};

//========================================================================
function armyDetails() {
    if (armyId == "") {
        return null;
    }

    return [
        figureListByType("Characters", figuresMap.heroes.filter(fig => fig.unique)),
        figureListByType("Heroes", figuresMap.heroes.filter(fig => !fig.unique)),
        figureListByType("Warriors", figuresMap.warriors),
        figureListByType("Monsters", figuresMap.monsters),
        figureListByType("Siege Equipment", figuresMap.siegers)
    ];
};

//========================================================================
FigureListScreen.updateArmyDetails = (ev) => {
    armyId = ev.target.value;
    figuresMap = {
        characters: [],
        heroes: [],
        warriors: [],
        monsters: [],
        siegers: []
    };
    Request.get("/faction/" + armyId,
                resp => {
                    figuresMap = resp.data;
                });
}

//========================================================================
FigureListScreen.view = () => {
    return [
        m(require("header")),
        m(require("nav"), { selected: "Figures" }),
        m("div.main-content figure-list-main-content", [
            m("select.faction", { onchange: ev => FigureListScreen.updateArmyDetails(ev) }, [
                  m("option", { value: "" }, "-- Select an Army --"),
                  Object.keys(K.FACTION_INFO).map((k, i) => m("option", { value: i, selected: i == armyId }, K.FACTION_INFO[k].name))
              ])
          ]),
        armyDetails()
    ];
};

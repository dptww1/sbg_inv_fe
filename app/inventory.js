/* global require module */

var InventoryScreen = {};
module.exports = InventoryScreen;

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

    return m("div.inventory-section", [
               m("div.section-header", title),
               m("div.list", list.map(fig => {
                   return m("div.name", m("a", { href: "/figures/" + fig.id, config: m.route }, fig["name"]));
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
InventoryScreen.updateArmyDetails = (ev) => {
    armyId = ev.target.value;
    figuresMap = {};
    Request.get("/faction/" + armyId,
                resp => {
                    figuresMap = resp.data;
                });
}

//========================================================================
InventoryScreen.view = () => {
    return [
        m(require("header")),
        m(require("nav"), "Inventory"),
        m("div.main-content inventory-main-content", [
            m("select.faction", { onchange: ev => InventoryScreen.updateArmyDetails(ev) }, [
                  m("option", { value: "" }, "-- Select an Army --"),
                  Object.keys(K.FACTION_INFO).map((k, i) => m("option", { value: i, selected: i == armyId }, K.FACTION_INFO[k].name))
              ])
          ]),
        armyDetails()
    ];
};

/* global require module */

var InventoryScreen = {};
module.exports = InventoryScreen;

var m       = require("mithril");
var K       = require("constants");
var Request = require("request");

var armyId = "";
var figuresMap = {};

//========================================================================
var figureListByType = function(title, list) {
    if (list.length === 0) {
        return null;
    }

    return m("div.inventory-section", [
               m("div.title", title),
               m("div.list", list.map(fig => {
                   return m("div.name", fig["name"]);
               }))
             ]);
};

//========================================================================
var armyDetails = function() {
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
var updateArmyDetails = function(ev) {
    armyId = ev.target.value;
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
            m("select.faction", { onchange: ev => updateArmyDetails(ev) }, [
                  m("option", { value: "" }, "-- Select an Army --"),
                  Object.keys(K.FACTION_INFO).map((k, i) => m("option", { value: i }, K.FACTION_INFO[k].name))
              ])
          ]),
        armyDetails()
    ];
};

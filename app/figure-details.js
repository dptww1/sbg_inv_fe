/* global module, require */

var m          = require("mithril");
var FigureList = require("figure-list");
var Header     = require("header");
var K          = require("constants");
var Request    = require("request");

var figure = { factions: [], scenarios: [] };

//========================================================================
function chooseFaction(fid) {
    FigureList.updateArmyDetails({ target: { value: Object.keys(K.FACTION_INFO).findIndex(f => f == fid ) } });
    m.route.set("/figures");
}

//========================================================================
var FigureDetailScreen = {
    oninit: (/*vnode*/) => {
        figure = { factions: [], scenarios: [] };
        Request.get("/figure/" + m.route.param("id"),
                    resp => {
                        figure = resp.data;
                    });
    },

    view() {
        var total = figure.scenarios ? figure.scenarios.reduce((acc, s) => Math.max(acc, s.amount), 0) : null;

        return [
            m(Header),
            m(require("nav"), { selected: "Figure Details" }),
            m("div.main-content", [
                m(".detail-page-title", figure.name),
                m(".figure-factions", [
                    m(".section-header", "Army Lists"),
                    figure.factions.length > 0
                        ? figure.factions.map(f => m(".faction-name", m("a", { onclick: _ => chooseFaction(f) }, K.FACTION_INFO[f].name)))
                        : "None"
                ]),
                m(".figure-scenarios", [
                    m(".section-header", "Scenarios"),
                    figure.scenarios.map(s => m(".scenario-name", [
                        m("a", { oncreate: m.route.link, href: "/scenarios/" + s.scenario_id }, s.name),
                        total > 1 ? m("span.amount", "(" + s.amount + ")") : null
                    ]))
                ]),
                m(".figure-inventory", [
                    m(".section-header", "Inventory"),
                    m("table", [
                        total >= 1 ? m("tr", m("td.figure-scenarios-total", "Maximum Needed"), m("td", total)) : null,
                        m("tr", m("td.figure-owned", "# Owned"), m("td", figure.owned)),
                        m("tr", m("td.figure-painted", "# Painted"), m("td", figure.painted))
                    ])
                ])
              ])
        ];
    }
};

module.exports = FigureDetailScreen;

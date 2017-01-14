/* global module, require */

var m          = require("mithril");
var FigureList = require("inventory");
var Header     = require("header");
var K          = require("constants");
var Request    = require("request");

var figure = {};

//========================================================================
function chooseFaction(fid) {
    FigureList.updateArmyDetails({ target: { value: Object.keys(K.FACTION_INFO).findIndex(f => f == fid ) } });
    m.route("/inventory");
}

//========================================================================
var FigureDetailScreen = {
    controller() {
        figure = {};
        Request.get("/figure/" + m.route.param("id"),
                    resp => {
                        figure = resp.data;
                    });
    },

    view(ctrl) {

        var total = figure.scenarios ? figure.scenarios.reduce((acc, s) => Math.max(acc, s.amount), 0) : null;

        return [
            m(Header),
            m(require("nav"), "Figure Details"),
            m("div.main-content", [
                m(".detail-page-title", figure.name),
                m(".figure-factions", [
                    m(".section-header", "Army Lists"),
                    figure.factions.map(f => m(".faction-name", m("a", { onclick: _ => chooseFaction(f) }, K.FACTION_INFO[f].name)))
                ]),
                m(".figure-scenarios", [
                    m(".section-header", "Scenarios"),
                    figure.scenarios.map(s => m(".scenario-name", [
                        m("a", { config: m.route, href: "/scenarios/" + s.scenario_id }, s.name),
                        total > 1 ? m("span.amount", "(" + s.amount + ")") : null
                    ]))
                ]),
                total > 1 ? m(".figure-scenarios-total", [ m("div", "Maximum Needed: " + total) ]) : null
              ])
        ];
    }
};

module.exports = FigureDetailScreen;

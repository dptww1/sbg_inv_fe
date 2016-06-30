/* global m */
var API_URL = "http://127.0.0.1:4000/api";

var mainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='#']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

var scenarioListScreen = {
    data: m.prop(false),

    controller: function() {
        m.request({method: "GET", url: API_URL + "/scenarios"}).then(scenarioListScreen.data).then(function() { m.redraw(); });
    },

    view: function(ctrl) {
        return [
            m("h3", "Scenarios"),
            scenarioListScreen.data() ? scenarioListScreen.drawTable(scenarioListScreen.data().data) : "nope"
        ];
    },

    drawTable: function(rawData) {
        var rows = [];
        rawData.forEach(function(scenario) {
            rows.push(m("tr", [m("td", scenario.name)]));
        });
        return m("table", rows);
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/": mainScreen,
    "/scenarios": scenarioListScreen
});

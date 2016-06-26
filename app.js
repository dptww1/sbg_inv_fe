var mainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='#']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

var scenarioListScreen = {
    view: function() {
        return m("table", [
            m("tr", [m("td", "Scenario 1")]),
            m("tr", [m("td", "Scenario 2")]),
                  ]);
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/": mainScreen,
    "/scenarios": scenarioListScreen
});

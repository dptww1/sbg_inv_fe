/* global m */
var API_URL = "http://127.0.0.1:4000/api";

var BOOK_NAMES = {
    site: "A Shadow in the East"
}

//==================================================================================================================================
var MainScreen = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='#']", {config: m.route}, "Figures")),
                   m("li", m("a[href='/scenarios']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

//==================================================================================================================================
var ScenarioListScreen = {
    data: m.prop(false),

    controller: function() {
        m.request({method: "GET", url: API_URL + "/scenarios"}).then(ScenarioListScreen.data).then(function() { m.redraw(); });
    },

    view: function(ctrl) {
        return [
            m("h3", "Scenarios"),
            ScenarioListScreen.data() ? ScenarioListScreen.drawTable(ScenarioListScreen.data().data) : "nope"
        ];
    },

    drawTable: function(rawData) {
        var rows = [];
        rawData.forEach(function(scenario) {
            rows.push(m("tr", [m("td.name", [ m("a", { class: "scenario-detail-link", config: m.route, href: "/scenarios/" + scenario.id}, scenario.name) ]),
                               m("td.date-age", ScenarioListScreen.ageAbbrev(scenario.date_age)),
                               m("td.date-year", scenario.date_year)]));
        });
        return m("table.scenario-list", rows);
    },

    ageAbbrev: function(ageNumber) {
        if (1 <= ageNumber && ageNumber <= 3) {
            return ["?", "FA", "SA", "TA"][ageNumber];
        }
        return "??";
    }
};

//==================================================================================================================================
var ScenarioDetailScreen = {
    data: m.prop(false),

    controller: function() {
        m.request({method: "GET", url: API_URL + "/scenarios/" + m.route.param("id")}).then(ScenarioDetailScreen.data).then(function() { m.redraw(); });
    },

    view: function(ctrl) {
        var scenario = ScenarioDetailScreen.data().data;

        return [
            m("div.scenario-details", [
                m("div.scenario-title", scenario.name),
                m("div.scenario-date", [
                    m("div.date-age", ["", "FA", "SA", "TA"][scenario.date_age || 0]),
                    m("div.date-year", scenario.date_year)
                ]),
                m("div.scenario-blurb", scenario.blurb),
                m("div.scenario-factions", ScenarioDetailScreen.factionsRollup(scenario)),
                m("div.scenario-resources", ScenarioDetailScreen.resourcesRollup(scenario))
            ])
        ];
    },

    factionsRollup: function(scenario) {
        if (!scenario.scenario_factions) {
            return null;
        }

        f = [ m("div.scenario-details-section-title", "Participants") ];
        scenario.scenario_factions.forEach(function(faction) {
            f.push(m("div.faction", faction.faction));
        });
        return m("div.scenario-factions", f);
    },

    resourcesRollup: function(scenario) {
        if (!scenario.scenario_resources) {
            return null;
        }

        r = [ m("div.scenario-details-section-title", "Resources") ];
        ScenarioDetailScreen.resourcesRollupAddSource(r, scenario.scenario_resources);
        return m("div.scenario-resources", r);
    },

    resourcesRollupAddSource: function(eltArray, scenarioResources) {
        scenarioResources.forEach(function(resource) {
            if (resource.resource_type === "source") {
                eltArray.push(m("div.scenario-source", [
                    m("span.scenario-source-title", "Source: "),
                    m("span.scenario-source-book-title", BOOK_NAMES[resource.book]),
                    m("span.scenario-source-book-page", ", page " + resource.page)
                ]));
            }
        });
    }
}

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/": MainScreen,
    "/scenarios/:id": ScenarioDetailScreen,
    "/scenarios": ScenarioListScreen
});

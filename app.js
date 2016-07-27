/* global m */
var API_URL = "http://127.0.0.1:4000/api";

var MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var BOOK_NAMES = {
    fotn: "Fall of the Necromancer",
    saf:  "Shadow & Flame",
    sog:  "Siege of Gondor",
    site: "A Shadow in the East"
};

function formatDate(age, year, month, day) {

    var a = [ ["", "FA", "SA", "TA"][age || 0] ];
    if (day) {
        a.push(day);
    }
    if (month) {
        a.push(MONTH_NAMES[month]);
    }
    a.push(year);
    return a.join(" ");
}

// courtesy http://ratfactor.com/daves-guide-to-mithril-js
var requestWrapper = function(opts) {
    return new function() {
        var me = this;
        me.opts = opts;
        me.success = me.loading = me.failed = false;
        me.errorStatus = me.errorBody = "";
        me.data = null;
        me.opts.background = true;
        me.opts.extract = function(xhr) {
            if (xhr.status >= 300) {
                me.failed = true;
                me.success = me.loading = false;
                me.errorStatus = xhr.status;
                me.errorBody = xhr.responseText;
                m.redraw();
            }
            return xhr.responseText;
        };
        me.go = function() {
            me = me;
            me.loading = true;
            me.success = me.failed = false;
            m.request(me.opts).then(function(mydata) {
                me.success = true;
                me.failed = me.loading = false;
                me.data = mydata;
                m.redraw();
            });
        };
    };
};

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
        var rows = [
            m("tr", [
                m("th.name", "Scenario"),
                m("th.date[colspan=2]", "Date"),
                m("th.source", "Source"),
                m("th.size", "Size"),
                m("th.factions[colspan=2]", "Factions"),
                m("th.resources", "Resources")
            ])];

        rawData.forEach(function(scenario) {
            rows.push(m("tr", [
                m("td.name", [ m("a", { class: "scenario-detail-link", config: m.route, href: "/scenarios/" + scenario.id}, scenario.name) ]),
                m("td.date-age", ScenarioListScreen.ageAbbrev(scenario.date_age)),
                m("td.date-year", scenario.date_year),
                m("td.source", scenario.scenario_resources["source"][0].title),
                m("td.size", scenario.size),
                m("td.faction faction1", "g"),
                m("td.faction faction2", "e"),
                m("td.resources", ScenarioListScreen.resourceIcons(scenario.scenario_resources))
            ]));
        });
        return m("table.scenario-list", rows);
    },

    ageAbbrev: function(ageNumber) {
        if (1 <= ageNumber && ageNumber <= 3) {
            return ["?", "FA", "SA", "TA"][ageNumber];
        }
        return "??";
    },

    resourceIcons: function(resources) {
        var r = [];
        if (resources.web_replay != null && resources.web_replay.length > 0) {
            r.push(m("span", "W"));
        }
        if (resources.video_replay != null && resources.video_replay.length > 0) {
            r.push(m("span", "V"));
        }
        if (resources.podcast != null && resources.podcast.length > 0) {
            r.push(m("span", "P"));
        }
        return r;
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
                m("div.scenario-date", formatDate(scenario.date_age, scenario.date_year, scenario.date_month, scenario.date_day)),
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

        var f = [ m("div.scenario-details-section-title", "Participants") ];
        scenario.scenario_factions.forEach(function(faction) {
            f.push(ScenarioDetailScreen.factionRollup(faction));
        });
        return m("div.factions-container", f);
    },

    factionRollup: function(faction) {
        return m("div.faction", [ m("div.faction-name", faction.faction)].concat(ScenarioDetailScreen.figuresRollup(faction.figures)));
    },

    figuresRollup: function(figuresList) {
        var figs = [];
        if (figuresList != null) {
            figuresList.forEach(function(f) {
                figs.push(m("div.figure-line", [
                    m("div.figure-line-amount", f.amount),
                    m("div.figure-line-name", f.name)
                ]));
            });
        }
        return figs;
    },

    resourcesRollup: function(scenario) {
        if (!scenario.scenario_resources) {
            return null;
        }

        var r = [ m("div.scenario-details-section-title", "Resources") ];
        ScenarioDetailScreen.resourcesRollupAddSource(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddVideoReplays(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddWebReplays(r, scenario.scenario_resources);
        return m("div.scenario-resources", r);
    },

    resourcesRollupAddSource: function(eltArray, resources) {
        if (resources.source) {
            resources.source.forEach(function(resource) {
                eltArray.push(m("div.scenario-source", [
                    m("span.scenario-source-title", "Source: "),
                    m("span.scenario-source-book-title", BOOK_NAMES[resource.book]),
                    m("span.scenario-source-book-page", ", page " + resource.page)
                ]));
            });
        }
    },

    resourcesRollupAddVideoReplays: function(eltArray, resources) {
        if (resources.video_replay) {
            resources.video_replay.forEach(function(resource) {
                eltArray.push(m("div.video-replay", [
                    m("span.scenario-video-replay-title", "Video Replay: "),
                    m("span.scenario-video-replay-url", [
                        m("a", { href: resource.url }, resource.title || resource.url)
                    ])
                ]));
            });
        }
    },

    resourcesRollupAddWebReplays: function(eltArray, resources) {
        if (resources.web_replay) {
            resources.web_replay.forEach(function(resource) {
                eltArray.push(m("div.web-replay", [
                    m("span.scenario-web-replay-title", "Web Replay: "),
                    m("span.scenario-web-replay-url", [
                        m("a", { href: resource.url }, resource.title || resource.url)
                    ])
                ]));
            });
        }
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/": MainScreen,
    "/scenarios/:id": ScenarioDetailScreen,
    "/scenarios": ScenarioListScreen
});

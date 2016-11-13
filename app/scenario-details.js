/* global module, require */

var m           = require("mithril");
var Credentials = require("credentials");
var Header      = require("header");
var K           = require("constants");
var Pie         = require("pie");
var Request     = require("request");
var StarRating  = require("star-rating");

var MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function formatDate(age, year, month, day) {
    var a = [ ["", "FA", "SA", "TA"][age || 0] ];
    if (day > 0) {
        a.push(day);
    }
    if (month > 0) {
        a.push(MONTH_NAMES[month]);
    }
    a.push(year);
    return a.join(" ");
};

//========================================================================
var ScenarioDetailScreen = {
    data: m.prop(false),

    controller: function() {
        Request.get("/scenarios/" + m.route.param("id"),
                    resp => {
                        ScenarioDetailScreen.data(resp);
                        m.redraw();
                    });
    },

    view: function(ctrl) {
        var scenario = ScenarioDetailScreen.data().data;

        return [
            m(Header),
            m(require("nav"), "Scenario Details"),
            m("div.main-content", [
                m("div.scenario-details", [
                    m("div.scenario-title", scenario.name),
                    m("div.scenario-rating", m(StarRating, Credentials.isLoggedIn(), scenario)),
                    m("div.scenario-date", formatDate(scenario.date_age, scenario.date_year, scenario.date_month, scenario.date_day)),
                    m("div.scenario-blurb", scenario.blurb),
                    m("div.scenario-factions", ScenarioDetailScreen.factionsRollup(scenario)),
                    m("div.scenario-resources", ScenarioDetailScreen.resourcesRollup(scenario))
                ])
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
        return m("div.faction", [
            m("div.faction-name", K.FACTION_INFO[faction.faction].name)
        ].concat(ScenarioDetailScreen.rolesRollup(faction.roles)));
    },

    rolesRollup: function(rolesList) {
        var roles = [];
        if (rolesList != null) {
            rolesList.forEach(function(r) {
                roles.push(m("div.role-line", [
                    m(Pie, 24, r.amount, r.num_painted, r.num_owned),
                    r.amount > 1 ? m("div.role-line-amount", r.amount) : null,
                    m("div.role-line-name", r.name)
                ].concat(ScenarioDetailScreen.figuresRollup(r.figures))));
            });
        }
        if (roles.length == 0) {
            roles.push(m("div.role-line", "None (no, really!)"));
        }
        return roles;
    },

    figuresRollup: function(figuresList) {
        var figures = [];
        if (figuresList.length > 1) {
            figuresList.forEach(function(f) {
                figures.push(m("div.figure-line", [
                    m(Pie, 24, f.owned, f.painted, f.owned),
                    f.owned > 1 ? m("div.figure-line-amount", f.owned) : null,
                    m("div.figure-line-name", f.name)
                ]));
            });
        }
        return figures;
    },

    resourcesRollup: function(scenario) {
        if (!scenario.scenario_resources) {
            return null;
        }

        var r = [ m("div.scenario-details-section-title", "Resources") ];
        ScenarioDetailScreen.resourcesRollupAddSource(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddVideoReplays(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddWebReplays(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAddPodcasts(r, scenario.scenario_resources);
        return m("div.scenario-resources", r);
    },

    resourcesRollupAddSource: function(eltArray, resources) {
        if (resources.source) {
            resources.source.forEach(function(resource) {
                eltArray.push(m("div.scenario-source", [
                    m("span.scenario-source-title", "Source: "),
                    m("span.scenario-source-book-title", K.BOOK_NAMES[resource.book]),
                    m("span.scenario-source-book-page", ", page " + resource.page)
                ]));
            });
        }
    },

    resourcesRollupAddPodcasts: function(eltArray, resources) {
        if (resources.podcast) {
            resources.podcast.forEach(function(resource) {
                eltArray.push(m("div.podcast", [
                    m("span.scenario-podcast-title", "Podcast: "),
                    m("span.scenario-podcast-url", [
                        m("a", { href: resource.url }, resource.title || resource.url)
                    ])
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

module.exports = ScenarioDetailScreen;

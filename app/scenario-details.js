/* global module, require */

var m           = require("mithril");
var prop        = require("mithril/stream");

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

//========================================================================
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
var refresh = function() {
    Request.get("/scenarios/" + m.route.param("id"),
                resp => {
                    ScenarioDetailScreen.data(resp);
                });
};

//========================================================================
var resourceItemHtml = function(res) {
    return res.url ? m("a", { href: res.url }, res.title || res.url)
                   : res.title + (res.issue ? " #" + res.issue : "") + (res.page ? ", page " + res.page : "");
}

//========================================================================
var RatingBreakdown = function() {
    return {
        view: function(vnode) {
            var breakdown = vnode.attrs.breakdown;
            var numVotes = vnode.attrs.numVotes;
            if (!breakdown || breakdown.length === 0) {
                return null;
            }

            return m("div.rating-breakdown", [
                [5,4,3,2,1].map(n => {
                    var pct = breakdown[n - 1] ? (breakdown[n - 1] / numVotes) * 100 : 0;
                    return m("div", { className: "rating-background-" + n }, [
                        m("span.label", n + " Star"),
                        m("div.rating-bar-background", [
                            m("div.rating-bar-foreground", { style: "width: " + pct + "%"})
                          ]),
                        m("span.value", breakdown[n - 1] === 0 ? "" : pct.toFixed(2) + "%")
                    ]);
                })
            ]);
        }
    };
}();

//========================================================================
var ScenarioDetailScreen = {
    data: prop(false),

    oninit: function(/*vnode*/) {
        refresh();
    },

    view: function() {
        var scenario = ScenarioDetailScreen.data().data;

        return [
            m(Header),
            m(require("nav"), { selected: "Scenario Details" }),
            scenario ?
                m("div.main-content", [
                    m("div.scenario-details", [
                        m("div.detail-page-title", scenario.name),
                        m("div.scenario-rating", m(StarRating, { isActive: Credentials.isLoggedIn(), scenario: scenario, callback: refresh })),
                        m("div.scenario-date", formatDate(scenario.date_age, scenario.date_year, scenario.date_month, scenario.date_day)),
                        m("div.scenario-location", K.LOCATIONS[scenario.location]),
                        m("div.scenario-blurb", scenario.blurb),
                        m("div.scenario-map", "Map Size: " + scenario.map_width + "\" x " + scenario.map_height + "\""),
                        m("div.scenario-factions", ScenarioDetailScreen.factionsRollup(scenario)),
                        m("div.section-header", "Ratings"),
                        m(RatingBreakdown, { breakdown: scenario.rating_breakdown, numVotes: scenario.num_votes }),
                        m("div.scenario-resources", ScenarioDetailScreen.resourcesRollup(scenario))
                    ])
                ]) : null
        ];
    },

    factionsRollup: function(scenario) {
        if (!scenario.scenario_factions) {
            return null;
        }

        var f = [ m("div.section-header", "Participants") ];
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
                    m(Pie, { size: 24, n: r.amount, nPainted: r.num_painted, nOwned: r.num_owned }),
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

        var r = [ m("div.section-header", "Resources") ];
        ScenarioDetailScreen.resourcesRollupAddSource(r, scenario.scenario_resources);
        ScenarioDetailScreen.resourcesRollupAdd(r, scenario.scenario_resources.video_replay, "video-replay", "Video Replay", K.ICON_STRINGS.video_replay);
        ScenarioDetailScreen.resourcesRollupAdd(r, scenario.scenario_resources.web_replay, "web-replay", "Web Replay", K.ICON_STRINGS.web_replay);
        ScenarioDetailScreen.resourcesRollupAdd(r, scenario.scenario_resources.podcast, "podcast", "Podcast", K.ICON_STRINGS.podcast);
        ScenarioDetailScreen.resourcesRollupAdd(r, scenario.scenario_resources.magazine_replay, "magazine-replay", "Magazine Replay", K.ICON_STRINGS.magazine_replay);
        return r;
    },

    resourcesRollupAdd: (eltArray, resourceArray, className, titleStr, iconCharStr) => {
        if (resourceArray.length > 0) {
            if (resourceArray.length == 1) {
                eltArray.push(m("div." + className, [
                                    m("span.icon", iconCharStr),
                                    m("span.scenario-" + className + "-title", titleStr + ": "),
                                    m("span.scenario-" + className + "-url", [ resourceItemHtml(resourceArray[0]) ])
                                ]));
            } else {
                var items = resourceArray.map(res => {
                    return m("li", { className: "span.scenario-" + className + "-url" }, [ resourceItemHtml(res) ]);
                });
                eltArray.push(m("span.icon", iconCharStr)),
                eltArray.push(m("span.scenario-" + className + "-title", titleStr + "s: "));
                eltArray.push(m("ul.resource-list", items));
            }
        }
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
    }
};

module.exports = ScenarioDetailScreen;

/* global module, require */

const m           = require("mithril");
const prop        = require("mithril/stream");

const Credentials = require("credentials");
const Header      = require("header");
const K           = require("constants");
const Pie         = require("pie");
const Request     = require("request");
const StarRating  = require("star-rating");

const MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var scenario = prop();

//========================================================================
function domFactionRollup(faction) {
    return m("div.faction",
             m("div.faction-name", K.FACTION_INFO[faction.faction].name),
             domRolesRollup(faction.roles));
}

//========================================================================
function domFactionsRollup() {
    if (!scenario().scenario_factions) {
        return null;
    }

    var f = [ m("div.section-header", "Participants") ];

    scenario().scenario_factions.forEach(function(faction) {
        f.push(domFactionRollup(faction));
    });

    return m("div.factions-container", f);
}

//========================================================================
function domFiguresRollup(role, figuresList) {
    if (figuresList.length > 1) {
        return m("div.figures-dropdown",
                 {
                     id: "figures-dropdown-" + role.id,
                     onmouseover: () => menuShow(role.id),
                     onmouseout: () => menuHide(role.id)
                 },
                 figuresList.reduce((acc, f) => {
                     acc.push(m("div.figure-line",
                                m(Pie,{ size: 24, n: role.amount, nPainted: f.painted, nOwned: f.owned }),
                                f.owned > 1 ? m("div.figure-line-amount", f.owned) : null,
                                m("div.figure-line-name",
                                  m("a", {href: "/figures/" + f.figure_id, oncreate: m.route.link}, f.name))));
                     return acc;
                 }, []));
    }

    return null;
}

//========================================================================
function domResourcesRollupAdd(eltArray, resourceArray, className, titleStr, iconCharStr) {
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
}

//========================================================================
function domResourcesRollupAddSource(eltArray, resources) {
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

//========================================================================
function domResourcesRollup() {
    if (!scenario().scenario_resources) {
        return null;
    }

    var r = [ m("div.section-header", "Resources") ];
    domResourcesRollupAddSource(r, scenario().scenario_resources);
    domResourcesRollupAdd(r, scenario().scenario_resources.video_replay, "video-replay", "Video Replay", K.ICON_STRINGS.video_replay);
    domResourcesRollupAdd(r, scenario().scenario_resources.web_replay, "web-replay", "Web Replay", K.ICON_STRINGS.web_replay);
    domResourcesRollupAdd(r, scenario().scenario_resources.podcast, "podcast", "Podcast", K.ICON_STRINGS.podcast);
    domResourcesRollupAdd(r, scenario().scenario_resources.magazine_replay, "magazine-replay", "Magazine Replay", K.ICON_STRINGS.magazine_replay);
    return r;
}

//========================================================================
function domRolesRollup(rolesList) {
    var roles = [];

    if (rolesList != null) {
        rolesList.forEach(function(r) {
            roles.push(m("div.role-line",
                         m(Pie, { size: 24, n: r.amount, nPainted: r.num_painted, nOwned: r.num_owned }),
                         r.amount > 1 ? m("div.role-line-amount", r.amount) : null,
                         m("div.role-line-name", r.figures.length > 1
                           ? m("span",
                               {
                                   onmouseover: () => menuShow(r.id),
                                   onmouseout: () => menuHide(r.id)
                               },
                               r.name)
                           : m("a", {href: "/figures/" + r.figures[0].figure_id, oncreate: m.route.link}, r.name)),
                         domFiguresRollup(r, r.figures)));
        });

        if (roles.length == 0) {
            roles.push(m("div.role-line", "None (no, really!)"));
        }

        return roles;
    }
}

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
function menuHide(id) {
    const elt = document.getElementById("figures-dropdown-" + id);
    elt.style.display = "none";
}

//========================================================================
function menuShow(id) {
    const elt = document.getElementById("figures-dropdown-" + id);
    elt.style.display = "block";
}

//========================================================================
var refresh = function() {
    Request.get("/scenarios/" + m.route.param("id"),
                resp => {
                    scenario(resp.data);
                });
};

//========================================================================
var resourceItemHtml = function(res) {
    return res.url ? m("a", { href: res.url }, res.title || res.url)
                   : res.title + (res.issue ? " #" + res.issue : "") + (res.page ? ", page " + res.page : "");
}

//========================================================================
var RatingBreakdown = {
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

//========================================================================
var ScenarioDetailScreen = {
    oninit: function(/*vnode*/) {
        refresh();
    },

    view: function() {
        const it = scenario();

        return [
            m(Header),
            m(require("nav"), { selected: "Scenario Details" }),
            it && m("div.main-content", [
                m("div.scenario-details", [
                    m("div.detail-page-title", it.name),
                    m("div.scenario-rating", m(StarRating, { isActive: Credentials.isLoggedIn(), scenario: it, callback: refresh })),
                    m("div.scenario-date", formatDate(it.date_age, it.date_year, it.date_month, it.date_day)),
                    m("div.scenario-location", K.LOCATIONS[it.location]),
                    m("div.scenario-blurb", it.blurb),
                    m("div.scenario-map", "Map Size: " + it.map_width + "\" x " + it.map_height + "\""),
                    m("div.scenario-factions", domFactionsRollup(it)),
                    m("div.section-header", "Ratings"),
                    m(RatingBreakdown, { breakdown: it.rating_breakdown, numVotes: it.num_votes }),
                    m("div.scenario-resources", domResourcesRollup(it))
                ])
            ])
        ];
    }
};

module.exports = ScenarioDetailScreen;

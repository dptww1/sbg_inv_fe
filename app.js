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

var FACTION_INFO = {
    angmar:        { name: "Angmar",        letter: "a" },
    dol_guldur:    { name: "Dol Guldur",    letter: "x" },
    dwarves:       { name: "Dwarves",       letter: "d" },
    easterlings:   { name: "Easterlings",   letter: "e" },
    fellowship:    { name: "Fellowship",    letter: "f" },
    free_peoples:  { name: "Free Peoples",  letter: "F" },
    gondor:        { name: "Gondor",        letter: "g" },
    isengard:      { name: "Isengard",      letter: "i" },
    lothlorien:    { name: "Lothlorien",    letter: "l" },
    mirkwood:      { name: "Mirkwood",      letter: "w" },
    moria:         { name: "Moria",         letter: "m" },
    mordor:        { name: "Mordor",        letter: "M" },
    rivendell:     { name: "Rivendell",     letter: "R" },
    rohan:         { name: "Rohan",         letter: "r" },
    white_council: { name: "White Council", letter: "w" }
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

function cmp(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
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

var Pie = {
    view: function(ctrl, size, n, nPainted, nOwned) {
        var circleAttrs = { cx: size/2, cy: size/2, r: size/2-2, fill: '#ccc' };
        var pctPainted  = Math.min(n > 0 ? nPainted / n : 0, 1.0);
        var pctOwned    = Math.min(n > 0 ? nOwned   / n : 0, 1.0);

        // Use the most appropriate base cirle color
        if (pctPainted == 1.0) {
            circleAttrs.fill = '#0c0';
        } else if (pctOwned == 1.0) {
            circleAttrs.fill = '#cc0';
        }

        return m("svg", { width: size, height: size}, [
            m("circle", circleAttrs),
            Pie.slice(circleAttrs, 0, pctPainted, "#0c0"),
            Pie.slice(circleAttrs, pctPainted, pctOwned, "#dd0")
        ]);
    },

    slice: function slice(circleAttrs, pctStart, pctEnd, fill) {
        // No slices at 0% or 100%
        if (pctStart >= pctEnd || (pctStart == 0.0 && pctEnd == 1.0)) {
            return null;
        }

        var pathParts = [];
        pathParts.push("M" + circleAttrs.cx + "," + circleAttrs.cy);
        pathParts.push("L" +
                       (circleAttrs.cx + (Math.sin(pctStart * 2 * Math.PI) * circleAttrs.r)) + "," +
                       (circleAttrs.cy - (Math.cos(pctStart * 2 * Math.PI) * circleAttrs.r)));
        pathParts.push("A" + circleAttrs.r + "," + circleAttrs.r);
        pathParts.push("0");  // x-axis rotate
        pathParts.push((pctEnd - pctStart >= .5 ? "1" : "0") + ",1"); // long-arc, clockwise
        pathParts.push((circleAttrs.cx + (Math.sin(pctEnd * 2 * Math.PI) * circleAttrs.r)) + "," +
                       (circleAttrs.cy - (Math.cos(pctEnd * 2 * Math.PI) * circleAttrs.r)));
        pathParts.push("z");

        return m("path", {
            d: pathParts.join(" "),
            style: "fill: " + fill + "; fill-opacity: 1; stroke: black; stroke-width: 1"
        });
    }
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
                m("th.name[data-sort-by=name]", m.trust("Scenario<span class='sort-arrow'>&nbsp;</span>")),
                m("th.date[data-sort-by=date][colspan=2]", m.trust("Date<span class='sort-arrow'>&#9650;</span>")),
                m("th.source[data-sort-by=source]", m.trust("Source<span class='sort-arrow'>&nbsp;</span>")),
                m("th.size[data-sort-by=size]", m.trust("Size<span class='sort-arrow'>&nbsp;</span>")),
                m("th.factions[colspan=2]", "Factions"),
                m("th.resources", "Resources")
            ])];

        rawData.forEach(function(scenario) {
            var f1 = FACTION_INFO[scenario.scenario_factions[0].faction];
            var f2 = FACTION_INFO[scenario.scenario_factions[1].faction];
            rows.push(m("tr", [
                m("td.name", [ m("a", { class: "scenario-detail-link", config: m.route, href: "/scenarios/" + scenario.id}, scenario.name) ]),
                m("td.date-age", ScenarioListScreen.ageAbbrev(scenario.date_age)),
                m("td.date-year", scenario.date_year),
                m("td.source", scenario.scenario_resources["source"][0].title),
                m("td.size", scenario.size),
                m("td.faction faction1", {title: f1 && f1.name}, f1.letter),
                m("td.faction faction2", {title: f2 && f2.name}, f2.letter),
                m("td.resources", ScenarioListScreen.resourceIcons(scenario.scenario_resources))
            ]));
        });
        return m("table.scenario-list", ScenarioListScreen.tableSorter(rawData), rows);
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
    },

    tableSorter: function(list) {
        return {
            onclick: function(ev) {
                var prop = ev.target.getAttribute("data-sort-by");
                if (prop) {
                    var sorters = {
                        name: function(a, b) {
                            return cmp(a[prop], b[prop]);
                        },

                        date: function(a, b) { // TODO: handle dates of same year with month,day = (0,0) & non-TA dates
                            return cmp(a.date_year, b.date_year) ||
                                   cmp(a.date_month, b.date_month) ||
                                   cmp(a.date_day, b.date_day);
                        },

                        size: function(a, b) {
                            return cmp(a[prop], b[prop]);  // TODO: tiebreaker
                        },

                        source: function(a, b) {
                            var a_src = a.scenario_resources["source"][0];
                            var b_src = b.scenario_resources["source"][0];
                            return cmp(a_src.title, b_src.title) ||
                                   cmp(a_src.sort_order, b_src.sort_order);
                        }
                    };

                    var arrowNodes = document.getElementsByClassName("sort-arrow");
                    for (var i = 0; i < arrowNodes.length; ++i) {
                        arrowNodes[i].innerHTML = "&nbsp;";
                    }

                    var arrowChar = "&#9650;";   // ^
                    var firstId = list[0].id;
                    list.sort(sorters[prop]);
                    if (firstId === list[0].id) {
                        list.reverse();
                        arrowChar = "&#9660;";   // v
                    }
                    ev.target.getElementsByClassName("sort-arrow")[0].innerHTML = arrowChar;
                }
            }
        };
    }
};

//==================================================================================================================================
var ScenarioDetailScreen = {
    data: m.prop(false),

    controller: function() {
        m.request({
            method: "GET",
            url: API_URL + "/scenarios/" + m.route.param("id")
        }).then(ScenarioDetailScreen.data)
          .then(function() { m.redraw(); });
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
        return m("div.faction", [
            m("div.faction-name", FACTION_INFO[faction.faction].name)
        ].concat(ScenarioDetailScreen.figuresRollup(faction.figures)));
    },

    figuresRollup: function(figuresList) {
        var figs = [];
        if (figuresList != null) {
            figuresList.forEach(function(f) {
                figs.push(m("div.figure-line", [
                    m(Pie, 24, f.amount, f.num_painted, f.num_owned),
                    f.amount > 1 ? m("div.figure-line-amount", f.amount) : null,
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

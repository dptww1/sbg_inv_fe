/* global module require */

var m           = require("mithril");
var Credentials = require("credentials");
var Header      = require("header");
var Pie         = require("pie");
var K           = require("constants");
var Request     = require("request");
var StarRating  = require("star-rating");

//========================================================================
function cmp(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

//========================================================================
var ScenarioListScreen = function() {
    var filters = {
        source: {
            data: [
                { name: "bpf",    state: false },
                { name: "fotn",   state: false },
                { name: "mordor", state: false },
                { name: "roa",    state: false },
                { name: "saf",    state: false },
                { name: "site",   state: false },
                { name: "sots",   state: false },
                { name: "ttt_jb", state: false }
            ],

            evalFn(rec) {
                var activeFilters = filters.source.data.filter((f) => f.state);
                return activeFilters.length == 0 ? true : activeFilters.find((s) => s.name === rec.scenario_resources.source[0].book);  // TODO: non-book sources
            }
        },

        size: {
            data: [
                { name: "tiny",   state: false, label: "Tiny",   sizeMin:  0, sizeMax: 20 },
                { name: "small",  state: false, label: "Small",  sizeMin: 21, sizeMax: 40 },
                { name: "medium", state: false, label: "Medium", sizeMin: 41, sizeMax: 60 },
                { name: "large",  state: false, label: "Large",  sizeMin: 61, sizeMax: 100 },
                { name: "huge",   state: false, label: "Huge",   sizeMin: 101, sizeMax: 10000 },
            ],

            evalFn(rec) {
                var activeFilters = filters.size.data.filter(f => f.state);
                return activeFilters.length == 0 || activeFilters.find(s => s.sizeMin <= rec.size && rec.size <= s.sizeMax);
            }
        }
    };

    return {
        data: m.prop(false),

        filter(rec) { return Object.keys(filters).reduce((acc, v) => filters[v].evalFn(rec) && acc, true); },

        getSetFilters(filterClass) {
            if (filterClass == null) {
                return Object.keys(filters).reduce((acc, v) => acc += ScenarioListScreen.getSetFilters(v).length, 0);
            }
            return filters[filterClass].data.filter((elt) => elt.state);
        },

        getUnsetFilters(filterClass) {
            return filters[filterClass].data.filter((elt) => !elt.state);
        },

        isFilterActive(filterClass, name) {
            return filters[filterClass].data.find((elt) => elt.name == name).state;
        },

        setFilter(filterClass, name) {
            var filter = filters[filterClass].data.find((elt) => elt.name == name);
            if (filter != null) {
                filter.state = true;
            }
        },

        unsetAllFilters() {
            for (var filterClass in filters) {
                filters[filterClass].data.forEach(f => f.state = false);
            }
        },

        unsetFilter(filterClass, name) {
            var filter = filters[filterClass].data.find((elt) => elt.name == name);
            if (filter != null) {
                filter.state = false;
            }
        },

        controller: function() {
            Request.get(K.API_URL + "/scenarios",
                        resp => {
                            ScenarioListScreen.data(resp);
                            m.redraw();
                        });
        },

        view: function(ctrl) {
            return [
                m(Header),
                m(require("nav"), "Scenario List"),
                m("div.main-content", [
                    ScenarioListScreen.data() ? ScenarioListScreen.drawTable(ScenarioListScreen.data().data) : "nope"
                ])
            ];
        },

        drawTable: function(rawData) {
            var rows = [
                m("tr", [
                    m("th.completion[data-sort-by=completion]", m.trust("Ready?<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.name[data-sort-by=name]", m.trust("Scenario<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.date[data-sort-by=date][colspan=2]", m.trust("Date<span class='sort-arrow'>&#9650;</span>")),
                    m("th.source[data-sort-by=source]", m.trust("Source<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.size[data-sort-by=size]", m.trust("Size<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.rating[data-sort-by=rating]", m.trust("Rating<span class='sort-arrow'>&nbsp;</span>")),
                    m("th.factions[colspan=2]", "Factions"),
                    m("th.resources", "Resources")
                ])];

            rawData.forEach(scenario => {
                var f1 = K.FACTION_INFO[scenario.scenario_factions[0].faction];
                var f2 = K.FACTION_INFO[scenario.scenario_factions[1].faction];
                if (ScenarioListScreen.filter(scenario)) {
                    rows.push(m("tr", [
                        m("td.completion", [m(Pie, 24, scenario.size, scenario.user_scenario.painted, scenario.user_scenario.owned)]),
                        m("td.name", [ m("a", { class: "scenario-detail-link", config: m.route, href: "/scenarios/" + scenario.id}, scenario.name) ]),
                        m("td.date-age", ScenarioListScreen.ageAbbrev(scenario.date_age)),
                        m("td.date-year", scenario.date_year),
                        m("td.source", scenario.scenario_resources["source"][0].title),
                        m("td.size", scenario.size),
                        m("td.rating", m(StarRating, Credentials.isLoggedIn(), scenario)),
                        m("td.faction faction1", {title: f1 && f1.name}, f1.letter),
                        m("td.faction faction2", {title: f2 && f2.name}, f2.letter),
                        m("td.resources", ScenarioListScreen.resourceIcons(scenario.scenario_resources))
                    ]));
                }
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
                r.push(m("span", "\ue922"));
            }
            if (resources.video_replay != null && resources.video_replay.length > 0) {
                r.push(m("span", "\uea9d"));
            }
            if (resources.podcast != null && resources.podcast.length > 0) {
                r.push(m("span", "\uea27"));
            }
            return r;
        },

        tableSorter: function(list) {
            return {
                onclick: function(ev) {
                    var prop = ev.target.getAttribute("data-sort-by");
                    if (prop) {
                        var sorters = {
                            completion: function(a, b) {
                                var d = cmp(a.user_scenario.painted / a.size, b.user_scenario.painted / b.size);
                                if (d == 0) {
                                    d = cmp(a.user_scenario.owned / a.size, b.user_scenario.owned / b.size);
                                }
                                if (d == 0) {
                                    d = cmp(b.size, a.size);
                                    if (d == 0) {
                                        d = cmp(a.name, b.name);
                                    }
                                }
                                return d;
                            },

                            name: function(a, b) {
                                return cmp(a[prop], b[prop]);
                            },

                            date: function(a, b) { // TODO: handle dates of same year with month,day = (0,0)
                                return cmp(a.date_age, b.date_age) ||
                                       cmp(a.date_year, b.date_year) ||
                                       cmp(a.date_month, b.date_month) ||
                                       cmp(a.date_day, b.date_day);
                            },

                            rating: function(a, b) {
                                return cmp(a.rating, b.rating);  // TODO: tiebreaker
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
}();

module.exports = ScenarioListScreen;

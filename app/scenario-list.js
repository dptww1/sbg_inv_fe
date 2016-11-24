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
function bookFilterOptions() {
    var rev_book_names = Object.keys(K.BOOK_NAMES).reduce((map, abbrev) => {
        map[K.BOOK_NAMES[abbrev]] = abbrev;
        return map;
    }, {});

    return Object.keys(K.BOOK_NAMES).map(k => K.BOOK_NAMES[k]).sort((a,b) => {
        a = a.replace(/^The /, "").replace(/^A /, "");
        b = b.replace(/^The /, "").replace(/^A /, "");

        if (a < b) {
            return -1;
        }
        if (b < a) {
            return 1;
        }
        return 0;
    }).reduce((list, name) => list.concat([name + "=" + rev_book_names[name]]), []);
}

//========================================================================
function SelectFilter(name, optionList, matchFn) {
    var self = this;

    this.label          = name;
    this.internalName   = name.sub(/[^A-Za-z0-9]/g, "-");
    this.optionMap      = {};   // key: orderedOptions[n]  value: { label: string, active: boolean}
    this.orderedOptions = [];
    this.activeOptions  = 0;

    optionList.forEach(opt => {
        var [optLabel, optVal] = opt.split(/\s*=\s*/);
        optVal = optVal || optLabel;
        this.orderedOptions.push(optVal);
        this.optionMap[optVal] = { label: optLabel, active: false };
    });

    this.view = _ => {
        return m("div.filter-group", [
            m("select",
              {
                  name: self.internalName,
                  onchange: ev => { self.optionMap[ev.target.value].active = true; ++self.activeOptions; }
              },
              [ m("option[value=]", "... by " + self.label) ].concat(
                  self.orderedOptions.map(optVal => {
                      return self.optionMap[optVal].active ? null : m("option", { value: optVal }, self.optionMap[optVal].label);
                  })
              )),

            m("ul.filter-group", self.orderedOptions.filter(opt => self.optionMap[opt].active).map(f => {
                return m("li",
                         { onclick: ev => { self.optionMap[f].active = false; --self.activeOptions; } },
                         self.optionMap[f].label);
            }))
        ]);
    };

    this.matches = (rec) => self.activeOptions == 0 || matchFn(rec, self.orderedOptions.filter(o => self.optionMap[o].active));

    this.numActive = () => {
        return self.activeOptions;
    };

    this.clearActiveFilters = () => {
      self.orderedOptions.forEach(opt => self.optionMap[opt].active = false);
      self.activeOptions = 0;
    };
}

//========================================================================
var ScenarioListScreen = function() {
    var filters2 = [
        new SelectFilter("Book",
                         bookFilterOptions(),
                         (rec, activeOpts) => activeOpts.includes(rec.scenario_resources.source[0].book)),
        new SelectFilter("Size",
                         ["Tiny (<21)=20", "Small (21-40)=40", "Medium (41-60)=60", "Large (61-100)=100", "Huge (>100)=0"],
                         (rec, activeOpts) => {
                             for (var i = 0; i < activeOpts.length; ++i) {
                                 switch (activeOpts[i]) {
                                 case  "20": if (                  rec.size <= 20)  return true;  break;
                                 case  "40": if (21 <= rec.size && rec.size <= 40)  return true;  break;
                                 case  "60": if (41 <= rec.size && rec.size <= 60)  return true;  break;
                                 case "100": if (61 <= rec.size && rec.size <= 100) return true;  break;
                                 case   "0": if (100 < rec.size)                    return true;  break;
                                 }
                             }
                             return false;
                         }),
        new SelectFilter("Resources",
                         ["Podcast=podcast", "Video=video_replay", "Web Page=web_replay"],
                         (rec, activeOpts) => activeOpts.some((elt) => rec.scenario_resources[elt] != null && rec.scenario_resources[elt].length))
    ];

    var numFiltersSet = () => filters2.reduce((sum, filter) => sum + filter.numActive(), 0);

    var unsetAllFilters = () => filters2.forEach(f => f.clearActiveFilters());

    return {
        data: m.prop(false),

        filter(rec) { return filters2.every(filter => filter.matches(rec)); },

        leftNav() {
            return filters2.map(f => m(f)).concat(
                numFiltersSet() > 1 ? m("ul.filter-group", [ m("li", { onclick: _ => unsetAllFilters() }, "Remove all") ])
                                    : null
            );
        },

        controller: function() {
            Request.get("/scenarios",
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

            if (rows.length === 1) {
                rows.push(m("tr", m("td[colspan=8]", "There are no scenarios matching those search criteria!")));
            }

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

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
function sortByCompletion(a, b) {
    return cmp(a.user_scenario.painted / a.size, b.user_scenario.painted / b.size) ||
           cmp(a.user_scenario.owned / a.size, b.user_scenario.owned / b.size) ||
           cmp(b.size, a.size) ||
           sortBySource(a, b);
}

//========================================================================
function sortByDate(a, b) {
    return cmp(a.date_age, b.date_age) ||
           cmp(a.date_year, b.date_year) ||
           cmp(a.date_month, b.date_month) ||
           cmp(a.date_day, b.date_day) ||
           sortBySource(a, b);
}

//========================================================================
function sortByLocation(a, b) {
    return sortByTitle(a.location, b.location) ||
           sortBySource(a, b);
}

//========================================================================
function sortByName(a, b) {
    return sortByTitle(a.name, b.name) ||
           sortBySource(a, b);
}

//========================================================================
function sortByRating(a, b) {
    return cmp(a.rating, b.rating) ||
           cmp(a.name, b.name) ||
           sortBySource(a, b);
}

//========================================================================
function sortBySize(a, b) {
    return cmp(a.size, b.size) ||
           cmp(a.name, b.name) ||
           sortBySource(a, b);
}

//========================================================================
function sortBySource(a, b) {
    var a_src = a.scenario_resources["source"][0];
    var b_src = b.scenario_resources["source"][0];
    return sortByTitle(a_src.title, b_src.title) ||
           cmp(a_src.sort_order, b_src.sort_order);
}

//========================================================================
function sortByTitle(a, b) {
    a = a.replace(/^The /, "").replace(/^A /, "").replace("É", "E");
    b = b.replace(/^The /, "").replace(/^A /, "").replace("É", "E");

    if (a < b) {
        return -1;
    }
    if (b < a) {
        return 1;
    }
    return 0;
}

//========================================================================
function alphabetizedOptionsByValue(hash) {
    var reverseMap = Object.keys(hash).reduce((map, key) => {
        map[hash[key]] = key;
        return map;
    }, {});

    var values = Object.keys(reverseMap).sort((a, b) => {
        a = a.replace(/^The /, "").replace(/^A /, "");
        b = b.replace(/^The /, "").replace(/^A /, "");

        if (a < b) {
            return -1;
        }
        if (b < a) {
            return 1;
        }
        return 0;
    });

    return values.reduce((list, val) => list.concat([val + "=" + reverseMap[val]]), []);
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

            m("ul.active-filters", self.orderedOptions.filter(opt => self.optionMap[opt].active).map(f => {
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

    this.summaryLabel = () => {
        if (self.activeOptions === 0) {
            return null;
        }

        return self.label + ": " +
               self.orderedOptions.filter(opt => self.optionMap[opt].active)
                                  .map(opt => self.optionMap[opt].label)
                                  .join(",");
    };
}

//========================================================================
var ScenarioListScreen = function() {
    var collapsedFilters = true;

    var filters2 = [
        new SelectFilter("Location",
                         alphabetizedOptionsByValue(K.LOCATIONS),
                         (rec, activeOpts) => activeOpts.includes(rec.location)),
        new SelectFilter("Book",
                         alphabetizedOptionsByValue(K.BOOK_NAMES),
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

    var filterDiv = () => {
        if (collapsedFilters) {
            var flabel = filters2.map(f => f.summaryLabel()).filter(f => f != null).join("; ") || "None";
            return m("div.filters", [
                       m(".arrow", { onclick: () => collapsedFilters = false }, "\u25b6"),
                       m("span.label", { onclick: () => collapsedFilters = false }, "Filters: " + flabel)
                     ]);

        } else {
            return m("div.filters", [
                       m(".arrow",  { onclick: () => collapsedFilters = true }, "\u25bc"),
                       m("span.label", { onclick: () => collapsedFilters = true }, "Filter")
                     ].concat(ScenarioListScreen.filterNav()));
        }
    };

    return {
        data: m.prop(false),

        filter(rec) { return filters2.every(filter => filter.matches(rec)); },

        filterNav() {
            return filters2.map(f => m(f)).concat(
                numFiltersSet() > 1 ? m("div.filter-group", [
                                          m("ul.active-filters", [ m("li", { onclick: _ => unsetAllFilters() }, "Remove all filters") ])
                                        ])
                                    : null
            );
        },

        controller: function() {
            Request.get("/scenarios",
                        resp => {
                            ScenarioListScreen.data({ data: resp.data.sort(sortByDate) });
                            m.redraw();
                        });
        },

        view: function(ctrl) {
            return [
                m(Header),
                m(require("nav"), "Scenario List"),
                filterDiv(),
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
                    m("th.location[data-sort-by=location]", m.trust("Location<span class='sort-arrow'>&nbsp;</span>")),
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
                        m("td.location", K.LOCATIONS[scenario.location]),
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

            return m("table.scenario-list.striped", ScenarioListScreen.tableSorter(rawData), rows);
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
                r.push(m("span", K.ICON_STRINGS.web_replay));
            }
            if (resources.video_replay != null && resources.video_replay.length > 0) {
                r.push(m("span", K.ICON_STRINGS.video_replay));
            }
            if (resources.podcast != null && resources.podcast.length > 0) {
                r.push(m("span", K.ICON_STRINGS.podcast));
            }
            return r;
        },

        tableSorter: function(list) {
            return {
                onclick: function(ev) {
                    var prop = ev.target.getAttribute("data-sort-by");
                    if (prop) {
                        var sorters = {
                            completion: sortByCompletion,
                            date:       sortByDate,
                            location:   sortByLocation,
                            name:       sortByName,
                            rating:     sortByRating,
                            size:       sortBySize,
                            source:     sortBySource
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

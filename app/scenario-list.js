/* global module require */

const m               = require("mithril");
const prop            = require("mithril/stream");

const Credentials     = require("credentials");
const Header          = require("header");
const Pie             = require("pie");
const K               = require("constants");
const Nav             = require("nav");
const Request         = require("request");
const ScenarioUpdater = require("scenario-updater");
const StarRating      = require("star-rating");

const data = prop(false);

const ICON_DOWN       = "\u25bc";  // ▼
const ICON_RIGHT      = "\u25b6";  // ▶
const ICON_ASCENDING  = "\u25b2"; // ▲
const NBSP            = "\u00a0";

let collapsedFilters = true;

//========================================================================
const ageAbbrev = ageNumber =>
  (1 <= ageNumber && ageNumber <= 3)
    ? ["?", "FA", "SA", "TA"][ageNumber]
    : "??";

//========================================================================
const alphabetizedOptionsByValue = hash => {
  var reverseMap = Object.keys(hash).reduce((map, key) => {
    map[hash[key]] = key;
    return map;
  }, {});

  var values = Object.keys(reverseMap).sort((a, b) => {
    a = a.replace(/^The /, "").replace(/^A /, "");
    b = b.replace(/^The /, "").replace(/^A /, "");

    return cmp(a, b);
  });

  return values.reduce((list, val) => list.concat([val + "=" + reverseMap[val]]), []);
};

//========================================================================
const cmp = (a, b) => {
  return a > b ? 1 : a < b ? -1 : 0;
};

//========================================================================
const domFilterDiv = () => {
  const domEdit = Credentials.admin() ? m("a.icon", { href: "/scenario-edit", oncreate: m.route.link }, K.ICON_STRINGS.plus) : null;

  if (collapsedFilters) {
    const flabel = scenarioFilters.map(f => f.summaryLabel()).filter(f => f != null).join("; ") || "None";
    return m("div.filters",
             m(".arrow", { onclick: () => collapsedFilters = false }, ICON_RIGHT),
             m("span.label", { onclick: () => collapsedFilters = false }, "Filters: " + flabel),
             domEdit);

  } else {
    return m("div.filters",
             m(".arrow",  { onclick: () => collapsedFilters = true }, ICON_DOWN),
             m("span.label", { onclick: () => collapsedFilters = true }, "Filter"),
             scenarioFilters.map(f => m(f)),
             numFiltersSet() > 1 ? m("div.filter-group",
                                     m("ul.active-filters", m("li", { onclick: _ => unsetAllFilters() }, "Remove all filters")))
                                 : null);
    }
};

//========================================================================
const domResourceIcons = resources => {
  var r = [];

  if (resources.magazine_replay != null && resources.magazine_replay.length > 0) {
    r.push(m("span", K.ICON_STRINGS.magazine_replay));
  }

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
};

//========================================================================
const domTable = rawData => {
  const desktopRows = [
    m("tr",
      m("th.completion[data-sort-by=completion].section-header", "%",        m("span.sort-arrow", NBSP)),
      m("th.name[data-sort-by=name].section-header",             "Scenario", m("span.sort-arrow", NBSP)),
      m("th.location[data-sort-by=location].section-header",     "Location", m("span.sort-arrow", NBSP)),
      m("th.date[data-sort-by=date][colspan=2].section-header",  "Date",     m("span.sort-arrow", ICON_ASCENDING)),
      m("th.source[data-sort-by=source].section-header",         "Source",   m("span.sort-arrow", NBSP)),
      m("th.size[data-sort-by=size].section-header",             "Models",   m("span.sort-arrow", NBSP)),
      m("th.map[data-sort-by=map].section-header",               "Map Size", m("span.sort-arrow", NBSP)),
      m("th.rating[data-sort-by=rating].section-header",         "Rating",   m("span.sort-arrow", NBSP)),
      m("th.factions[colspan=2].section-header",                 "Factions"),
      m("th.resources.section-header",                           "Resources"))
  ];

  const mobileRows = [
    m("tr.mobile",
      m("th.completion[data-sort-by=completion].section-header", "Ready?",   m("span.sort-arrow", NBSP)),
      m("th.name[data-sort-by=name].section-header",             "Scenario", m("span.sort-arrow", NBSP)),
      m("th.rating[data-sort-by=rating].section-header",         "Rating",   m("span.sort-arrow", NBSP)))
  ];

  rawData.forEach(scenario => {
    const starParams = {
      id: scenario.id,
      active: Credentials.isLoggedIn(),
      votes: scenario.num_votes,
      rating: scenario.rating,
      userRating: scenario.user_scenario.rating,
      callback: ScenarioUpdater.update
    };

    const f1 = K.FACTION_INFO[scenario.scenario_factions[0].faction];
    const f2 = K.FACTION_INFO[scenario.scenario_factions[1].faction];
    if (filter(scenario)) {
      desktopRows.push(
        m("tr",
          m("td.completion", m(Pie, { size: 24, n: scenario.size, nPainted: scenario.user_scenario.painted, nOwned: scenario.user_scenario.owned })),
          m("td.name", [ m("a", { class: "scenario-detail-link", oncreate: m.route.link, href: "/scenarios/" + scenario.id}, scenario.name) ]),
          m("td.location", K.LOCATIONS[scenario.location]),
          m("td.date-age", ageAbbrev(scenario.date_age)),
          m("td.date-year", scenario.date_year),
          m("td.source", (scenarioSource(scenario) ? scenarioSource(scenario).title : "")),
          m("td.size", scenario.size),
          m("td.map", scenario.map_width + "\" x " + scenario.map_height + "\""),
          m("td.rating", m(StarRating, starParams)),
          m("td.faction faction1", {title: f1 && f1.name}, f1.letter),
          m("td.faction faction2", {title: f2 && f2.name}, f2.letter),
          m("td.resources", domResourceIcons(scenario.scenario_resources))));

      mobileRows.push(
        m("tr",
          m("td.completion", m(Pie, { size: 24, n: scenario.size, nPainted: scenario.user_scenario.painted, nOwned: scenario.user_scenario.owned })),
          m("td.name",
            m("a", { class: "scenario-detail-link", oncreate: m.route.link, href: "/scenarios/" + scenario.id}, scenario.name),
            m("br"),
            m("span.date-age", ageAbbrev(scenario.date_age)),
            m("span.date-year", scenario.date_year),
            m("span.location", K.LOCATIONS[scenario.location])),
          m("td.rating", m(StarRating, starParams))));
    }
  });

  if (desktopRows.length === 1) {
    desktopRows.push(m("tr", m("td[colspan=8]", "There are no scenarios matching those search criteria!")));
    mobileRows.push(m("tr", m("td[colspan=8]", "There are no such scenarios!")));
  }

  return [
    m("table.scenario-list.striped.desktop", tableSorter(rawData), desktopRows),
    m("table.scenario-list.striped.mobile", tableSorter(rawData), mobileRows)
  ];
};

//========================================================================
const filter = rec => scenarioFilters.every(filter => filter.matches(rec));

//========================================================================
const numFiltersSet = () => scenarioFilters.reduce((sum, filter) => sum + filter.numActive(), 0);

//========================================================================
const unsetAllFilters = () => scenarioFilters.forEach(f => f.clearActiveFilters());

//========================================================================
const scenarioFilters = [
  new SelectFilter("Location",
                   alphabetizedOptionsByValue(K.LOCATIONS),
                   (rec, activeOpts) => activeOpts.includes(rec.location)),

  new SelectFilter("Book",
                   alphabetizedOptionsByValue(K.BOOK_NAMES),
                   (rec, activeOpts) => activeOpts.includes(scenarioSource(rec) ? scenarioSource(rec).book : null)),

  new SelectFilter("Models",
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

  new SelectFilter("Map Size",
                   ["Tiny (<24\")=24", "Small (36\")=36", "Medium (48\")=48", "Large (>48\")=0"],
                   (rec, activeOpts) => {
                     for (var i = 0; i < activeOpts.length; ++i) {
                       switch (activeOpts[i]) {
                       case "24": if (rec.map_width <= 24) return true; break;
                       case "36": if (rec.map_width == 36) return true; break;
                       case "48": if (rec.map_width == 48) return true; break;
                       case  "0": if (rec.map_width >  48) return true; break;
                       }
                     }
                     return false;
                   }),

  new SelectFilter("Resources",
                   ["Magazine=magazine_replay", "Podcast=podcast", "Video=video_replay", "Web Page=web_replay"],
                   (rec, activeOpts) => activeOpts.some((elt) => rec.scenario_resources[elt] != null && rec.scenario_resources[elt].length))
];

//========================================================================
const scenarioSource = scenario => {
  return scenario.scenario_resources &&
         scenario.scenario_resources.source &&
         scenario.scenario_resources.source.length > 0
           ? scenario.scenario_resources.source[0]
           : null;
}

//========================================================================
const sortByCompletion = (a, b) => {
  return cmp(a.user_scenario.painted / a.size, b.user_scenario.painted / b.size) ||
         cmp(a.user_scenario.owned / a.size, b.user_scenario.owned / b.size) ||
         cmp(b.size, a.size) ||
         sortBySource(a, b);
};

//========================================================================
const sortByDate = (a, b) => {
  return cmp(a.date_age, b.date_age) ||
         cmp(a.date_year, b.date_year) ||
         cmp(a.date_month, b.date_month) ||
         cmp(a.date_day, b.date_day) ||
         sortBySource(a, b);
}

//========================================================================
const sortByLocation = (a, b) => {
  return sortByTitle(a.location, b.location) ||
         sortBySource(a, b);
};

//========================================================================
const sortByMap = (a, b) => {
  return cmp(a.map_width, b.map_width) ||
         cmp(a.map_height, b.map_height) ||
         sortBySource(a, b);
};

//========================================================================
const sortByName = (a, b) => {
  return sortByTitle(a.name, b.name) ||
         sortBySource(a, b);
};

//========================================================================
const sortByRating = (a, b) => {
  return cmp(a.rating, b.rating) ||
         cmp(a.name, b.name) ||
         sortBySource(a, b);
};

//========================================================================
const sortBySize = (a, b) => {
  return cmp(a.size, b.size) ||
         cmp(a.name, b.name) ||
         sortBySource(a, b);
};

//========================================================================
const sortBySource = (a, b) => {
  var aSrc = scenarioSource(a);
  var bSrc = scenarioSource(b);

  if (!aSrc && !bSrc) {
    return 0;
  }

  if (!aSrc) {
    return -1;
  }

  if (!bSrc) {
    return 1;
  }

  return sortByTitle(aSrc.title, bSrc.title) ||
         cmp(aSrc.issue, bSrc.issue) ||
         cmp(aSrc.sort_order, bSrc.sort_order);
};

//========================================================================
const sortByTitle = (a, b) => {
  a = a.replace(/^The /, "").replace(/^A /, "").replace("É", "E");
  b = b.replace(/^The /, "").replace(/^A /, "").replace("É", "E");

  return cmp(a, b);
};

//========================================================================
const tableSorter = list => {
  return {
    onclick: function(ev) {
      var prop = ev.target.getAttribute("data-sort-by");
      if (prop) {
        var sorters = {
          completion: sortByCompletion,
          date:       sortByDate,
          location:   sortByLocation,
          map:        sortByMap,
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
};

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
        m("option[value=]", "... by " + self.label),
        self.orderedOptions.map(optVal => {
          return self.optionMap[optVal].active ? null : m("option", { value: optVal }, self.optionMap[optVal].label);
        })),

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
const ScenarioListScreen = {
  oninit: (/*vnode*/) =>
    Request.get("/scenarios",
                resp => {
                  data({ data: resp.data.sort(sortByDate) });
                  m.redraw();
                }),

    view: () => [
      m(Header),
      m(Nav, { selected: "Scenario List" }),
      domFilterDiv(),
      m("div.main-content",
        data() ? domTable(data().data) : "Loading...")
    ]
};

//========================================================================
ScenarioUpdater.addObserver((id, newAvgRating, userRating, newNumVotes) => {
  if (!data()) {
    return;
  }

  const scenarioList = data().data;

  var idx = scenarioList.findIndex(elt => elt.id === id);
  if (idx >= 0) {
    scenarioList[idx].rating = newAvgRating;
    scenarioList[idx].user_scenario.rating = userRating;
    scenarioList[idx].num_votes = newNumVotes;
  }
});

module.exports = ScenarioListScreen;

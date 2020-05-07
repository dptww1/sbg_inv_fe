/* global module require */

const m = require("mithril");

const Credentials = require("credentials");
const K           = require("constants");
const U           = require("utils");

const ICON_DOWN       = "\u25bc";  // ▼
const ICON_RIGHT      = "\u25b6";  // ▶

var collapsed = true;

//========================================================================
// Creates a filter used to narrow down a list of items.

// name - String, used as name of <select> and default "... by [name]"
// optionList - array of "name=value" strings which populate the <options>
// matchFn - (rec, activeOps) => boolean
//     function deciding whether this filter will allow an item or not
//         rec - current item to consider
//         activeOps - list of "value" strings in `optionList` which are currently active
//------------------------------------------------------------------------
function SelectFilter(name, optionList, matchFn) {
  var self = this;

  this.label          = name;
  this.internalName   = name.sub(/[^A-Za-z0-9]/g, "-");
  this.optionMap      = {};   // key: orderedOptions[n]  value: { label: string, active: boolean}
  this.orderedOptions = [];
  this.activeOptions  = 0;
  this.active         = true;

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

  this.numActive = () => self.activeOptions;

  this.clearActiveFilters = () => {
    self.orderedOptions.forEach(opt => self.optionMap[opt].active = false);
    self.activeOptions = 0;
  };

  this.summaryLabel = () => !self.active || self.activeOptions === 0
                            ? null
                            : self.label + ": " +
                              self.orderedOptions.filter(opt => self.optionMap[opt].active)
                                                 .map(opt => self.optionMap[opt].label)
                                                 .join(", ");
};

//========================================================================
const filters = [
  new SelectFilter("Location",
                   U.alphabetizedOptionsByValue(K.LOCATIONS),
                   (rec, activeOpts) => activeOpts.includes(rec.location)),

  new SelectFilter("Book",
                   U.alphabetizedOptionsByValue(K.BOOK_NAMES),
                   (rec, activeOpts) => activeOpts.includes(U.scenarioSource(rec) ? U.scenarioSource(rec).book : null)),

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
                   (rec, activeOpts) => activeOpts.some((elt) => rec.scenario_resources[elt] != null && rec.scenario_resources[elt].length)),

  new SelectFilter("Ownership",
                   ["Completely Painted=painted", "Completely Owned=owned"],
                   (rec, activeOpts) => rec.user_scenario != null &&
                       ((activeOpts.includes("painted") && rec.user_scenario.painted === rec.size) ||
                        (activeOpts.includes("owned") && rec.user_scenario.owned == rec.size)))
];

//========================================================================
const numFiltersSet = _ => filters.filter(f => f.active).reduce((sum, filter) => sum + filter.numActive(), 0);

//========================================================================
const toggleFilters = _ => collapsed = !collapsed;

//========================================================================
const unsetAllFilters = _ => filters.forEach(f => f.clearActiveFilters());

//========================================================================
const Filters = {
  filter: rec => filters.every(filter => !filter.active || filter.matches(rec)),

  oninit: ({ attrs: { activeFilters } }) => filters.forEach(f => f.active = !activeFilters || activeFilters.includes(f.label)),

  view: (vnode) => {
    const domEdit = Credentials.isAdmin() ? m(m.route.Link, { class: "icon", href: "/scenario-edit" }, K.ICON_STRINGS.plus) : null;

    return m("div.filters",
             collapsed
               ? [
                   m(".arrow", { onclick: toggleFilters }, ICON_RIGHT),
                   m("span.label", { onclick: toggleFilters }, "Filters: " + (filters.map(f => f.summaryLabel())
                                                                                    .filter(lbl => lbl != null)
                                                                                    .join("; ") || "None")),
                   domEdit
                 ]
               : [
                   m(".arrow", { onclick: toggleFilters }, ICON_DOWN),
                   m("span.label", { onclick: toggleFilters }, "Filter"),
                   filters.filter(f => f.active)
                          .map(f => m(f)),
                   numFiltersSet() > 1
                     ? m("div.filter-group",
                         m("ul.active-filters",
                           m("li", { onclick: unsetAllFilters }, "Remove All Filters")))
                     : null
                   ]
            );
  }
};

module.exports = Filters;

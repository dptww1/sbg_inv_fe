/* global localStorage */

import m from "mithril";

import { Credentials } from "../credentials.js";
import * as K from "../constants.js";
import * as U from "../utils.js";

//========================================================================
const saveFilterSettings = (filterName, orderedOptions, optionMap) => {
  const saveKey = "scenario-filter--" + filterName;

  if (!orderedOptions || !optionMap) {
    localStorage.removeItem(saveKey);
    return;
  }

  const saveVal = orderedOptions
        .filter(v => optionMap[v].active)
        .join("|");

  if (!saveVal) {
    localStorage.removeItem(saveKey);
    return;
  }

  localStorage.setItem(saveKey, saveVal);
};

//========================================================================
// Creates a filter used to narrow down a list of items.

// name - String, used as name of <select> and default "... by [name]"
// requireLogin - `true` if the filter should only appear for logged-in users
// optionList - array of "name=value" strings which populate the <options>
// matchFn - (rec, activeOps) => boolean
//     function deciding whether this filter will allow an item or not
//         rec - current item to consider
//         activeOps - list of "value" strings in `optionList` which are currently active
//------------------------------------------------------------------------
function SelectFilter(name, requireLogin, optionList, matchFn) {
  const self = this;

  this.label          = name;
  this.requireLogin   = requireLogin;
  this.internalName   = name.replaceAll(/[^A-Za-z0-9]/g, "-");
  this.optionMap      = {};   // key: orderedOptions[n]  value: { label: string, active: boolean}
  this.orderedOptions = [];
  this.activeOptions  = 0;
  this.active         = true;

  optionList.forEach(opt => {
    let [optLabel, optVal] = opt.split(/\s*=\s*/);
    optVal = optVal || optLabel;
    this.orderedOptions.push(optVal);
    this.optionMap[optVal] = {
      label: optLabel,
      active: false
    };
  });

  this.initFromStorage = () => {
    self.activeOptions = 0;
    Object.keys(self.optionMap).forEach(k => self.optionMap[k].active = false);
    (localStorage.getItem("scenario-filter--" + self.internalName) || "")
      .split("|")
      .filter(x => !x.match(/^\s*$/))
      .forEach(abbrev => {
        self.optionMap[abbrev].active = true;
        self.activeOptions += 1;
      });
  };

  this.view = () => {
    return m("div.filter-group", [
      m("select",
        {
          name: self.internalName,
          onchange: ev => {
            self.optionMap[ev.target.value].active = true;
            ++self.activeOptions;
            saveFilterSettings(self.internalName, self.orderedOptions, self.optionMap);
          }
        },
        m("option[value=]", "... by " + self.label),
        self.orderedOptions.map(optVal => {
          return self.optionMap[optVal].active
            ? null
            : m("option", { value: optVal }, self.optionMap[optVal].label);
        })),

      m("ul.active-filters",
        self.orderedOptions
            .filter(opt => self.optionMap[opt].active)
            .map(f => {
                  return m("li",
                           {
                             onclick: () => {
                               self.optionMap[f].active = false;
                               --self.activeOptions;
                               saveFilterSettings(self.internalName, self.orderedOptions, self.optionMap);
                             }
                           },
                           self.optionMap[f].label);
      }))
    ]);
  };

  this.matches = (rec) => self.activeOptions == 0 || matchFn(rec, self.orderedOptions.filter(o => self.optionMap[o].active));

  this.numActive = () => self.activeOptions;

  this.clearActiveFilters = () => {
    self.orderedOptions.forEach(opt => self.optionMap[opt].active = false);
    self.activeOptions = 0;
    saveFilterSettings(self.internalName, null, null);
  };

  this.summaryLabel = () => !self.active || self.activeOptions === 0
                            ? null
                            : self.label + ": " +
                              self.orderedOptions.filter(opt => self.optionMap[opt].active)
                                                 .map(opt => self.optionMap[opt].label)
                                                 .join(", ");

  this.requiresLogin = () => requireLogin;
};

//========================================================================
const filters = [
  new SelectFilter("Location",
                   false,
                   U.alphabetizedOptionsByValue(K.LOCATIONS),
                   (rec, activeOpts) => activeOpts.includes(rec.location)),

  new SelectFilter("Book",
                   false,
                   U.alphabetizedOptionsByValue(K.BOOK_NAMES),
                   (rec, activeOpts) => activeOpts.includes(U.scenarioSource(rec) ? U.scenarioSource(rec).book : null)),

  new SelectFilter("Models",
                   false,
                   ["Tiny (<21)=20", "Small (21-40)=40", "Medium (41-60)=60", "Large (61-100)=100", "Huge (>100)=0"],
                   (rec, activeOpts) => {
                     for (let i = 0; i < activeOpts.length; ++i) {
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
                   false,
                   ["Tiny (<24\")=24", "Small (36\")=36", "Medium (48\")=48", "Large (>48\")=0"],
                   (rec, activeOpts) => {
                     for (let i = 0; i < activeOpts.length; ++i) {
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
                   false,
                   ["Magazine=magazine_replay", "Podcast=podcast", "Video=video_replay", "Web Page=web_replay"],
                   (rec, activeOpts) => activeOpts.some((elt) => rec.scenario_resources[elt] != null && rec.scenario_resources[elt].length)),

  new SelectFilter("Ownership",
                   true,
                   [
                     "Completely Painted=painted",
                     "Completely Owned=owned",
                     "Has Unpainted=unpainted",
                     "Has Unowned=unowned"
                   ],
                   (rec, activeOpts) => rec.user_scenario != null &&
                       ((activeOpts.includes("painted") && rec.user_scenario.painted === rec.size) ||
                        (activeOpts.includes("owned") && rec.user_scenario.owned == rec.size) ||
                        (activeOpts.includes("unpainted") && rec.user_scenario.painted !== rec.user_scenario.owned) ||
                        (activeOpts.includes("unowned") && rec.user_scenario.owned !== rec.size)))
];

//========================================================================
const numFiltersSet = ()=> filters.filter(f => f.active).reduce((sum, filter) => sum + filter.numActive(), 0);

//========================================================================
const unsetAllFilters = () => filters.forEach(f => f.clearActiveFilters());

//========================================================================
export const Filters = {
  filter: rec => filters.every(filter => !filter.active || filter.matches(rec)),

  oninit: ({ attrs: { activeFilters } }) => filters.forEach(f => {
    f.initFromStorage();
    return f.active = !activeFilters || activeFilters.includes(f.label);
  }),

  view: () => {
    const domEdit = Credentials.isAdmin()
          ? m("button",
              { onclick: () => m.route.set("/scenario-edit") },
              "Add Scenario")
          : null;

    return m("div.filters",
             m("details",
               m("summary",
                 m("span.label",
                   "Filters: " +
                     (filters
                       .filter(f => Credentials.isLoggedIn() || !f.requiresLogin())
                       .map(f => f.summaryLabel())
                       .filter(lbl => lbl != null)
                       .join("; ")
                       || "None")),
                 domEdit),
               filters
                 .filter(f => Credentials.isLoggedIn() || !f.requiresLogin())
                 .filter(f => f.active)
                 .map(f => m(f)),
               numFiltersSet() > 1
                 ? m("div.filter-group",
                     m("ul.active-filters",
                       m("li", { onclick: unsetAllFilters }, "Remove All Filters")))
                 : null));
  }
};

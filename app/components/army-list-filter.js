import m from "mithril";

import * as K from "../constants.js";

let selectedArmyListFilter = null;

//========================================================================
// m(ArmyListFilter)
// ArmyListFilter.shouldShowArmyListName(factionAbbrev) => boolean
// ArmyListFilter.isFilterActive() => boolean
//------------------------------------------------------------------------
export const ArmyListFilter = () => {

  let optionsList = [];

  if (optionsList.length === 0) {
    const set = new Set();
    Object.keys(K.FACTION_INFO).forEach(abbr => {
      if (K.FACTION_INFO[abbr].factions) {
        K.FACTION_INFO[abbr].factions.forEach(f => set.add(f));
      }
    });

    optionsList = Array.from(set).sort();
  }

  return {
    view: () => [
      "Filter: ",
      m("select[name=armyListFilter]",
        {
          onchange: ev => selectedArmyListFilter = ev.target.value
        },
        [
          m("option[value=]", "-- Show All --"),
          m("option[value=allGood]",
            {
              selected: "allGood" === selectedArmyListFilter
            },
            "-- All Good --"),
          m("option[value=allEvil]",
            {
              selected: "allEvil" === selectedArmyListFilter
            },
            "-- All Evil --"),
        ].concat(optionsList.map(name =>
          m("option",
            {
              value: name,
              selected: name === selectedArmyListFilter
            },
            name)))),
      m("br")
    ]
  };
};

//========================================================================
ArmyListFilter.isFilterActive = () => Boolean(selectedArmyListFilter);

//========================================================================
ArmyListFilter.shouldShowArmyListName = factionAbbrev => {
  const info = factionAbbrev ? K.FACTION_INFO[factionAbbrev] : null;

  // Structural issue or ignored faction?
  if (!info || info.obsolete) {
    return false;
  }

  // All army list names match if no filtering is set
  if (!selectedArmyListFilter) {
    return true;
  }

  // Handle the All types
  if ((selectedArmyListFilter === "allGood" && info.side === "Good")
      || (selectedArmyListFilter == "allEvil" && info.side === "Evil")) {
    return true;
  }

  // Structural data issue?
  if (!info.factions) {
    return false;
  }

  return info.factions.findIndex(f => f === selectedArmyListFilter) >= 0;
};

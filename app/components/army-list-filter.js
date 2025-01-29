/*global FACTION_INFO */

import m from "mithril";

let selectedArmyListFilter = null;

//========================================================================
const keywordToLabel = kwd =>
      kwd.substring(0, 1).toUpperCase()
      + kwd.substring(1)
           .replaceAll(/([A-Z])/g, " $1")
           .replaceAll(/(And|Of|The)/g, s => s.toLowerCase());

//========================================================================
// m(ArmyListFilter)
// ArmyListFilter.shouldShowArmyListName(factionAbbrev) => boolean
// ArmyListFilter.isFilterActive() => boolean
//------------------------------------------------------------------------
export const ArmyListFilter = () => {

  let optionsList = [];

  if (optionsList.length === 0) {
    const set = new Set();
    FACTION_INFO.sortedFactionNames().forEach(name => {
      const kws = FACTION_INFO.byName(name).keywords;
      if (kws) {
        kws.split(/\s/).forEach(f => set.add(f));
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
        ].concat(optionsList.map(value =>
          m("option",
            {
              value: value,
              selected: value === selectedArmyListFilter
            },
            keywordToLabel(value))))),
      m("br")
    ]
  };
};

//========================================================================
ArmyListFilter.isFilterActive = () => Boolean(selectedArmyListFilter);

//========================================================================
ArmyListFilter.shouldShowArmyListName = factionAbbrev => {
  const info = factionAbbrev ? FACTION_INFO.byAbbrev(factionAbbrev) : null;

  // Structural issue or ignored faction?
  if (!info || info.obsolete) {
    return false;
  }

  // All army list names match if no filtering is set
  if (!selectedArmyListFilter) {
    return true;
  }

  // Handle the All types
  if ((selectedArmyListFilter === "allGood" && info.alignment === 0)
      || (selectedArmyListFilter == "allEvil" && info.alignment === 1)) {
    return true;
  }

  // Structural data issue?
  if (!info.keywords) {
    return false;
  }

  return info.keywords.indexOf(selectedArmyListFilter) >= 0;
};

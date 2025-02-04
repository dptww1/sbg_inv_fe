/*global FACTION_INFO, localStorage */

import m from "mithril";

const STORAGE_KEY_FACTION_TYPE_PREF = "faction-type-preference";
const STORAGE_KEY_ARMY_LIST_FILTER_PREF = "army-list-filter-preference";

let selectedArmyListFilter = null;
let selectedTypeFilter = "armyLists";

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

  selectedTypeFilter = localStorage.getItem(STORAGE_KEY_FACTION_TYPE_PREF) || "armyLists";
  selectedArmyListFilter = localStorage.getItem(STORAGE_KEY_ARMY_LIST_FILTER_PREF);

  let optionsList = [];

  if (optionsList.length === 0) {
    const set = new Set();
    FACTION_INFO.all()
      .filter(f => !f.legacy)
      .forEach(f => {
        if (f.keywords) {
          f.keywords.split(/\s/).forEach(kwd => set.add(kwd));
        }
      });

    optionsList = Array.from(set).sort();
  }

  //========================================================================
  const armyListFilterChanged = ev => {
    selectedArmyListFilter = ev.target.value;
    localStorage.setItem(STORAGE_KEY_ARMY_LIST_FILTER_PREF, selectedArmyListFilter);
  };

  //========================================================================
  const typeFilterChanged = ev => {
    selectedTypeFilter = ev.target.value;
    selectedArmyListFilter = null;
    localStorage.setItem(STORAGE_KEY_FACTION_TYPE_PREF, selectedTypeFilter);
  };

  //========================================================================
  return {
    view: () => [
      "Filters: ",
      m("select[name=typeFilter]",
        {
          onchange: typeFilterChanged
        },
        m("option[value=armyLists]",   { selected: selectedTypeFilter === "armyLists"   }, "Army Lists"),
        m("option[value=allegiances]", { selected: selectedTypeFilter === "allegiances" }, "Allegiances")),
      " ",
      selectedTypeFilter === "armyLists"
        ? m("select[name=armyListFilter]",
            {
              onchange: armyListFilterChanged
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
                keywordToLabel(value)))))
        : null,
      m("br")
    ]
  };
};

//========================================================================
ArmyListFilter.isFilterActive = () => Boolean(selectedArmyListFilter);

//========================================================================
ArmyListFilter.usingAllegianceMode = () => selectedTypeFilter === "allegiances";

//========================================================================
ArmyListFilter.shouldShowArmyListName = factionAbbrev => {
  const info = factionAbbrev ? FACTION_INFO.byAbbrev(factionAbbrev) : null;

  if (!info) {
    return false;
  }

  if (selectedTypeFilter === "allegiances") {
    return info.legacy;
  }

  if (info.legacy) {
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

/* global localStorage, Intl */

import * as K from "./constants.js";

const sortOrderMap = {};

//========================================================================
export const alphabetizedOptionsByValue = hash => {
  var reverseMap = Object.keys(hash).reduce((map, key) => {
    map[hash[key]] = key;
    return map;
  }, {});

  var values = Object.keys(reverseMap).sort(strCmp);

  return values.reduce((list, val) => list.concat([val + "=" + reverseMap[val]]), []);
};

//========================================================================
export const asNormalized = s => {
  let s2 = sortOrderMap[s] ||
           s.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^The /, "")
            .replace(/^A /, "");
  sortOrderMap[s] = s2;
  return s2;
};

//========================================================================
export const cmp = (a, b) => a > b ? 1 : a < b ? -1 : 0;

//========================================================================
export const currentDate = () => {
  let d = new Date();

  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
      .toISOString()
      .substring(0, 10);
};

//========================================================================
export const daysInRange = (d1, d2) => {
  if (d1.match(/\d\d\d\d-\d\d-\d\d/) &&
      d2.match(/\d\d\d\d-\d\d-\d\d/)) {

    const utc1 = Date.UTC(d1.substring(0, 4), d1.substring(5, 7), d1.substring(8));
    const utc2 = Date.UTC(d2.substring(0, 4), d2.substring(5, 7), d2.substring(8));

    return Math.floor(Math.abs(utc1 - utc2) / (1000 * 60 * 60 * 24)) + 1;
  }

  return 0;
};

//========================================================================
const NUMERIC_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

//========================================================================
export const formatNumber = n => NUMERIC_FMT.format(n);

//========================================================================
export const getLocalStorageBoolean = keyName => {
  const strVal = localStorage.getItem(keyName);
  return strVal === "true";
};

//========================================================================
export const pluralName = figure => figure.plural_name || figure.name;

//========================================================================
export const resourceIcon = res => {
  switch (res.resource_type) {
  case "podcast":      return K.ICON_STRINGS.podcast;
  case "video_replay": return K.ICON_STRINGS.video_replay;
  case "web_replay":   return K.ICON_STRINGS.web_replay;
  default:             return "";
  }
};

//========================================================================
export const resourceLabel = res =>
  res && res.book
    ? K.BOOK_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
// Used by both scenarios and figures, which have different source formats.
// Really should fix the API...
//------------------------------------------------------------------------
export const scenarioSource = rec =>
  rec.scenario_resources && rec.scenario_resources.source && rec.scenario_resources.source.length > 0
    ? rec.scenario_resources.source[0]  // scenario
    : rec.source;                       // figure

//========================================================================
export const shortResourceLabel = res =>
  res && res.book
    ? K.BOOK_SHORT_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
export const silhouetteUrl = slug => "/images/factions" + slug + ".png";

//========================================================================
export const strCmp = (a, b) => {
  let a2 = asNormalized(a);
  let b2 = asNormalized(b);

  return a2 > b2 ? 1 : a2 < b2 ? -1 : 0;
};

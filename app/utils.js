/* global localStorage, Intl, BOOK_INFO */

import m    from "mithril";
import prop from "mithril/stream";

import * as K from "./constants.js";

const sortOrderMap = {};

//========================================================================
export const alphabetizedOptionsByValue = hash => {
  let reverseMap = Object.keys(hash).reduce((map, key) => {
    map[hash[key]] = key;
    return map;
  }, {});

  let values = Object.keys(reverseMap).sort(strCmp);

  return values.reduce((list, val) => list.concat([val + "=" + reverseMap[val]]), []);
};

//========================================================================
export const asLabel = s =>
  s.replaceAll(/_/g, " ")
   .replace(/\b\w/g, c => c.toUpperCase());

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
// Restore all fields in an object to default values.  The empty string is
// used as a default but can be overridden on a per-field basis by
// supplying key/value pairs in the optional `overrides` parameter.
//
// Tries to be smart about property fields (which are Mithril streams).
//------------------------------------------------------------------------
export const emptyOutObject = (obj, overrides = {}) =>
  Object.entries(obj).reduce(
    (acc, [key, val]) => {
      if (typeof val === "function") { // assumed to be a Mithril stream
        const propVal = val.apply(null, [])
        val.apply(null, [ emptyOutObjectDefaultValueForType(key, propVal, overrides) ])

      } else {
        acc[key] = emptyOutObjectDefaultValueForType(key, val, overrides);
      }

      return acc;
    },
    obj);

//========================================================================
const emptyOutObjectDefaultValueForType = (key, val, overrides) => {
  // Can't just use `overrides[key]` here because we might
  // want to override with null/undefined/etc
  if (key in overrides) {
    return overrides[key];

  } else if (val === null) {
    return null;

  } else if (Array.isArray(val)) {
    return [];

  } else if (typeof val === "object") {
    return {};

  } else {
    return "";
  }
}


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
export const isBlank = o =>
  o === null
    || o === undefined
    || (Array.isArray(o) && o.length === 0)
    || (typeof o === "string" && o.length === 0);

//========================================================================
export const isNotBlank = o => !isBlank(o);

//========================================================================
export const propertize = obj => {
  if (obj) {
    const keys = Object.keys(obj);
    keys.forEach(key => {
      if (typeof key !== "function") {
        obj[key] = prop(obj[key]);
      }
    });
  }

  return obj;
}

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
    ? BOOK_INFO.byKey(res.book).name + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
export const resourceReference = res => {
  if (res) {
    if (res.book) {
      return resourceLabel(res) + ", p." + res.page;
    }

    if (res.url) {
      return m("a", { href: res.url }, res.title || res.url);
    }
  }

  return null;
};

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
    ? BOOK_INFO.byKey(res.book).shortName + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
export const silhouetteUrl = slug => "/images/factions" + slug + ".png";

//========================================================================
export const strCmp = (a, b) => {
  let a2 = asNormalized(a);
  let b2 = asNormalized(b);

  return a2 > b2 ? 1 : a2 < b2 ? -1 : 0;
};

//========================================================================
export const unpropertize = o =>
  Object.entries(o).reduce(
    (acc, [key, val]) => {
      if (typeof val === "function") {
        acc[key] = val.call();

      } else if (typeof val === "object" && val !== null) {
        acc[key] = unpropertize(o[key]);

      } else {
        acc[key] = val;
      }
      return acc;
    },
    {});

/* global module, require */

const K = require("constants");

const sortOrderMap = {};

//========================================================================
module.exports.alphabetizedOptionsByValue = hash => {
  var reverseMap = Object.keys(hash).reduce((map, key) => {
    map[hash[key]] = key;
    return map;
  }, {});

  var values = Object.keys(reverseMap).sort(module.exports.strCmp);

  return values.reduce((list, val) => list.concat([val + "=" + reverseMap[val]]), []);
};

//========================================================================
const asNormalized = s => {
  let s2 = sortOrderMap[s] ||
           s.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^The /, "")
            .replace(/^A /, "");
  sortOrderMap[s] = s2;
  return s2;
};

//========================================================================
module.exports.cmp = (a, b) => a > b ? 1 : a < b ? -1 : 0;

//========================================================================
module.exports.currentDate = () => {
  let d = new Date();

  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
      .toISOString()
      .substring(0, 10);
};

//========================================================================
module.exports.resourceIcon = res => {
  switch (res.resource_type) {
  case "podcast":      return K.ICON_STRINGS.podcast;
  case "video_replay": return K.ICON_STRINGS.video_replay;
  case "web_replay":   return K.ICON_STRINGS.web_replay;
  default:             return "";
  }
};

//========================================================================
module.exports.resourceLabel = res =>
  res && res.book
    ? K.BOOK_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
// Used by both scenarios and figures, which have different source formats.
// Really should fix the API...
//------------------------------------------------------------------------
module.exports.scenarioSource = rec =>
  rec.scenario_resources && rec.scenario_resources.source && rec.scenario_resources.source.length > 0
    ? rec.scenario_resources.source[0]  // scenario
    : rec.source;                       // figure

//========================================================================
module.exports.shortResourceLabel = res =>
  res && res.book
    ? K.BOOK_SHORT_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
module.exports.silhouetteUrl = slug => "/images/factions" + slug + ".png";

//========================================================================
module.exports.strCmp = (a, b) => {
  let a2 = asNormalized(a);
  let b2 = asNormalized(b);

  return a2 > b2 ? 1 : a2 < b2 ? -1 : 0;
};

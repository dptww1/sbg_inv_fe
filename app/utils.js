/* global module, require */

const K = require("constants");

const sortOrderMap = {};

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
module.exports.resourceLabel = res =>
  res && res.book
    ? K.BOOK_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
module.exports.shortResourceLabel = res =>
  res && res.book
    ? K.BOOK_SHORT_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
module.exports.strCmp = (a, b) => {
  let a2 = asNormalized(a);
  let b2 = asNormalized(b);

  return a2 > b2 ? 1 : a2 < b2 ? -1 : 0;
};

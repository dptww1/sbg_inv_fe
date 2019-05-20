/* global module, require */

const K = require("constants");

//========================================================================
module.exports.resourceLabel = res =>
  res && res.book
    ? K.BOOK_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
module.exports.shortResourceLabel = res =>
  res && res.book
    ? K.BOOK_SHORT_NAMES[res.book] + (res.issue ? " #" + res.issue : "")
    : ""

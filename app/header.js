/* global module require */

var m = require("mithril");

//======================================================================
var Header = {
  view: function() {
    return m(".page-header", [
      m(".title", "Middle Earth SBG Inventory")
    ]);
  }
};

module.exports = Header;

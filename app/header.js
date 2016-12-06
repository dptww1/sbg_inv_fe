/* global module require */

var m = require("mithril");

//======================================================================
var Header = {
    view: function(ctl) {
        return m(".page-header", [
            m(".title", "Middle Earth SBG Inventory")
        ]);
    }
};

module.exports = Header;

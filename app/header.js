/* global module require */

var m = require("mithril");

//======================================================================
var Header = {
    view: function(ctl) {
        return m(".page-header", [
            m(".title", "ME SBG Inventory")
        ]);
    }
};

module.exports = Header;

/* global require module */

var m      = require("mithril");
var Header = require("sbg").Header;
var Nav    = require("sbg").Nav;

//========================================================================
var InventoryScreen = {
    view: function() {
        return [
            m(Header),
            m(Nav, "Inventory"),
            m("div.main-content", "*** Inventory ***")
        ];
    }
};

module.exports = InventoryScreen;

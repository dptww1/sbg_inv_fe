/* global require module */

var InventoryScreen = {};
module.exports = InventoryScreen;

var m      = require("mithril");
var Header = require("header");
var Nav    = require("sbg").Nav;

//========================================================================
InventoryScreen.view = () => {
    return [
        m(Header),
        m(Nav, "Inventory"),
        m("div.main-content", "*** Inventory ***")
    ];
};

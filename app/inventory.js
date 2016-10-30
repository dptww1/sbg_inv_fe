/* global require module */

var InventoryScreen = {};
module.exports = InventoryScreen;

var m = require("mithril");

//========================================================================
InventoryScreen.view = () => {
    return [
        m(require("header")),
        m(require("nav"), "Inventory"),
        m("div.main-content", "*** Inventory ***")
    ];
};

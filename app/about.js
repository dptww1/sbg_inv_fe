/* global require module */

var m           = require("mithril");

//========================================================================
var AboutScreen = {
    view() {
        return [
            m(require("header")),
            m(require("nav"), { selected: "About" }),
            m(".main-content", [
                "uep"
            ])
        ];
    }
};

module.exports = AboutScreen;

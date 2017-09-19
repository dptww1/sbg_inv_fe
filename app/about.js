/* global require module */

var m           = require("mithril");

//========================================================================
var AboutScreen = {
    view() {
        return [
            m(require("header")),
            m(require("nav"), { selected: "About" }),
            m(".main-content",
              m("p",
                "Welcome! This web site lets you track your inventory of figures for Games Workshop's ",
                m("i", "Middle Earth Strategy Battle Game"),
                " and compare it against the requirements of the official published scenarios.",
                " Want to know the biggest (or smallest) scenarios?  Which scenarios have YouTube video replays?",
                " How many Warg Riders do you need if you want to play all of the scenarios?  How far along your collection is",
                " if you want to play ",
                m("i", "The Last Alliance"),
                "? You can find the answers here!"),

              m("p",
                "You'll need to sign up for an account to track your inventory.  This will also give you ability to rate ",
                "scenarios. Is there a hidden gem that you'd like to plug?  Give it a five-star rating and see if the community agrees!"),

              m("p",
                "If you note any incorrect information, please email me the details (please be specific!) at ",
                m("a[target=_new]", {href: "mailto:davetownsend.org"}, "dave@davetownsend.org"),
                " and I'll try to get it fixed."),

              m("p", "Financial contributions are not required but are always appreciated.  You can PayPal me a donation at the above email address."),

              m("p", "I hope you find this useful!"),

              m("p", "Dave Townsend")
            )
        ];
    }
};

module.exports = AboutScreen;

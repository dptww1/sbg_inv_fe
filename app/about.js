/* global require module */

var m           = require("mithril");

//========================================================================
var AboutScreen = {
    view() {
        return [
            m(require("header")),
            m(require("nav"), { selected: "About" }),
            m(".main-content",
              m("p.text",
                "Welcome! This web site lets you track your inventory of figures for Games Workshop's ",
                m("i", "Middle Earth Strategy Battle Game"),
                " and compare it against the requirements of the official published scenarios.",
                " Want to know the biggest (or smallest) scenarios?  Which scenarios have YouTube video replays?",
                " How many Warg Riders do you need if you want to play all of the scenarios?  How far along your collection is",
                " if you want to play ",
                m("i", "The Last Alliance"),
                "? You can find the answers here!"),

              m("p.text",
                "You'll need to sign up for an account to track your inventory.  This will also give you ability to rate ",
                "scenarios so the community can determine which scenarios you should be trying.  If you do so, the site will ",
                "use a cookie to remember who you are, but I will do nothing else with your email address.  I'm a firm believer ",
                "in treating other people as I myself would like to be treated -- and I hate being spammed."),

              m("p.text",
                "If you note any incorrect information, please email me the details (please be specific!) at ",
                m("a[target=_new]", {href: "mailto:davetownsend.org"}, "dave@davetownsend.org"),
                " and I'll try to get it fixed."),

              m("p.text", "Financial contributions are not required but are always appreciated.  You can PayPal me a donation at the above email address."),

              m("p.text", "I hope you find this useful!"),

              m("p.text", "Dave Townsend")
            )
        ];
    }
};

module.exports = AboutScreen;

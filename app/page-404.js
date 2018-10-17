/* global require module */

const m      = require("mithril");

const Header = require("header");
const Nav    = require("nav");

const Page404 = {
    view: () => {
        return [
            m(Header),
            m(Nav),
            m("div.main-content",
              m("div.text",
                "Sorry, there's no such page."))
        ];
    }
};

module.exports = Page404;

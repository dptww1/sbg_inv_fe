/* global require module */

const m       = require("mithril");

const Header  = require("header");
const Nav     = require("nav");
const Request = require("request");

var news = [];
var numNewsItems = 5;
var showMore = true;

//========================================================================
const domNews = () => {
  return m("table.news",
           news.map(item => m("tr",
                              m("td.nobr", item.item_date),
                              m("td", item.item_text))),
           showMore
             ? m("tr", m("td", m("button", { onclick: updateNews }, "Older News")))
             : null);
};

//========================================================================
const updateNews = () => {
  numNewsItems += 5;
  Request.get("/newsitem?n=" + numNewsItems,
              resp => {
                const oldNumItems = news.length;
                news = resp.data;
                showMore = news.length > oldNumItems;
              });
}

//========================================================================
const AboutScreen = {
  oninit: (/*vnode*/) => {
    numNewsItems = 0;
    updateNews();
  },

  view() {
    return [
      m(Header),
      m(Nav, { selected: "About" }),
      m("p.text",
        m(".main-content",
          m("div.section-header", "News"),
          domNews())),

      m("div.section-header text", "Welcome!"),
      m("p.text",
        "This web site lets you track your inventory of figures for Games Workshop's ",
        m("i", "Middle Earth Strategy Battle Game"),
        " and compare it against the requirements of the official published scenarios.",
        " Want to know the biggest (or smallest) scenarios?  Which scenarios have YouTube video replays?",
        " How many Warg Riders do you need if you want to play all of the scenarios?  How far along your collection is",
        " if you want to play ",
        m("i", "The Last Alliance"),
        "? You can find the answers here!"),

      m("p.text",
        "You'll need to sign up for an account to track your inventory.  This will also give you ability to rate ",
        "scenarios, to help your fellow gamers find an overlooked gem. When you sign up, the site will use a cookie to ",
        "remember who you are, but nothing other than that will be done with your information. I hate spam, too."),

      m("p.text",
        "If you note any incorrect information, find bugs, or have ideas for improvement, I'd love to hear from you at ",
        m("a[target=_new]", {href: "mailto:davetownsend.org"}, "dave@davetownsend.org"),
        "."),

      m("p.text",
        "Financial contributions are not required but are always appreciated.  (In a perfect world I would raise enough ",
        "money to work on this full-time. But the world ain't perfect.)  You can PayPal me a donation at the above email address. ",
        "I have no Patreon set up at the moment, but if you'd like to contribute that way, let me know."),

      m("p.text", "I hope you find this useful!"),

      m("p.text", "Dave Townsend")
    ];
  }
};

module.exports = AboutScreen;

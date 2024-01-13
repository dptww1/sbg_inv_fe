import m from "mithril";

import { Credentials } from "./credentials.js";
import { Header      } from "./header.js";
import { Nav         } from "./nav.js";
import { Request     } from "./request.js";
import * as U          from "./utils.js";

var news = [];
var numNewsItems = 5;
var showMore = true;

var resources = [];
var numResources = 5;
var showMoreResources = true;

const newNewsItem = {
  item_date: "",
  item_text: ""
};

//========================================================================
const domNews = () => {
  return m("table.news",
           news.map(item => m("tr",
                              m("td.nobr", item.item_date),
                              m("td", item.item_text))),

           showMore
             ? m("tr",
                 m("td[colspan=2]",
                   m("button", { onclick: updateNews }, "Older News")))
             : null,

           Credentials.admin()
             ? m("tr",
                 m("td",
                   m("input[type=date][name=item_date]",
                     {
                       onchange: ev => newNewsItem.item_date = ev.target.value,
                       value: newNewsItem.item_date
                     })),
                 m("td",
                   m("input[type=text][name=item_text][size=80]",
                     {
                       onchange: ev => newNewsItem.item_text = ev.target.value,
                       value: newNewsItem.item_text
                     }),
                   m("button", { onclick: addNewsItem }, "Save")))
             : null
          );
};

//========================================================================
const domResources = () => {
  return m("table.resources",
           resources.map(resource =>
                         m("tr",
                           m("td.nobr", resource.date),
                           m("td", m(m.route.Link, { href: "/scenarios/" + resource.scenario_id }, resource.scenario_name)),
                           m("td", m("span.icon", U.resourceIcon(resource))),
                           m("td", m("a", { href: resource.url }, resource.title)))),
           showMoreResources
             ? m("tr", m("td[colspan=2]", m("button", { onclick: updateResources }, "Older Reports")))
             : null);
};

//========================================================================
const addNewsItem = () => {
  Request.post("/newsitem",
               { news_item: newNewsItem },
               resp => {
                 newNewsItem.item_date = "";
                 newNewsItem.item_text = "";
                 numNewsItems -= 4; // account for the +5 in updateNews()
                 updateNews();
                 Request.messages("Added News Item");
               });
}

//========================================================================
const updateNews = () => {
  numNewsItems += 5;
  Request.get("/newsitem?n=" + numNewsItems,
              resp => {
                const oldNumItems = news.length;
                news = resp.data;
                showMore = news.length > oldNumItems;
              });
};

//========================================================================
const updateResources = () => {
  numResources += 5;
  Request.get("/scenarios/-1/resource?n=" + numResources,
              resp => {
                const oldNumResources = resources.length;
                resources = resp.data;
                showMoreResources = resources.length > oldNumResources;
              });
};

//========================================================================
export const About = {
  oninit: (/*vnode*/) => {
    numNewsItems = 0;
    news = [];
    updateNews();

    numResources = 0;
    resources = [];
    updateResources();
  },

  view() {
    return [
      m(Header),
      m(Nav, { selected: "About" }),
      m(".main-content",
        m("div.section-header", "News"),
        domNews(),

        m("div.section-header", "Recent Battle Reports"),
        domResources(),

        m("div.section-header", "Welcome!"),
        m("p",
          "This web site lets you track your inventory of figures for Games Workshop's ",
          m("i", "Middle Earth Strategy Battle Game"),
          " and compare it against the requirements of the official published scenarios.",
          " Want to know the biggest (or smallest) scenarios?  Which scenarios have YouTube video replays?",
          " How many Warg Riders do you need if you want to play all of the scenarios?  How far along your",
          " collection is if you want to play ",
          m("i", "The Last Alliance"),
          "? You can find the answers here!"),

        m("p",
          "You'll need to sign up for an account to track your inventory.  This will also give you ability to rate ",
          "scenarios, to help your fellow gamers find an overlooked gem. When you sign up, the site will use a cookie to ",
          "remember who you are, but nothing other than that will be done with your information. I hate spam, too."),

        m("p",
          "If you note any incorrect information, find bugs, or have ideas for improvement, I'd love to hear from you at ",
          m("a[target=_new]", { href: "mailto:dave@davetownsend.org" }, "dave@davetownsend.org"),
          "."),

        m("p",
          "Financial contributions are not required but are always appreciated.  (In a perfect world I would raise enough ",
          "money to work on this full-time. But the world ain't perfect.)  You can PayPal me a donation at the above email ",
          "address. I have no Patreon set up at the moment, but if you'd like to contribute that way, let me know."),

        m("p", "I hope you find this useful!"),

        m("p", "Dave Townsend / ", m("a", { href: "mailto:dave@davetownsend.org"}, "dave@davetownsend.org"))
       )
    ];
  }
};

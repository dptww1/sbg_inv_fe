/* global require module */

const m           = require("mithril");

const Header      = require("header");
const Nav         = require("nav");
const Request     = require("request");

const COLLECTION_KEYS = [ "character", "hero", "warrior", "monster" ];

var stats = {};

const toTitleCase = s => s.charAt(0).toUpperCase() + s.substring(1);

//========================================================================
const domFigureStats = (jsonRoot, label) => [
  m("div.section-header", label),
  m("table",
    COLLECTION_KEYS.map(key =>
      jsonRoot[key].map((fig, idx) =>
        m("tr", { className: idx === 0 ? "padded-top" : "" },
          m("td", idx === 0 ? toTitleCase(key) : ""),
          m("td", m(m.route.Link, { href: "/figures/" + fig.id }, fig.name)),
          m("td", fig.total))
      )),
   )
];

//========================================================================
const StatsScreen = {
  oninit: (/*vnode*/) => {
    Request.get("/stats", resp => stats = resp.data);
  },

  view: (/*vnode*/) => {
    return [
      m(Header),
      m(Nav, { selected: "Stats" }),
      m(".main-content",
        stats.users && stats.users.total
          ? [
              m("div.section-header", "Registered Users"),
              m("p.text", stats.users.total)
            ]
          : null,

        stats.models && stats.models.mostCollected
          ? domFigureStats(stats.models.mostCollected, "Most Collected Models")
          : null,

        m("div", m.trust("&nbsp;")),

        stats.models && stats.models.mostPainted
          ? domFigureStats(stats.models.mostPainted, "Most Painted Models")
          : null
       )
    ];
  }
};

module.exports = StatsScreen;

/* global require module */

const m           = require("mithril");

const Header      = require("header");
const Nav         = require("nav");
const Request     = require("request");

const COLLECTION_KEYS = [ "character", "hero", "warrior", "monster" ];

var stats = {};

const toTitleCase = s => s.charAt(0).toUpperCase() + s.substring(1);

//========================================================================
const domFigureStats = (jsonRoot, label) =>
  m("div.stacked-column",
    m("div.section-header", label),
    m("table.striped",
      COLLECTION_KEYS.map(key =>
        jsonRoot[key].map((fig, idx) =>
          m("tr",
            m("td", idx === 0 ? toTitleCase(key) : ""),
            m("td", m(m.route.Link, { href: "/figures/" + fig.id }, fig.name)),
            m("td.numeric", fig.total.toLocaleString()))
        )),
     )
   );

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
              m("p.text", stats.users.total.toLocaleString()),

              m("div.section-header", "Total Models Collected"),
              m("p.text", stats.models.totalOwned.toLocaleString()),

              m("div.section-header", "Total Models Painted"),
              m("p.text", stats.models.totalPainted.toLocaleString())
            ]
          : null,

        m(".flex-container",
          stats.models && stats.models.mostCollected
            ? domFigureStats(stats.models.mostCollected, "Most Collected Models")
            : null,

          m("div", m.trust("&nbsp;")),

          stats.models && stats.models.mostPainted
            ? domFigureStats(stats.models.mostPainted, "Most Painted Models")
            : null
         )
       )
    ];
  }
};

module.exports = StatsScreen;

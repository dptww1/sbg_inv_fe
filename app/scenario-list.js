/* global module require localStorage */

import m from "mithril";

import { Credentials     } from "./credentials.js";
import { Filters         } from "./components/filters.js";
import { Header          } from "./header.js";
import { Pie             } from "./components/pie.js";
import * as K              from "./constants.js";
import { Nav             } from "./nav.js";
import { Request         } from "./request.js";
import { ScenarioUpdater } from "./scenario-updater.js";
import { StarRating      } from "./components/star-rating.js";
import * as U              from "./utils.js";

const ICON_DOWN       = "\u25bc";  // ▼
const ICON_RIGHT      = "\u25b6";  // ▶
const ICON_ASCENDING  = "\u25b2"; // ▲
const NBSP            = "\u00a0";

const STORAGE_KEY_SORT         = "scenario-list--sort";
const STORAGE_KEY_REVERSE_SORT = "scenario-list--sort-reverse";
const STORAGE_KEY_UNPAINTED    = "scenario-list--sort-prefer-unpainted";

const sorters = {
  completion: (a, b) => sortByCompletion(a, b),
  date:       (a, b) => sortByDate(a, b),
  location:   (a, b) => sortByLocation(a, b),
  map:        (a, b) => sortByMap(a, b),
  name:       (a, b) => sortByName(a, b),
  rating:     (a, b) => sortByRating(a, b),
  size:       (a, b) => sortBySize(a, b),
  source:     (a, b) => sortBySource(a, b)
};

let collapsedFilters = true;
let curSorter = "date";
let curSortReversed = false;
let pctSortByUnpainted = true;

let data = null;

//========================================================================
const ageAbbrev = ageNumber =>
  (1 <= ageNumber && ageNumber <= 3)
    ? ["?", "FA", "SA", "TA"][ageNumber]
    : "??";

//========================================================================
const domResourceIcons = resources => {
  var r = [];

  if (resources.magazine_replay != null && resources.magazine_replay.length > 0) {
    r.push(m("span.icon", K.ICON_STRINGS.magazine_replay));
  }

  if (resources.web_replay != null && resources.web_replay.length > 0) {
    r.push(m("span.icon", K.ICON_STRINGS.web_replay));
  }

  if (resources.video_replay != null && resources.video_replay.length > 0) {
    r.push(m("span.icon", K.ICON_STRINGS.video_replay));
  }

  if (resources.podcast != null && resources.podcast.length > 0) {
    r.push(m("span.icon", K.ICON_STRINGS.podcast));
  }

  return r;
};

//========================================================================
const domSortIcon = sortType =>
      m("span.sort-arrow",
        curSorter == sortType
          ? (curSortReversed ? ICON_DOWN : ICON_ASCENDING)
          : NBSP);

//========================================================================
const domSortPctIcon = sortType =>
      m("span.sort-pct-arrow",
        {
          className: (pctSortByUnpainted ? "unpainted" : "")
        },
        curSorter == sortType
          ? (curSortReversed ? ICON_DOWN : ICON_ASCENDING)
          : NBSP);

//========================================================================
const domTable = rawData => {
  const rows = [
    m("tr.section-header.clickable",
      Credentials.isLoggedIn()
        ? m("td.completion[data-sort-by=completion].section-header", "%", domSortPctIcon("completion"))
        : null,
      m("td.name[data-sort-by=name].section-header",             "Scenario", domSortIcon("name")),
      m("td.location[data-sort-by=location].section-header",     "Location", domSortIcon("location")),
      m("td.date[data-sort-by=date][colspan=2].section-header",  "Date",     domSortIcon("date")),
      m("td.source[data-sort-by=source].section-header",         "Source",   domSortIcon("source")),
      m("td.size[data-sort-by=size].section-header.numeric",     "Models",   domSortIcon("size")),
      m("td.map[data-sort-by=map].section-header",               "Map Size", domSortIcon("map")),
      m("td.rating[data-sort-by=rating].section-header",         "Rating",   domSortIcon("rating")),
      m("td.resources.section-header",                           "Resources"))
  ];

  rawData.forEach(s => {
    const starParams = {
      id: s.id,
      active: Credentials.isLoggedIn(),
      votes: s.num_votes,
      rating: s.rating,
      userRating: s.user_scenario.rating,
      callback: ScenarioUpdater.update
    };

    const f1 = K.FACTION_INFO[s.scenario_factions[0].faction];
    const f2 = K.FACTION_INFO[s.scenario_factions[1].faction];
    if (Filters.filter(s)) {
      rows.push(
        m("tr",
          Credentials.isLoggedIn()
            ? m("td.completion",
                m(Pie, { size: 24, n: s.size, nPainted: s.user_scenario.painted, nOwned: s.user_scenario.owned }))
            : null,
          m("td.name",
            m(m.route.Link, { class: "scenario-detail-link", href: "/scenarios/" + s.id}, s.name),
            m("br.splitter"),
            m("span.line2", U.shortResourceLabel(U.scenarioSource(s)))
           ),
          m("td.location", K.LOCATIONS[s.location]),
          m("td.date-age", ageAbbrev(s.date_age)),
          m("td.date-year", s.date_year),
          m("td.source-short", U.shortResourceLabel(U.scenarioSource(s))),
          m("td.source-full", U.resourceLabel(U.scenarioSource(s))),
          m("td.size.numeric", s.size),
          m("td.map nobr", s.map_width + "\" x " + s.map_height + "\""),
          m("td.rating-stars", m(StarRating, starParams)),
          m("td.rating-numeric", s.rating ? U.formatNumber(s.rating) : ""),
          m("td.resources", domResourceIcons(s.scenario_resources))));
    }
  });

  if (rows.length === 1) {
    rows.push(m("tr", m("td[colspan=8]", "There are no scenarios matching those search criteria!")));
  }

  return m("table.scenario-list.striped", tableSorter(rawData), rows);
};

//========================================================================
const sortByCompletion = (a, b) => {
  return pctSortByUnpainted
    ? U.cmp(a.user_scenario.owned / a.size, b.user_scenario.owned / b.size) ||
      U.cmp(a.user_scenario.painted / a.size, b.user_scenario.painted / b.size) ||
      U.cmp(b.size, a.size) ||
      sortBySource(a, b)
    : U.cmp(a.user_scenario.painted / a.size, b.user_scenario.painted / b.size) ||
      U.cmp(a.user_scenario.owned / a.size, b.user_scenario.owned / b.size) ||
      U.cmp(b.size, a.size) ||
      sortBySource(a, b);
};

//========================================================================
const sortByDate = (a, b) => {
  return U.cmp(a.date_age, b.date_age) ||
         U.cmp(a.date_year, b.date_year) ||
         U.cmp(a.date_month, b.date_month) ||
         U.cmp(a.date_day, b.date_day) ||
         sortBySource(a, b);
};

//========================================================================
const sortByLocation = (a, b) => {
  return U.strCmp(a.location, b.location) ||
         sortBySource(a, b);
};

//========================================================================
const sortByMap = (a, b) => {
  return U.cmp(a.map_width, b.map_width) ||
         U.cmp(a.map_height, b.map_height) ||
         sortBySource(a, b);
};

//========================================================================
const sortByName = (a, b) => {
  return U.strCmp(a.name, b.name) ||
         sortBySource(a, b);
};

//========================================================================
const sortByRating = (a, b) => {
  return U.cmp(a.rating, b.rating) ||
         U.strCmp(a.name, b.name) ||
         sortBySource(a, b);
};

//========================================================================
const sortBySize = (a, b) => {
  return U.cmp(a.size, b.size) ||
         U.strCmp(a.name, b.name) ||
         sortBySource(a, b);
};

//========================================================================
const sortBySource = (a, b) => {
  var aSrc = U.scenarioSource(a);
  var bSrc = U.scenarioSource(b);

  if (!aSrc && !bSrc) {
    return 0;
  }

  if (!aSrc) {
    return -1;
  }

  if (!bSrc) {
    return 1;
  }

  return U.strCmp(aSrc.title, bSrc.title) ||
         U.cmp(isNaN(aSrc.issue) ? aSrc.issue : +aSrc.issue,
               isNaN(bSrc.issue) ? bSrc.issue : +bSrc.issue) ||
         U.cmp(aSrc.sort_order, bSrc.sort_order);
};

//========================================================================
const tableSorter = list => {
  return {
    onclick: ev => {
      let newSorter = ev.target.getAttribute("data-sort-by");

      // User might have clicked on the sort arrow itself rather than the label
      if (!newSorter) {
        newSorter = ev.target.parentNode.getAttribute("data-sort-by");
      }

      if (newSorter) {
        if (newSorter === curSorter) {
          // The user clicked on the same sorter; reverse the current sort
          curSortReversed = !curSortReversed;
          localStorage.setItem(STORAGE_KEY_REVERSE_SORT, curSortReversed);

          // The completion sort is a special case because it has four
          // states (painted up, painted down, unpainted up, unpainted down)
          // rather than just two.
          if (curSorter === "completion" && !curSortReversed) {

            // Each time we end up going back to normal from reversed,
            // we need to reset the unpainted flag, and then since the
            // sorting logic changed (not just the direction of the results),
            // we need to re-sort.
            pctSortByUnpainted = !pctSortByUnpainted;
            localStorage.setItem(STORAGE_KEY_UNPAINTED, pctSortByUnpainted);

            list.sort(sorters[curSorter]);

          } else {
            list.reverse();
          }

        } else {
          // Otherwise the user clicked on a new sorter. Reset the reversal
          // flag, but leave the sort-by-unpainted flag alone so it's in
          // the proper state if the user clicks back there again.
          curSorter = newSorter;
          curSortReversed = false;
          localStorage.setItem(STORAGE_KEY_SORT, newSorter);
          localStorage.setItem(STORAGE_KEY_REVERSE_SORT, false);
          list.sort(sorters[curSorter]);
        }
      }
    }
  };
};

//========================================================================
export const ScenarioList = {
  oninit: (/*vnode*/) => {
    curSorter = localStorage.getItem(STORAGE_KEY_SORT) || "date";
    curSortReversed = U.getLocalStorageBoolean(STORAGE_KEY_REVERSE_SORT) || false;
    pctSortByUnpainted = U.getLocalStorageBoolean(STORAGE_KEY_UNPAINTED) || false;

    Request.get("/scenarios",
                resp => {
                  resp.data.sort(sorters[curSorter]);
                  if (curSortReversed) {
                    resp.data.reverse();
                  }
                  data = resp.data;
                  m.redraw();
                });
  },

  view: () => [
    m(Header),
    m(Nav, { selected: "Scenario List" }),
    m(Filters),
    m("div.main-content",
      data ? domTable(data) : "Loading...")
  ]
};

//========================================================================
ScenarioUpdater.addObserver((id, newAvgRating, userRating, newNumVotes) => {
  if (!data) {
    return;
  }

  const scenarioList = data;

  var idx = scenarioList.findIndex(elt => elt.id === id);
  if (idx >= 0) {
    scenarioList[idx].rating = newAvgRating;
    scenarioList[idx].user_scenario.rating = userRating;
    scenarioList[idx].num_votes = newNumVotes;
  }
});

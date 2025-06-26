/*global FACTION_INFO */

import m from "mithril";

import { ArmyListFilter      } from "./components/army-list-filter.js";
import * as ArmyListUtils      from "./army-list-utils.js";
import { Credentials         } from "./credentials.js";
import { EditDialog          } from "./components/edit-dialog.js";
import { Header              } from "./header.js";
import * as K                  from "./constants.js";
import { Nav                 } from "./nav.js";
import { Pie                 } from "./components/pie.js";
import { Request             } from "./request.js";

let factionOverviewMap = {};
let unaffiliatedFigureMap = {};

//========================================================================
const computeUnaffiliatedTotals = figureMap =>
  Object.keys(figureMap).reduce((acc, key) =>
    ArmyListUtils.tallyStats(acc, ArmyListUtils.computeTotals(figureMap[key])),
    ArmyListUtils.newTotalsStruct());

//========================================================================
const domArmyLists = () => {
  const totals = factionOverviewMap["Totals"]
        || { owned: 0, painted: 0 };

  return [
    m(ArmyListFilter),
    m("table.striped",
      m("tr.table-header",
        m("td.section-header", "Army List"),
        Credentials.isLoggedIn() ? m("td.numeric.section-header", "Owned") : null,
        Credentials.isLoggedIn() ? m("td.numeric.section-header[colspan=2]", "Painted") : null),

      FACTION_INFO.all().map(f => {
        if (!ArmyListFilter.shouldShowArmyListName(f.abbrev)) {
          return null;
        }

        let thisMap = factionOverviewMap[f.abbrev];
        return m("tr",
                 m("td",
                   m("a", { onclick: () => m.route.set(`/army-list/${f.id}`) }, f.name)),
                 m("td.numeric", thisMap ? thisMap.owned : ""),
                 m("td.numeric", thisMap ? thisMap.painted : ""),
                 m("td", thisMap ? m(Pie, { size: 24, n: thisMap.owned, nPainted: thisMap.painted, nOwned: thisMap.owned }) : ""),
                 Credentials.isAdmin()
                   ? m("span.action",
                       {
                         onclick: () => m.route.set(`/army-list-edit/${f.id}`)
                       },
                       K.ICON_STRINGS.edit)
                   : null
                );
      }),

      ArmyListFilter.isFilterActive() || ArmyListFilter.usingAllegianceMode()
        ? null
        : m("tr",
            m("td",
              m(m.route.Link, { href: "/army-list/-1" }, "Unaffiliated")),
            unaffiliatedFigureMap
              ? [
                  m("td.numeric", unaffiliatedFigureMap.owned),
                  m("td.numeric", unaffiliatedFigureMap.painted),
                  m("td",
                    Credentials.isLoggedIn()
                      ? m(Pie, { size: 24, n: unaffiliatedFigureMap.owned, nPainted: unaffiliatedFigureMap.painted, nOwned: unaffiliatedFigureMap.owned })
                      : null)
                ]
              : [
                  m("td", ""),
                  m("td", ""),
                  m("td", "")
              ]),

        Credentials.isLoggedIn() && !ArmyListFilter.isFilterActive()
          ? [
              m("tr.totals",
                m("td", "Totals"),
                m("td.numeric", totals.owned.toLocaleString()),
                m("td.numeric", totals.painted.toLocaleString()),
                m("td", m(Pie, { size: 24, n: totals.owned, nPainted: totals.painted, nOwned: totals.owned })))
            ]
          : null
      ),
      Credentials.isLoggedIn() && !ArmyListFilter.isFilterActive()
        ? m("p.field-note",
            "Because figures can belong to multiple factions, Totals are not the sum of the faction numbers. " +
            "They are the actual number of figures in your collection.")
        : null
     ];
};

//========================================================================
export const ArmyListsList = {
  oninit: () => {
    if (Credentials.isLoggedIn()) {
      Request.get("/faction",
        resp => {
          // The new "sources" element in the response data messes up the figure
          // summations, so take it out.
          delete resp.sources

          factionOverviewMap = resp.data;
          Request.get("/faction/-1",
            uresp => unaffiliatedFigureMap = computeUnaffiliatedTotals(uresp.data));
        });

    } else {
      factionOverviewMap = {
        factions: FACTION_INFO.all().reduce((acc, f) => {
          acc[f.abbrev] = { owned: 0, painted: 0 };
          return acc;
        }, {})
      };
    }
  },

  view: () => {
    return [
      m(Header),
      m(Nav, { selected: "Figures" }),
      m("div.main-content figure-list-main-content",
        Credentials.isAdmin()
          ? [
              m("button", { onclick: () => m.route.set("/figure-edit") }, "Add Figure"),
              " ",
              m("button", { onclick: () => m.route.set("/army-list-edit") }, "Add Army List"),
              m("br")
            ]
          : null,
        domArmyLists()),
        m(EditDialog)
    ];
  }
};

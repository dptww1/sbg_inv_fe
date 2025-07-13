/*global FACTION_INFO */

import m from "mithril";

import * as ArmyListUtils      from "./army-list-utils.js";
import { Credentials         } from "./credentials.js";
import { EditDialog          } from "./components/edit-dialog.js";
import { EditInventoryDialog } from "./components/edit-inventory-dialog.js";
import { Header              } from "./header.js";
import * as K                  from "./constants.js";
import { Nav                 } from "./nav.js";
import { Pie                 } from "./components/pie.js";
import { Request             } from "./request.js";
import * as U                  from "./utils.js";

export const ArmyListDetails = () => {

  let armyListId;
  let armyListSources = [];
  let figuresMap = {};

  //========================================================================
  const domArmyListSources = () => {
    if (!armyListSources || armyListSources.length === 0) {
      return null;
    }

    return [
      m(".section-header", "Source" + (armyListSources.length > 1 ? "s" : "")),
      m("ul.sources",
        armyListSources.map(src => m("li", U.resourceReference(src))))
    ];
  };

  //========================================================================
  const domFigureListByType = (title, list) => {
    if (list.length === 0) {
      return null;
    }

    return [
      m("tr.figure-list-section", m("td.section-header", { colspan: 2 }, title)),
      list.map((fig, idx) => Credentials.isLoggedIn()
        ? m("tr.constant-height", { className: idx % 2 == 0 ? "striped" : null },
            m("td",
              fig.slug
                ? {
                    class: "name hasSilhouette",
                    style: `--img: url('${U.silhouetteUrl(fig.slug)}')`
                  }
                : {
                    class: "name"
                  },
              m(m.route.Link, { href: "/figures/" + fig.id }, fig["name"])),

            m("td.numeric",
              m("a",
                {
                  onclick: () => EditInventoryDialog.show(fig, "buy_unpainted", refresh)
                },
                fig.owned)),
            m("td.numeric",
              fig.painted < fig.owned
                ? m("a",
                    {
                      onclick: () => EditInventoryDialog.show(fig, "paint", refresh)
                    },
                    fig.painted)
                : fig.painted),
            m("td.pie", m(Pie, { size: 24, n: fig.owned, nPainted: fig.painted, nOwned: fig.owned })),
            m("td.numeric", fig.needed),
            m("td.pie",
              fig.needed > 0
                ? m(Pie, { size: 24, n: fig.needed, nPainted: fig.painted, nOwned: fig.owned })
                : null),
            m("td.resources", domResources(fig)),
            Credentials.isAdmin()
              ? m("td.action", { onclick: () => m.route.set(`/figure-edit/${fig.id}`) }, K.ICON_STRINGS.edit)
              : null)

        : m("tr",
            m("td.name", m(m.route.Link, { href: `/figures/${fig.id}` }, fig.name)),
            m("td.numeric", fig.needed),
            m("td", ""),
            m("td", domResources(fig)))
      )
    ];
  };

  //========================================================================
  const domResources = fig => [
    fig.num_painting_guides ? m("span", m.trust(K.IMAGE_STRINGS["painting_guide"])) : "",
    " ",
    fig.num_analyses ? m("span", m.trust(K.IMAGE_STRINGS["analysis"])) : ""
  ];

  //========================================================================
  const domTotals = () => {
    const stats = Object.keys(figuresMap)
      .reduce((acc, k) => ArmyListUtils.tallyStats(acc, ArmyListUtils.computeTotals(figuresMap[k])),
        ArmyListUtils.newTotalsStruct());

    return [
      m("tr.totals",
        m("td", "Totals"),
        Credentials.isLoggedIn() ? m("td.numeric", stats.owned) : null,
        Credentials.isLoggedIn() ? m("td.numeric", stats.painted) : null,
        Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: stats.owned, nPainted: stats.painted, nOwned: stats.owned })) : null,
        m("td.numeric", stats.needed),
        Credentials.isLoggedIn() ? m("td.pie", m(Pie, { size: 24, n: stats.needed, nPainted: stats.neededPainted, nOwned: stats.neededOwned })) : null)
    ];
  };

  //========================================================================
  // The new "sources" element in the response data messes up the figure
  // summations, so take it out.
  //------------------------------------------------------------------------
  const extractArmyListSources = respData => {
    if (respData && respData.sources) {
      armyListSources = respData.sources;
      delete respData.sources;

    } else {
      armyListSources = [];
    }
  };

  //========================================================================
  const refresh = () => {
    Request.get(`/faction/${armyListId}`,
      resp => {
        figuresMap = resp.data;
        extractArmyListSources(resp.data);
        Object.keys(figuresMap).forEach(k => figuresMap[k].sort((a, b) => U.strCmp(a.name, b.name)));
      });
  };

  //========================================================================
  return {
    oninit: () => {
      armyListId = m.route.param("id");
      refresh();
    },

    view: () => [
      m(Header),
      m(Nav, { selected: "Figures" }),
      m(".main-content.army-list-main-content",
        m("span.action", { onclick: () => m.route.set("/figures") }, K.ICON_STRINGS.back),
        m("span.clickable", { onclick: () => m.route.set("/figures") }, "Back"),

        m(".page-title",
          armyListId < 0 ? "Unaffiliated" : FACTION_INFO.byId(armyListId).name,
          Credentials.isAdmin()
            ? m("span.action", { onclick: () => m.route.set(`/army-list-edit/${armyListId}`) }, K.ICON_STRINGS.edit)
            : null),

        m("table",
          m("tr.table-header",
            m("td.section-header"),
            Credentials.isLoggedIn() ? m("td.numeric.section-header", "Owned") : null,
            Credentials.isLoggedIn() ? m("td.numeric.section-header[colspan=2]", "Painted") : null,
            m("td.section-header[colspan=2]", "Needed"),
            m("td.section-header", "Resources"),
            Credentials.isAdmin() ? m("td") : null),

          figuresMap.heroes // if any key is there, they should all be
           ? [
               domFigureListByType("Characters", figuresMap.heroes.filter(fig => fig.unique)),
               domFigureListByType("Heroes", figuresMap.heroes.filter(fig => !fig.unique)),
               domFigureListByType("Warriors", figuresMap.warriors),
               domFigureListByType("Monsters", figuresMap.monsters),
               domFigureListByType("Siege Equipment", figuresMap.siegers),
               domTotals()
             ]
            : null),

        domArmyListSources(),

        m(EditDialog))
    ]
  };
};

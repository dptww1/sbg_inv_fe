/*global FACTION_INFO */

import m from "mithril";
import prop from "mithril/stream";

import { BookResourceEditor } from "../admin-components/book-resource-editor.js";
import { FigureListEditor   } from "../admin-components/figure-list-edit.js";
import { FormField          } from "../components/form-field.js";
import { Header             } from "../header.js";
import * as K                 from "../constants.js";
import { Nav                } from "../nav.js";
import { Request            } from "../request.js";
import { SortedList         } from "../admin-components/sorted-list.js"
import * as U                 from "../utils.js";

export const ArmyListEdit = () => {
  const armyList = {
    id:        prop(null),
    name:      prop(""),
    abbrev:    prop(""),
    alignment: prop(0),
    legacy:    prop(false),
    keywords:  prop(""),
    sources:   prop([]),
    figures:   prop([])
  };

  //========================================================================
  const duplicateAbbrevWarning = () => {
    const other = FACTION_INFO.all().find(elt => elt.abbrev === armyList.abbrev());
    return other && other.id !== armyList.id()
      ? "Duplicate abbreviation"
      : "";
  }

  //========================================================================
  const figureSelect = target => {
    if (!target) {
      return;
    }

    armyList.figures().push({ id: parseInt(target.dataset.id, 10), name: target.dataset.name });
  };

  //========================================================================
  const formIsValid = () =>
    armyList.name() !== ""
      && armyList.abbrev() !== ""
      && armyList.sources().length > 0
      && armyList.figures().length > 0

  //========================================================================
  const keywordsForCurrentAlignment = () => {
    const unique_keywords = FACTION_INFO.byAlignment(armyList.alignment())
      .reduce((acc, elt) => {
        elt["keywords"]
          .split(/\s+/)
          .flatMap(x => x)
          .filter(s => s.match(/\S/))
          .forEach(word => acc[word] = undefined);
        return acc;
      }, {});

    return Object.keys(unique_keywords).sort().join(", ");
  };

  //========================================================================
  const saveArmyList = () => {
    const rawArmyList = U.unpropertize(armyList);

    rawArmyList.faction_figures = rawArmyList.figures.reduce((acc, elt) => {
      acc.push({ "figure_id": elt.id });
      return acc;
    }, []);

    Request.putOrPost("/faction", armyList.id(), { army_list: rawArmyList }, resp => {
      U.emptyOutObject(armyList);
      m.route.set(`/army-list/${resp.data.id}`);
    });
  };

  //========================================================================
  const untangleFigures = rawList => {
    const outList = [];

    ["characters", "heroes", "warriors", "monsters", "siegers"].forEach(type => {
      if (rawList[type]) {
        rawList[type].forEach(f => outList.push({ id: f.id, name: f.name }));
      }
    });

    return outList;
  };

  //========================================================================
  if (m.route.param("id")) {
    const id = parseInt(m.route.param("id"), 10);
    const f = FACTION_INFO.byId(id);
    armyList.id(id);
    armyList.name(f.name);
    armyList.abbrev(f.abbrev);
    armyList.alignment(f.alignment);
    armyList.legacy(f.legacy);
    armyList.keywords(f.keywords);

    Request.get(`/faction/${id}`,
      resp => {
        armyList.sources(resp.data.sources);
        armyList.figures(untangleFigures(resp.data));
      })
  }

  return {
    view: () => {
      return [
        m(Header),
        m(Nav),
        m("div.main-content army-list-edit-main-content",
          m(".page-title", `${armyList.id() ? "Edit" : "Create"} Army List`),
          m(".form-container",
            FormField.text(armyList.name, "Name"),
            FormField.text(armyList.abbrev, "Abbrev", { fieldNote: duplicateAbbrevWarning() }),
            FormField.select(armyList.alignment, "Alignment",
              {
                valueType: "integer",
                options: [
                  "Good=0",
                  "Evil=1"
                  ]
              }),
            FormField.checkbox(armyList.legacy, "Legacy?"),
            FormField.text(armyList.keywords, "Keywords", { fieldNote: keywordsForCurrentAlignment() }),

            m("label[for=sources]", "Sources"),
            m(".sources",
              m(SortedList(armyList.sources, src => U.resourceReference(src))),
              m("b", "Add New Source"),
              m(BookResourceEditor, { commitFn: rsrc => armyList.sources().push(rsrc) })),

            m("label[for=figures]", "Figures"),
            m(".figures",
              armyList.figures().map((f, idx) =>
                m("div",
                  m("span.figure-name", f.name),
                  m("span.action",
                    {
                      onclick: () => armyList.figures().splice(idx, 1)
                    },
                    K.ICON_STRINGS.remove))),
              m(FigureListEditor,
                {
                  onItemSelect: figureSelect,
                  exclusions: armyList.figures().map(f => f.id)
                })
            ),

            m("button",
              {
                onclick: saveArmyList,
                disabled: !formIsValid()
              },
              "Submit")))
      ];
    }
  }
};

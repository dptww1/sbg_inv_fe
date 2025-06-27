/*global FACTION_INFO */

import m from "mithril";

import { Credentials }      from "../credentials.js";
import { FigureListEditor } from "../admin-components/figure-list-edit.js";
import { Header      }      from "../header.js";
import * as K               from "../constants.js";
import { Nav         }      from "../nav.js";
import { Request     }      from "../request.js";

let alignmentFilter = null;
let figure = { factions: [], type: "hero", same_as: null, create_char: false };
let editMode = false;
let sameAsName = null; // null, or name of source figure

//========================================================================
const domAlignmentFilter = () =>
  m("tr",
    m("td", "Filter Army Lists/Allegiances"),
    m("td",
      m("select",
        {
          onchange: ev => alignmentFilter = ev.target.value === "" ? null : parseInt(ev.target.value, 10)
        },
        m("option[value=]",  { selected: alignmentFilter === null  }, " -- All --"),
        m("option[value=0]", { selected: alignmentFilter === 0 }, "-- Only Good --"),
        m("option[value=1]", { selected: alignmentFilter === 1 }, "-- Only Evil --"))));

//========================================================================
const domCreateCharacter = () =>
      m("tr",
        m("td.valign-top", "Create Char?"),
        m("td", m("input[type=checkbox][name=createChar]",
                  {
                    onchange: ev => figure.create_char = ev.target.checked,
                    checked: figure.create_char
                  })));

//========================================================================
const domFactions = (title, filterFn) =>
      m("tr",
        m("td.valign-top", title),
        m("td",
          m("div.faction-checkbox-container",
            FACTION_INFO.all()
              .filter(filterFn)
              .filter(f => alignmentFilter === null || f.alignment === alignmentFilter)
              .map(f =>
                m("div",
                  m("input[type=checkbox]",
                    {
                      id: f.id,
                      value: f.abbrev,
                      checked: figure.factions.indexOf(f.abbrev) >= 0,
                      onchange: updateFactions
                    }),
                  m("label", f.name))))));

//========================================================================
const domSameAs = () =>
      m("tr",
        m("td", "Same As"),
        figure.same_as
          ? m("td",
              sameAsName,
              m("span.action",
                {
                  onclick: () => figure.same_as = sameAsName = null
                },
                " " + K.ICON_STRINGS.remove))
          : m("td",
              m(FigureListEditor, { onItemSelect: otherFigureSelect }),
              " If set, assign the new figure to this figure's scenarios and character"));

//========================================================================
const domSlug = () => domTextInputRow("Slug", "slug", figure.slug, newVal => figure.slug = newVal);

//========================================================================
const domTextInputRow = (label, name, val, setter) =>
      m("tr",
        m("td", label),
        m("td", m("input[type=text][size=60]",
                  {
                    name: name,
                    onchange: ev => setter(ev.target.value),
                    value: val
                  })));

//========================================================================
const domTypeDropDown = () =>
      m("tr",
        m("td", "Type"),
        m("td", m("select",
                  {
                    onchange: ev => figure.type = ev.target.value,
                    value: figure.type
                  },
                  m("option[value=hero]", "Hero"),
                  m("option[value=warrior]", "Warrior"),
                  m("option[value=monster]", "Monster"),
                  m("option[value=sieger]", "Sieger"))));

//========================================================================
const domUniqueCheckbox = () =>
      m("tr",
        m("td", "Unique?"),
        m("td", m("input[type=checkbox][name=unique]",
                  {
                    onchange: ev => figure.unique = ev.target.checked,
                    checked: figure.unique
                  }
                 )));

//========================================================================
const otherFigureSelect = target => {
  if (!target) {
    return;
  }

  figure.same_as = target.dataset.id;
  sameAsName = target.dataset.name;
}

//========================================================================
const refresh = () => {
  if (m.route.param("id")) {
    Request.get("/figure/" + m.route.param("id"),
                resp => {
                  figure = resp.data;
                  figure.same_as = null;
                  editMode = true;
                });
  } else {
    resetForm();
  }
};

//========================================================================
const resetForm = () => {
  figure = { factions: [], type: "hero", same_as: "", create_char: false };
  editMode = false;
}

//========================================================================
const submitFigure = () => {
  if (!figure.name) {
    Request.errors("Name is required!");
    return;
  }

  Request.putOrPost("/figure",
                    figure.id,
                    { figure: figure },
                    () => {
                      Request.messages("Saved " + figure.name);
                      resetForm();
                      m.route.set("/figures");
                    });
};

//========================================================================
const updateFactions = ev => {
  if (ev.target.checked) {
    figure.factions.push(ev.target.value);

  } else {
    figure.factions = figure.factions.filter(x => x != ev.target.value);
  }
};

//========================================================================
export const FigureEdit = {
  oninit: (/*vnode*/) => {
    refresh();
  },

  view: () => {
    if (!Credentials.admin()) {
      return null;
    }

    return [
      m(Header),
      m(Nav),
      m("div.main-content",
        m(".inputForm",
          m(".formTitle", editMode ? "Edit Figure" : "Create New Figure"),
          m("table",

            domTextInputRow("Name", "name", figure.name, newVal => figure.name = newVal),
            domTextInputRow("Plural Name", "plural_name", figure.plural_name, newVal => figure.plural_name = newVal),

            !editMode ? domSameAs() : null,

            !editMode && !sameAsName ? domCreateCharacter() : null,

            editMode || !figure.same_as
              ? [
                  domTypeDropDown(),
                  domUniqueCheckbox(),
                  domSlug(),
                  domAlignmentFilter(),
                  domFactions("Army Lists", f => !f.legacy),
                  domFactions("Allegiances", f => f.legacy)
                ]
              : domSlug(),

            m("tr",
              m("td"),
              m("td", m("button", { onclick: submitFigure }, "Submit")))
           )))
    ];
  }
};

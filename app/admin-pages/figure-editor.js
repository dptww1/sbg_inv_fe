/*global FACTION_INFO */

import m    from "mithril";
import prop from "mithril/stream";

import { Credentials      } from "../credentials.js";
import { FigureListEditor } from "../admin-components/figure-list-editor.js";
import { FormField        } from "../components/form-field.js";
import { Header           } from "../header.js";
import * as K               from "../constants.js";
import { Nav              } from "../nav.js";
import { Request          } from "../request.js";
import * as U               from "../utils.js";

const ALIGNMENT_FILTER_OPTIONS = [
  "-- All --=",
  "-- Only Good --=0",
  "-- Only Evil --=1"
];
const FIGURE_TYPE_OPTIONS = [
  "Hero=hero",
  "Warrior=warrior",
  "Monster=monster",
  "Sieger=sieger"
];

let alignmentFilter = prop();
let figure;
let editMode = false;
let sameAsName = null; // null, or name of source figure

//========================================================================
const cancelSameAs = () => {
  figure.same_as(null);
  sameAsName = null;
}

//========================================================================
const domFactions = (title, filterFn) => [
  title,
  m("div.faction-checkbox-container",
    FACTION_INFO.all()
      .filter(filterFn)
      .filter(f => U.isBlank(alignmentFilter()) || `${f.alignment}` === alignmentFilter())
      .map(f =>
        m("div",
          m("input[type=checkbox]",
            {
              id: f.id,
              value: f.abbrev,
              checked: figure.factions().indexOf(f.abbrev) >= 0,
              onchange: updateFactions
            }),
          m("label", f.name))))
  ]


//========================================================================
const domSameAs = () => {
  return [
    "Same As",
    figure.same_as()
      ? m("",
          sameAsName,
          m("span.action",
            {
              onclick: cancelSameAs //() => figure.same_as = sameAsName = null
            },
            " " + K.ICON_STRINGS.remove))
      : [
          m(FigureListEditor, { onItemSelect: otherFigureSelect })
        ]
  ];
};

//========================================================================
const domSlug = () => FormField.text(figure.slug, "Slug");

//========================================================================
const otherFigureSelect = target => {
  if (!target) {
    return;
  }

  figure.same_as(target.dataset.id);
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
                  figure = U.propertize(figure);
                });
  } else {
    resetForm();
  }
};

//========================================================================
const resetForm = () => {
  figure = U.propertize({
    id: null,
    name: "",
    plural_name: "",
    factions: [],
    type: "hero",
    unique: false,
    slug: "",
    same_as: null,
    create_char: false
  });
  editMode = false;
}

//========================================================================
const submitFigure = () => {
  if (U.isBlank(figure.name())) {
    Request.errors("Name is required!");
    return;
  }

  Request.putOrPost("/figure",
                    figure.id(),
                    { figure: U.unpropertize(figure) },
                    () => {
                      Request.messages("Saved " + figure.name());
                      resetForm();
                      m.route.set("/figures");
                    });
};

//========================================================================
const updateFactions = ev => {
  if (ev.target.checked) {
    figure.factions().push(ev.target.value);

  } else {
    figure.factions(figure.factions().filter(x => x != ev.target.value));
  }
};

//========================================================================
export const FigureEditor = {
  oninit: (/*vnode*/) => {
    resetForm();
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
        m(".page-title", editMode ? "Edit Figure" : "Create New Figure"),
        m(".figure-details-form-container",
          FormField.text(figure.name, "Name"),
          FormField.text(figure.plural_name, "Plural Name"),

          !editMode ? domSameAs() : null,
          !editMode && !sameAsName ? FormField.checkbox(figure.create_char, "Create Character?") : null,

          editMode || !figure.same_as()
            ? [
                FormField.select(figure.type, "Type", { options: FIGURE_TYPE_OPTIONS }),
                FormField.checkbox(figure.unique, "Unique?"),
                domSlug(),
                FormField.select(alignmentFilter, "Filter Army Lists/Allegiances", { options: ALIGNMENT_FILTER_OPTIONS }),
                domFactions("Army Lists", f => !f.legacy),
                domFactions("Allegiances", f => f.legacy)
              ]
            : domSlug(),

          m("button", { onclick: submitFigure }, "Submit")))
    ];
  }
};

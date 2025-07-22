import m    from "mithril";
import prop from "mithril/stream";

import { FigureListEditor } from "./figure-list-editor.js";
import { FormField        } from "../components/form-field.js";
import * as K               from "../constants.js";
import { SortableList     } from "./sortable-list.js";
import * as U               from "../utils.js";

//========================================================================
let editIdx = -1;

//========================================================================
const appendFigure = (role, target) => {
  if (target === null) {
    return;
  }

  if (!role.figures) {
    role.figures = prop([]);
  }

  role.figures().push({
    figure_id:   target.dataset.id,
    name:        target.dataset.name,
  });
};

//========================================================================
const computeExclusions = existingFigs =>
  existingFigs
    ? existingFigs.map(fig => parseInt(fig.figure_id, 10))
    : [];

//========================================================================
const computePlaceholder = role => {
  if (U.isNotBlank(role.name())) {
    return role.name();
  }

  if (U.isBlank(role.figures())) {
    return "";
  }

  return role.figures()[0].name.replace(/\s+\(.*$/, "");
};

//========================================================================
const domRole = (role, idx) => [
  FormField.hidden(role.id, "id" + idx),

  FormField.hidden(() => idx, "sort_order" + idx),

  m(".expand",
    {
      onclick: () => role._expanded = !role._expanded
    },
    m("span.action", role._expanded ? K.ICON_STRINGS.open : K.ICON_STRINGS.closed)),

  FormField.numeric(role.amount, null, {
    max: 300,
    min: 1,
    name: "amount" + idx,
    readOnly: idx !== editIdx
  }),

  m(".role-name-column",
    FormField.text(role.name, null, {
      hideLabel: true,
      placeholder: computePlaceholder(role),
      readOnly: idx !== editIdx
    }),
    m("br"),

    role._expanded
      ? [
          role.figures().map((figure, figureIdx) => [
            m(".role-name", figure.name),
            m("span.action", { onclick: () => role.figures().splice(figureIdx, 1) }, K.ICON_STRINGS.remove),
            m("br")
          ]),
          idx === editIdx
            ? m(FigureListEditor,
                {
                  exclusions: computeExclusions(role.figures()),
                  onItemSelect: target => appendFigure(role, target)
                })
            : null
        ]
      : null)
];

//========================================================================
export const RoleListEditor = {
  computePlaceholder: computePlaceholder,

  oninit: () => {
    editIdx = -1;
  },

  view: ({ attrs }) => [
    (attrs.roles() && attrs.roles().find(r => r._expanded))
      ? m(".collapse-all.action",
        {
          onclick: () => attrs.roles() ? attrs.roles().forEach(r => r._expanded = false) : false
        },
        K.ICON_STRINGS.back)
      : null,

    m(".role-list-editor",
      m(SortableList,
        {
          itemsProp: attrs.roles,
          renderFn: domRole,
          editFn: idx => {
            editIdx = idx;
            attrs.roles()[idx]._expanded = true;
          }
        })),

        m(".action",
          {
            onclick: () => {
              const newRec = U.propertize({ id: null, amount: 1, name: "", plural_name: "", figures: [] });
              newRec._expanded = true; // this field shouldn't be propertized
              attrs.roles().push(newRec);
              editIdx = attrs.roles().length - 1;
            }
          },
          K.ICON_STRINGS.plus)
  ]
};

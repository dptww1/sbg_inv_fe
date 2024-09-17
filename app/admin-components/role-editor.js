import m from "mithril";

import * as K        from "../constants.js";
import { Request }   from "../request.js";
import { Typeahead } from "../components/typeahead.js";

//========================================================================
let editIdx = -1;

//========================================================================
const appendFigure = (role, target) => {
  if (!role.figures) {
    role.figures = [];
  }

  role.figures.push({
    figure_id:   target.dataset.id,
    name:        target.dataset.name,
    plural_name: target.dataset.plural_name || target.dataset.name,
    type:        target.dataset.type,
    unique:      false // TODO
  });
};

//========================================================================
const computePlaceholder = role => {
  if (role.name && role.name.length > 0) {
    return role.name;
  }

  if (!role.figures || role.figures.length == 0) {
    return "";
  }

  return (parseInt(role.amount, 10) > 1 ? role.figures[0].plural_name : role.figures[0].name)
    .replace(/\s+\(.*$/, "");
};

//========================================================================
const moveUp = (roles, idx) => {
  let tmp = roles[idx - 1];
  roles[idx - 1] = roles[idx];
  roles[idx] = tmp;

  roles[idx - 1].sort_order -= 1;
  roles[idx].sort_order += 1;
};

//========================================================================
const moveDown = (roles, idx) => {
  let tmp = roles[idx + 1];
  roles[idx + 1] = roles[idx];
  roles[idx] = tmp;

  roles[idx + 1].sort_order += 1;
  roles[idx].sort_order -= 1;
};

//========================================================================
const removeFigure = (roles, roleIdx, figureIdx) => {
  roles[roleIdx].figures.splice(figureIdx, 1);
};

//========================================================================
const updateRoleAmount = (roles, roleIdx, ev) => {
  roles[roleIdx].amount = ev.target.value;
};

//========================================================================
const updateRoleName = (roles, roleIdx, ev) => {
  roles[roleIdx].name = ev.target.value;

  if (ev.which === 13) { // enter
    editIdx = -1;
  }
};

//========================================================================
export const RoleEditor = {
  computePlaceholder: computePlaceholder,

  oninit: ({ attrs }) => {
    editIdx = -1;
  },

  view: ({ attrs }) =>
    m(".form-container role-edit-row",
      m("table",
        m("tr",
          m("td"),
          m("td", "#"),
          m("td", "Name"),
          m("td")),

          attrs.roles.map((role, roleIdx) => [
                    m("tr",
                      m("td",
                        { onclick: () => role._expanded = !role._expanded },
                        role._expanded ? "v" : ">",
                        m("input[type=hidden]",
                          {
                            name: "id" + roleIdx,
                            value: role.id ? role.id : ""
                          }),
                        m("input[type=hidden]",
                          {
                            name: "sort_order" + roleIdx,
                            value: roleIdx
                          })
                        ),
                      m("td", roleIdx === editIdx
                                ? m("input[type=number][min=1][max=300]",
                                    {
                                      name: "amount" + roleIdx,
                                      value: role.amount,
                                      onchange: ev => updateRoleAmount(attrs.roles, roleIdx, ev)
                                    })
                                : role.amount
                      ),
                      m("td", roleIdx === editIdx
                                ? m("input[type=text]",
                                    {
                                      name: "name" + roleIdx,
                                      placeholder: computePlaceholder(role),
                                      value: computePlaceholder(role),
                                      onkeyup: ev => updateRoleName(attrs.roles, roleIdx, ev)
                                    })
                                : computePlaceholder(role)
                      ),
                      m("td",
                        m("span.icon", { onclick: () => editIdx = editIdx === roleIdx ? -1 : roleIdx }, K.ICON_STRINGS.edit),
                          roleIdx > 0
                            ? m("span.icon", { onclick: () => moveUp(attrs.roles, roleIdx) }, K.ICON_STRINGS.up)
                            : m("span.icon", " "),
                          roleIdx < attrs.roles.length - 1
                            ? m("span.icon", { onclick: () => moveDown(attrs.roles, roleIdx) }, K.ICON_STRINGS.down)
                            : m("span.icon", " "),
                          m("span.icon", { onclick: () => attrs.roles.splice(roleIdx, 1) }, K.ICON_STRINGS.remove)
                        )
                      ),
                      role._expanded
                        ? role.figures.map((figure, figureIdx) =>
                            m("tr.figure",
                              m("td"),
                              m("td"),
                              m("td", figure.name),
                              m("td", m("span.icon", { onclick: ev => removeFigure(attrs.roles, roleIdx, figureIdx) }, "-"))
                            )
                          ).concat(
                            roleIdx === editIdx
                              ? m("tr.figure",
                                  m("td"),
                                  m("td"),
                                  m("td",
                                    m(Typeahead, {
                                      placeholder: "Figure name",
                                      findMatches: attrs.findCompletions,
                                      onItemSelect: (target) => appendFigure(role, target)
                                    })))
                            : null
                          )
                        : null
           ])
        ),

        m("span.icon",
          {
            onclick: ev => {
              attrs.roles.push({ amount: 1, name: "", plural_name: "", figures: [], _expanded: true });
              editIdx = attrs.roles.length - 1;
            }
          },
          K.ICON_STRINGS.plus)
    )
};

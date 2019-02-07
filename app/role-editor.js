/* global module require */

const m = require("mithril");

const K         = require("constants");
const Request   = require("request");
const Typeahead = require("typeahead");

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
    plural_name: target.dataset.name, // TODO
    type:        target.dataset.type,
    unique:      false // TODO
  });
}

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

  if (ev.which === 13) { // enter
    editIdx = -1;
  }
};

//========================================================================
const updateRoleName = (roles, roleIdx, ev) => {
  roles[roleIdx].name = ev.target.value;

  if (ev.which === 13) { // enter
    editIdx = -1;
  }
};

//========================================================================
const RoleEditor = {
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
                        role._expanded ? "-" : "+",
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
                                ? m("input[type=text][size=3]",
                                    {
                                      name: "amount" + roleIdx,
                                      value: role.amount,
                                      onkeyup: ev => updateRoleAmount(attrs.roles, roleIdx, ev)
                                    })
                                : role.amount
                      ),
                      m("td", roleIdx === editIdx
                                ? m("input[type=text][placeholder=Role Name]",
                                    {
                                      name: "name" + roleIdx,
                                      value: role.name,
                                      onkeyup: ev => updateRoleName(attrs.roles, roleIdx, ev)
                                    })
                                : role.name
                      ),
                      m("td",
                        m("span.icon", { onclick: () => editIdx = editIdx === roleIdx ? -1 : roleIdx }, K.ICON_STRINGS.edit),
                          roleIdx > 0
                            ? m("span.icon", { onclick: () => moveUp(attrs.roles, roleIdx) }, "^")
                            : m("span.icon", " "),
                          roleIdx < attrs.roles.length - 1
                            ? m("span.icon", { onclick: () => moveDown(attrs.roles, roleIdx) }, "v")
                            : m("span.icon", " "),
                          m("span.icon", { onclick: () => attrs.roles.splice(roleIdx, 1) }, "X")
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
                            m("tr.figure",
                              m("td"),
                              m("td"),
                              m("td",
                                m(Typeahead, {
                                    placeholder: "Figure name",
                                    findMatches: attrs.findCompletions,
                                    onItemSelect: (target) => appendFigure(role, target)
                                  }
                                )
                              )
                            )
                          )
                        : null
           ])
        ),

        m("span.icon",
          {
            onclick: ev => {
              attrs.roles.push({ amount: 0, name: "New Role", plural_name: "New Roles", figures: []});
              editIdx = attrs.roles.length - 1;
            }
          },
          "+")
    )
};

module.exports = RoleEditor;

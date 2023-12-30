import m from "mithril";

import { Header      } from "../header.js";
import * as K          from "../constants.js";
import { Nav         } from "../nav.js";
import { Request     } from "../request.js";
import { RoleEditor  } from "./role-editor.js";

let scenario = {};
let faction = { roles: [] };

//========================================================================
const findCompletions = (s, typeahead) => {
  Request.get("/search?type=f&q=" + s,
              resp => {
                typeahead.suggestions = resp.data.map(x => {
                  x.len = s.length;
                  return x;
                });
              });
};

//========================================================================
const patchRoleNames = roles => {
  roles.forEach(role => {
      role.name = role.name || RoleEditor.computePlaceholder(role);
  });
  return roles;
}

//========================================================================
const refresh = () => {
  scenario = {
    id: m.route.param("sid"),
    size: 0,
    scenario_factions: [{}, {}]
  };

  const fid = m.route.param("fid");

  if (scenario.id) {
    Request.get("/scenarios/" + scenario.id,
                resp => {
                  scenario = resp.data;
                  faction = scenario.scenario_factions.find(f => f.id === parseInt(fid));
                });
  }
};

//========================================================================
const save = (_ev) => {
  let apiUrl = "/scenario-faction/" + faction.id;

  const inputs = document.getElementsByTagName("input");
  for (let i = 0; i < inputs.length; ++i) {
    const widget = inputs.item(i);

    if (widget.type === "search" ||
        widget.name.startsWith("_") ||
        widget.value === "") {
      continue;
    }

    const matchInfo = /^(.*)(\d)$/.exec(widget.name);

    if (matchInfo) {
      faction["roles"][matchInfo[2]][matchInfo[1]] = widget.value;

    } else {
      faction[widget.name] = widget.value;
    }
  }

  faction.roles.forEach((r, idx) => {
    r.sort_order = idx + 1;
    r.scenario_faction_id = faction.id;
    r.name = r.name || RoleEditor.computePlaceholder(r);
  });

  Request.put("/scenario-faction/" + faction.id,
              { scenario_faction: faction },
              resp => {
                m.route.set("/scenarios/" + scenario.id);
              });
};

//========================================================================
export const FactionEdit = {
  oninit: (vnode) => {
    refresh();
  },

  view: () => {
    return [
      m(Header),
      m(Nav),
      m("table",
        m("tr",
          m("td", "Faction"),
          m("td", faction && faction.faction ? K.FACTION_INFO[faction.faction].name: "")),

        m("tr",
          m("td", "Suggested Points"),
          m("td", m("input[type=text][name=suggested_points]", { value: faction.suggested_points }))),

        m("tr",
          m("td", "Actual Points"),
          m("td", m("input[type=text][name=actual_points]", { value: faction.actual_points }))),

        m("tr",
          m("td", "Sort Order"),
          m("td", m("input[type=text][name=sort_order]", { value: faction.sort_order })))
      ),

      faction.roles ? m(RoleEditor,
                        {
                          roles: faction.roles,
                          findCompletions: findCompletions,
                          factionId: m.route.param("fid"),
                          scenarioId: m.route.param("sid")
                        })
                    : null,
      m("br"),
      m("button", { onclick: save }, "Save")
    ];
  }
};

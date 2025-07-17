import m    from "mithril";
import prop from "mithril/stream";

import { Header         } from "../header.js";
import { Nav            } from "../nav.js";
import { Request        } from "../request.js";
import { RoleListEditor } from "../admin-components/role-list-editor.js";
import * as U             from "../utils.js";

let scenario = {};
let faction = {
  roles: prop([])
};

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
                  faction = scenario.scenario_factions.find(f => f.id === parseInt(fid, 10));
                  faction.roles = prop(faction.roles);
                });
  }
};

//========================================================================
const save = () => {
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
      faction.roles()[matchInfo[2]][matchInfo[1]] = widget.value;

    } else {
      faction[widget.name] = widget.value;
    }
  }

  faction.roles().forEach((r, idx) => {
    r.sort_order = idx + 1;
    r.scenario_faction_id = faction.id;
    r.name = r.name || RoleListEditor.computePlaceholder(r);
  });

  Request.put("/scenario-faction/" + faction.id,
    { scenario_faction: U.unpropertize(faction) },
    () => {
      m.route.set("/scenarios/" + scenario.id);
    }
  );
};

//========================================================================
export const FactionEditor = {
  oninit: () => {
    refresh();
  },

  view: () => {
    return [
      m(Header),
      m(Nav),
      m("table",
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

      faction.roles() ? m(RoleListEditor, { roles: faction.roles }) : null,
      m("br"),
      m("button", { onclick: save }, "Save")
    ];
  }
};

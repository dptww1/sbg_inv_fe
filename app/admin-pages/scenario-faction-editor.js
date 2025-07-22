import m    from "mithril";
import prop from "mithril/stream";

import { FormField      } from "../components/form-field.js";
import { Header         } from "../header.js";
import { Nav            } from "../nav.js";
import { Request        } from "../request.js";
import { RoleListEditor } from "../admin-components/role-list-editor.js";
import * as U             from "../utils.js";

let scenario = {};
let faction = {
  roles: prop([]),
  suggested_points: prop(0),
  actual_points: prop(0)
};

//========================================================================
const isFormValid = () => {
  if (U.isBlank(faction.roles())) {
    return false;
  }

  if (!faction.roles().every(role => !U.isBlank(role.figures()))) {
    return false;
  }

  return true;
};

//========================================================================
const refresh = () => {
  // Dummy data must exist before Request is made
  scenario = {
    id: m.route.param("sid"),
    scenario_factions: [{}, {}]
  };
  faction = {
    roles: prop([]),
    suggested_points: prop(0),
    actual_points: prop(0)
  };

  const fid = parseInt(m.route.param("fid"), 10);

  if (scenario.id) {
    Request.get("/scenarios/" + scenario.id,
                resp => {
                  scenario = resp.data;
                  faction = scenario.scenario_factions.find(f => f.id === fid);
                  if (faction.roles) {
                    faction.roles.forEach(o => U.propertize(o));
                  }
                  faction.roles = prop(faction.roles);
                  faction.suggested_points = prop(faction.suggested_points);
                  faction.actual_points = prop(faction.actual_points);
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
      faction.roles()[matchInfo[2]][matchInfo[1]] = prop(widget.value);

    } else {
      faction[widget.name] = prop(widget.value);
    }
  }

  faction.roles().forEach((r, idx) => {
    r.sort_order = idx + 1;
    r.scenario_faction_id = faction.id;
    r.name = prop(r.name() || RoleListEditor.computePlaceholder(r));
  });

  Request.put("/scenario-faction/" + faction.id,
    {
      scenario_faction: U.unpropertize(faction)
    },
    () => m.route.set("/scenarios/" + scenario.id));
};

//========================================================================
export const ScenarioFactionEditor = {
  oninit: () => {
    refresh();
  },

  view: () => [
    m(Header),
    m(Nav),
    m(".faction-editor-main-content",
      m(".page-title", `Edit ${scenario.name}: ${faction.sort_order === 1 ? "Good" : "Evil" }`),

      m(".faction-editor-main-content-grid",
        FormField.numeric(faction.suggested_points, "Suggested Points", { size: 5 }),
        FormField.numeric(faction.actual_points, "Actual Points", { size: 5 })),

      faction.roles() ? m(RoleListEditor, { roles: faction.roles }) : null,
      m("br"),
      m("button",
        {
          disabled: !isFormValid(),
          onclick: save
        },
        "Save"))
  ]
};

import m from "mithril";

import { Header }  from "../header.js";
import * as K      from "../constants.js";
import { Nav }     from "../nav.js";
import { Request } from "../request.js";

//========================================================================
let scenario = {};

//========================================================================
const FIELDS = {
  name: () => m("input[type=text][name=name]", { value: scenario.name }),

  blurb: () => m("input[type=text][name=blurb]", { value: scenario.blurb }),

  date_age: () => m("select[name=date_age]",
                    {
                      value: scenario.date_age || 3
                    },
                    m("option[value=3]", 3),
                    m("option[value=2]", 2),
                    m("option[value=1]", 1)),

  date_year: () => m("input[type=text][name=date_year]", { value: scenario.date_year }),

  date_month: () => m("select[name=date_month]", { value: scenario.date_month },
                      m("option[value=0]", "--unknown--"),
                      [...Array(12).keys()].map(n => m("option", { value: n + 1 }, n + 1))),

  date_day: () => m("select[name=date_day]", { value: scenario.date_day },
                    m("option[value=0]", "--unknown--"),
                    [...Array(31).keys()].map(n => m("option", { value: n + 1 }, n + 1))),

  map_width: () => m("input[type=text][name=map_width]", { value: scenario.map_width }),

  map_height: () => m("input[type=text][name=map_height]", { value: scenario.map_height }),

  location: () => m("select[name=location]", { value: scenario.location },
                    Object.keys(K.LOCATIONS).sort().map(k => m("option", { value: k }, K.LOCATIONS[k])))
};

//========================================================================
const domFaction = n => {
  const FACTION_FIELDS = {
    suggested_points: () => m("input[type=text]",
                             {
                               name: "suggested_points" + n,
                               value: scenario.scenario_factions[n].suggested_points || 0
                             }),

    actual_points: () => m("input[type=text]",
                          {
                            name: "actual_points" + n,
                            value: scenario.scenario_factions[n].actual_points || 0
                          })
  };

  return [
    m("h3", "Faction " + (n+1)),
    m("input[type=hidden]",
      { name: "id" + n, value: scenario.scenario_factions[n].id ? scenario.scenario_factions[n].id : ""}),
    m("table",
      Object.entries(FACTION_FIELDS).map(ary => m("tr", m("td", ary[0]), m("td", ary[1](n))))),
    m("input[type=hidden]", { name: "sort_order" + n, value: n + 1 })
  ];
};

//========================================================================
const refresh = () => {
  scenario = {
    size: 0,
    scenario_factions: [{}, {}]
  };

  if (m.route.param("id")) {
    Request.get("/scenarios/" + m.route.param("id"),
                resp => scenario = resp.data
                );
  }
};

//========================================================================
const save = () => {
  let data = {};

  ["select", "input"].forEach(widgetType => {
    const inputs = document.getElementsByTagName(widgetType);
    for (let i = 0; i < inputs.length; ++i) {

      const widget = inputs.item(i);

      const matchInfo = /^(.*)(\d)$/.exec(widget.name);

      if (matchInfo) {
        data["scenario_factions"] = data["scenario_factions"] || [{}, {}];
        data["scenario_factions"][matchInfo[2]][matchInfo[1]] = widget.value;

      } else {
        data[widget.name] = widget.value;
      }
    }
  });

  Request.putOrPost("/scenarios",
                    scenario.id,
                    { scenario: data },
                    resp => m.route.set("/scenarios/" + resp.data.id));
};


//========================================================================
export const ScenarioEdit = {
  oninit: () => {
    refresh();
  },

  view: () => {
    return [
      m(Header),
      m(Nav),
      m("div.main-content",
        m("table",
          Object.entries(FIELDS).map(a => m("tr", m("td", a[0]), m("td", a[1]())))),
        domFaction(0),
        domFaction(1),
        m("input[type=hidden][name=size]", { value: scenario.size }),
        m("button[type=button]", { onclick: save }, "Save"))
    ];
  }
};

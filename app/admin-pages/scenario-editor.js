import m from "mithril";

import { BookFormatResourceEditor } from "../admin-components/book-format-resource-editor.js";
import { FormField                } from "../components/form-field.js";
import { Header                   } from "../header.js";
import * as K                       from "../constants.js";
import { Nav                      } from "../nav.js";
import { Request                  } from "../request.js";
import * as U                       from "../utils.js";

//========================================================================
let scenario = {};

const ageOptions = [ "3", "2", "1" ];

const dayOptions = [ "--unknown--=0" ].concat(
  [...Array(31).keys()].map(k => (k + 1).toString())
);

const locationOptions = Object.keys(K.LOCATIONS)
  .sort()
  .map(k => `${K.LOCATIONS[k]}=${k}`);

const monthOptions = [ "--unknown--=0" ].concat(
  [...Array(12).keys()].map(k => (k + 1).toString())
);

//========================================================================
const getSource = () => {
  return U.getByPath(scenario, "scenario_resources/source/0");
}

//========================================================================
const isFormValid = () => U.isNoneBlank(
  scenario.name(),
  scenario.blurb(),
  scenario.date_age(),
  scenario.date_year(),
  scenario.date_month(),
  scenario.date_day(),
  scenario.map_width(),
  scenario.map_height(),
  scenario.location(),
  getSource())
  && BookFormatResourceEditor.isValid(getSource());

//========================================================================
const refresh = () => {
  scenario = null;

  if (m.route.param("id")) {
    Request.get("/scenarios/" + m.route.param("id"),
      resp => {
        scenario = U.propertize(resp.data);
        U.propertize(getSource());
      })
  } else {
    scenario = U.propertize({
      id: null,
      name: null,
      blurb: null,
      date_age: 3,
      date_year: null,
      date_month: 0,
      date_day: 0,
      map_width: null,
      map_height: null,
      location: "amon_hen",
      size: 0, // required by API even though computed by BE
      scenario_resources: {
        "source": [
          {
            book: null,
            issue: null,
            page: null,
            sort_order: 1,
            resource_type: "source"
          }
        ],
        "video_replay": [],
        "web_replay": [],
        "terrain_building": [],
        "podcast": [],
        "magazine_replay": []
      },
      scenario_factions: [  // required by BE
        {
          suggested_points: 0,
          actual_points: 0,
          sort_order: 1
        },
        {
          suggested_points: 0,
          actual_points: 0,
          sort_order: 2
        }
      ]
    });

    U.propertize(getSource());
  }
};

//========================================================================
const save = () => {
  const rawScenario = U.unpropertize(scenario);
  U.unpropertize(rawScenario.scenario_resources.source[0]);

  Request.putOrPost("/scenarios",
    scenario.id(),
    {
      scenario: rawScenario
    },
    resp => m.route.set("/scenarios/" + resp.data.id));
};


//========================================================================
export const ScenarioEditor = {
  oninit: () => {
    refresh();
  },

  view: () => {
    return [
      m(Header),
      m(Nav),
      m(".main-content",
        m(".page-title", `${U.isBlank(m.route.param("id")) ? "Add" : "Edit"} Scenario`),

        scenario === null
          ? null
          : m(".scenario-editor-form-container",
              FormField.text(scenario.name, "Name"),
              FormField.text(scenario.blurb, "Blurb"),
              FormField.select(scenario.date_age, "Age", { options: ageOptions }),
              FormField.numeric(scenario.date_year, "Year"),
              FormField.select(scenario.date_month, "Month", { options: monthOptions }),
              FormField.select(scenario.date_day, "Day", { options: dayOptions }),
              FormField.numeric(scenario.map_width, "Map Width (inches)"),
              FormField.numeric(scenario.map_height, "Map Height (inches)"),
              FormField.select(scenario.location, "Location", { options: locationOptions }),

              m("label", "Source"),
              m(BookFormatResourceEditor,
                {
                  initialData: getSource(),
                  embedded: true
                }),

              m("button[type=button]",
                {
                  disabled: !isFormValid(),
                  onclick: save
                },
                "Save")))
    ];
  }
};

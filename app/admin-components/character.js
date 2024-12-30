import m from "mithril";

import { Credentials      } from "../credentials.js";
import { FigureListEditor } from "./figure-list-edit.js";
import { Header           } from "../header.js";
import * as K               from "../constants.js";
import { Nav              } from "../nav.js";
import { Request          } from "../request.js";
import { SelectBook       } from "../components/select-book.js";
import { SelectFaction    } from "../components/select-faction.js";
import { Typeahead        } from "../components/typeahead.js";

const character = {
  id: null,
  name: null,
  figure_ids: [],
  resources: [],
  rules: []
};

// Array of {id: x, name: "abc"}
const figures = [];

// The resource currently being edited
const stagingResource = {
  title: "",
  book: "",
  issue: "",
  page: null,
  type: "",
  url: ""
};

// The rule currently being edited
const stagingRule = {
  name_override: "",
  book: "",
  issue: "",
  page: null,
  url: "",
  obsolete: null,
  sort_order: null
};

// When true, character name field acts as lookup of existing
// character; when false, user is adding a new character
var figure_lookup_mode = false;

//========================================================================
const addResource = () => {
  character.resources.push(Object.assign({}, stagingResource)); // shallow copy
  resetStagingResource();
};

//========================================================================
const addRule = () => {
  stagingRule.sort_order = character.rules.length;
  character.rules.push(Object.assign({}, stagingRule));
  resetStagingRule();
};

//========================================================================
const characterSelect = target => {
  if (!target.dataset.id) {
    return;
  }

  Request.get("/character/" + target.dataset.id,
              resp => {
                initCharacterForm();

                character.id = resp.data.id;
                character.name = resp.data.name;
                character.figure_ids = resp.data.figures.map(f => f.id);
                character.resources = resp.data.resources;
                character.rules = resp.data.rules;

                figures.length = 0;
                resp.data.figures.forEach(f => {
                  figures.push({id: f.id, name: f.name });
                });
              });
};

//========================================================================
const domEditCharacter = () => {
  return [
    "Character Name",
    m("br"),
    m("input[name=name][size=50]",
      {
        value: character.name,
        onchange: ev => character.name = ev.target.value
      }
     ),
    m("br"),
    m("br"),

    domFigures(),
    domResources(),
    domProfiles(),

    m("button", { onclick: ev => saveCharacter() }, "Save"),
    " ",
    m("button", { onclick: ev => initCharacterForm() }, "Clear")
  ];
};

//========================================================================
const domFigureLookup = () => {
  return [
    "Character Name",
    m("br"),

    m(Typeahead,
      {
        findMatches: findMatches,
        onItemSelect: characterSelect,
      }),
    m("br")
  ];
};

//========================================================================
const domFigures = () => {
  return [
    "Figures",
    m("br"),
    m(FigureListEditor, { onItemSelect: figureSelect }),

    figures.length !== 0
      ? figures.map((f, idx)  =>
          m(".figure-list-figure",
            {
              id: "fig" + f.id
            },
            m(m.route.Link, { href: "/figures/" + f.id }, f.name),
            m("span.icon",
              {
                onclick: ev => removeFigure(idx)
              },
              K.ICON_STRINGS.remove)
           ))
      : null,

    m("br"),
    m("br"),
  ];
};

//========================================================================
const domProfile = r => {
  const fields = [];

  if (r.url) {
    fields.push([ " ", m("a", { href: r.url }, r.url)]);
  }

  if (r.book) {
    fields.push(" " + K.BOOK_NAMES[r.book]);
  }

  if (r.issue) {
    fields.push(" #" + r.issue);
  }

  if (r.page) {
    fields.push(" p." + r.page);
  }

  if (r.name_override) {
    fields.push(" (" + r.name_override + ")");
  }

  if (r.obsolete) {
    fields.push(" (obsolete)");
  }

  return fields;
};

//========================================================================
const domProfiles = () => {
  return [
    m(".section-header", "Profiles"),

    m("table.rules",
      character.rules.map((rule, idx) =>
        m("tr",
          m("td", domProfile(rule)),
          m("td",
            idx > 0
              ? m("span.icon", { onclick: () => moveRuleUp(idx) }, K.ICON_STRINGS.up)
              : m("span.icon", " "),
            idx < character.rules.length - 1
              ? m("span.icon", { onclick: () => moveRuleDown(idx) }, K.ICON_STRINGS.down)
            : m("span.icon", " "),
            m("span.icon", { onclick: () => character.rules.splice(idx, 1) }, K.ICON_STRINGS.remove))))),

    m("b", "Add New Profile"),
    m("br"),

    m("table",
      m("tr",
        m("td", "Name Override"),
        m("td",
          m("input[type=text][name=name_override][size=40]",
            {
              value: stagingRule.name_override,
              onchange: ev => stagingRule.name_override = ev.target.value
            }))),

      m("tr",
        m("td", "Book"),
        m("td", m(SelectBook,
                  {
                    value: stagingRule.book,
                    callback: value => stagingRule.book = value
                  }))),
            m("tr",
        m("td", "Issue"),
        m("td",
          m("input[type=text][name=rule_issue][size=15]",
            {
              value: stagingRule.issue,
              onchange: ev => stagingRule.issue = ev.target.value
            }))),

      m("tr",
        m("td", "Page"),
        m("td",
          m("input[type=number][name=rule_page][size=5]",
            {
              value: stagingRule.page,
              onchange: ev => stagingRule.page = ev.target.value
            }))),

      m("tr",
        m("td", "URL"),
        m("td",
          m("input[type=text][name=rule_url][size=80]",
            {
              value: stagingRule.url,
              onchange: ev => stagingRule.url = ev.target.value
            }))),

      m("tr",
        m("td", "Obsolete?"),
        m("td",
          m("input[type=checkbox][value=true]",
            {
              checked: stagingRule.obsolete,
              onchange: ev => stagingRule.obsolete = ev.target.checked
            }))),

      m("tr",
        m("td"),
        m("td",
          m("button",
            {
              disabled: !isProfileValid(),
              onclick: ev => addRule()
            },
            "Add Profile"))))
  ];
};

//========================================================================
const domResource = r => {
  const fields = [ m("span.icon", m.trust(K.IMAGE_STRINGS[r.type])) ];

  if (r.url) {
    fields.push([ " ", m("a", { href: r.url }, r.title) ]);
  }

  if (r.book) {
    fields.push(" " + K.BOOK_NAMES[r.book]);
  }

  if (r.issue) {
    fields.push(" #" + r.issue);
  }

  if (r.page) {
    fields.push(" p." + r.page);
  }

  return fields;
};

//========================================================================
const domResources = () => {
  return [
    m(".section-header", "Resources"),

    m("table",
      character.resources.map(
        (rsrc, idx) => {
          return m("tr",
                   m("td",
                     domResource(rsrc)),
                   m("td",
                     m("span.icon",
                       {
                         onclick: () => character.resources.splice(idx, 1)
                       },
                       K.ICON_STRINGS.remove)));
        })),

    m("b", "Add New Resource"),
    m("br"),

    m("table",
      m("tr",
        m("td", "Type "),
        m("td",
          m("select[name=type]",
            {
              value: stagingResource.type,
              onchange: ev => stagingResource.type = ev.target.value
            },
            m("option", { value: "painting_guide", selected: stagingResource.type == "painting_guide" }, "Painting Guide"),
            m("option", { value: "analysis", selected: stagingResource.type == "analysis" }, "Analysis")))),

      m("tr",
        m("td", "Title"),
        m("td",
          m("input[type=text][name=title][size=40]",
            {
              value: stagingResource.title,
              onchange: ev => stagingResource.title = ev.target.value
            }))),

      m("tr",
        m("td", "Book"),
        m("td", m(SelectBook,
                  {
                    value: stagingResource.book,
                    callback: value => stagingResource.book = value
                  }))),

      m("tr",
        m("td", "Issue"),
        m("td",
          m("input[type=text][name=issue][size=15]",
            {
              value: stagingResource.issue,
              onchange: ev => stagingResource.issue = ev.target.value
            }))),

      m("tr",
        m("td", "Page"),
        m("td",
          m("input[type=number][name=page][size=5]",
            {
              value: stagingResource.page,
              onchange: ev => stagingResource.page = ev.target.value
            }))),

      m("tr",
        m("td", "URL"),
        m("td",
          m("input[type=text][name=url][size=80]",
            {
              value: stagingResource.url,
              onchange: ev => stagingResource.url = ev.target.value
            }))),

      m("tr",
        m("td"),
        m("td",
          m("button",
            {
              onclick: ev => addResource()
            },
            "Add Resource")))),

    m("br"),
    m("br"),
  ];
};

//========================================================================
const figureSelect = target => {
  if (!target) {
    return;
  }

  figures.push({ id: target.dataset.id, name: target.dataset.name });
  character.figure_ids = figures.map(f => f.id);
};

//========================================================================
const findMatches = (searchString, typeahead) => {
  Request.get("/search?type=c&q=" + searchString,
              resp => {
                typeahead.suggestions = resp.data.map(x => {
                  x.len = searchString.length;
                  return x;
                });
              }
             );
};

//========================================================================
const initCharacterForm = () => {
  character.id = null;
  character.name = null;
  character.figure_ids = [];
  character.resources = [];
  character.rules = [];

  figures.length = 0;

  figure_lookup_mode = false;

  resetStagingResource();
  resetStagingRule();
};

//========================================================================
const isProfileValid = () => stagingRule.url || (stagingRule.book && stagingRule.page);

//========================================================================
const moveRuleDown = idx => {
  const tmp = character.rules[idx + 1];
  character.rules[idx + 1] = character.rules[idx];
  character.rules[idx] = tmp;

  for (let i = 0; i < character.rules.length; ++i) {
    character.rules[i].sort_order = i;
  }
};

//========================================================================
const moveRuleUp = idx => {
  const tmp = character.rules[idx - 1];
  character.rules[idx - 1] = character.rules[idx];
  character.rules[idx] = tmp;

  for (let i = 0; i < character.rules.length; ++i) {
    character.rules[i].sort_order = i;
  }
};

//========================================================================
const removeFigure = idx => {
  figures.splice(idx, 1);
  character.figure_ids = figures.map(f => f.id);
};

//========================================================================
const resetStagingResource = () => {
  stagingResource.title = "";
  stagingResource.book = "";
  stagingResource.issue = "";
  stagingResource.page = null;
  stagingResource.type = "";
  stagingResource.url = "";
};

//========================================================================
const resetStagingRule = () => {
  stagingRule.name_override = "";
  stagingRule.book = "";
  stagingRule.issue = "";
  stagingRule.page = null;
  stagingRule.url = "";
  stagingRule.obsolete = null;
  stagingRule.sortOrder = null;
};

//========================================================================
const saveCharacter = () => {
  if (!character.name) {
    Request.errors("Name is required");
    return;
  }

  Request.putOrPost(
    "/character",
    character.id,
    { character: character },
    () => {
      Request.messages("Saved " + character.name);
      initCharacterForm();
    });
};

//========================================================================
export const CharacterEdit = {
  oninit: (/*vnode*/) => {
    initCharacterForm();
  },

  view() {
    return [
      m(Header),
      m(Nav),
      m("div.main-content.character-details", [

        m("input[type=checkbox]",
          {
            checked: figure_lookup_mode,
            onclick: ev => figure_lookup_mode = !figure_lookup_mode
          }),
        " Edit Mode",
        m("br"),

        figure_lookup_mode
          ? domFigureLookup()
          : domEditCharacter()
      ])
    ];
  }
};

/*global BOOK_INFO */

import m from "mithril";

import { FigureListEditor } from "../admin-components/figure-list-edit.js";
import { Header           } from "../header.js";
import * as K               from "../constants.js";
import { Nav              } from "../nav.js";
import { Request          } from "../request.js";
import { SelectBook       } from "../components/select-book.js";
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

// The profile currently being edited
const stagingProfile = {
  name_override: "",
  book: null,
  issue: null,
  page: null,
  url: "",
  obsolete: null,
  sort_order: null
};

// The resource currently being edited
const stagingResource = {
  title: "",
  book: null,
  issue: "",
  page: null,
  type: "",
  url: ""
};

// When true, character name field acts as lookup of existing
// character; when false, user is adding a new character
let figure_lookup_mode = false;

//========================================================================
const addResource = () => {
  character.resources.push(Object.assign({}, stagingResource)); // shallow copy
  resetStagingResource();
};

//========================================================================
const addProfile = () => {
  stagingProfile.sort_order = character.rules.length;
  character.rules.push(Object.assign({}, stagingProfile));
  resetStagingProfile();
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

    m("button", { onclick: () => saveCharacter() }, "Save"),
    " ",
    m("button", { onclick: () => initCharacterForm() }, "Clear")
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
    m(FigureListEditor,
      {
        onItemSelect: figureSelect,
        exclusions: character.figure_ids
      }),

    figures.length !== 0
      ? figures.map((f, idx)  =>
          m(".figure-list-figure",
            {
              id: "fig" + f.id
            },
            m(m.route.Link, { href: "/figures/" + f.id }, f.name),
            m("span.action",
              {
                onclick: () => removeFigure(idx)
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
    fields.push(" " + BOOK_INFO.byKey(r.book).name);
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

    m("table.profiles",
      character.rules.map((profile, idx) =>
        m("tr",
          m("td", domProfile(profile)),
          m("td",
            idx > 0
              ? m("span.action", { onclick: () => moveProfileUp(idx) }, K.ICON_STRINGS.up)
              : m("span.icon", " "),
            idx < character.rules.length - 1
              ? m("span.action", { onclick: () => moveProfileDown(idx) }, K.ICON_STRINGS.down)
            : m("span.icon", " "),
            m("span.action", { onclick: () => character.rules.splice(idx, 1) }, K.ICON_STRINGS.remove))))),

    m("b", "Add New Profile"),
    m("br"),

    m("table",
      m("tr",
        m("td", "Name Override"),
        m("td",
          m("input[type=text][name=name_override][size=40]",
            {
              value: stagingProfile.name_override,
              onchange: ev => stagingProfile.name_override = ev.target.value
            }))),

      m("tr",
        m("td", "Book"),
        m("td", m(SelectBook,
                  {
                    value: stagingProfile.book,
                    callback: value => stagingProfile.book = value
                  }))),
            m("tr",
        m("td", "Issue"),
        m("td",
          m("input[type=text][name=profile_issue][size=15]",
            {
              value: stagingProfile.issue,
              onchange: ev => stagingProfile.issue = ev.target.value
            }))),

      m("tr",
        m("td", "Page"),
        m("td",
          m("input[type=number][name=profile_page][size=5]",
            {
              value: stagingProfile.page,
              onchange: ev => stagingProfile.page = ev.target.value
            }))),

      m("tr",
        m("td", "URL"),
        m("td",
          m("input[type=text][name=profile_url][size=80]",
            {
              value: stagingProfile.url,
              onchange: ev => stagingProfile.url = ev.target.value
            }))),

      m("tr",
        m("td", "Obsolete?"),
        m("td",
          m("input[type=checkbox][value=true]",
            {
              checked: stagingProfile.obsolete,
              onchange: ev => stagingProfile.obsolete = ev.target.checked
            }))),

      m("tr",
        m("td"),
        m("td",
          m("button",
            {
              disabled: !isProfileValid(),
              onclick: () => addProfile()
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
    fields.push(" " + BOOK_INFO.byKey(r.book).name);
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
                     m("span.action",
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
              onclick: () => addResource()
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

  figures.push({ id: parseInt(target.dataset.id, 10), name: target.dataset.name });
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
  resetStagingProfile();
};

//========================================================================
const isProfileValid = () => stagingProfile.url || (stagingProfile.book && stagingProfile.page);

//========================================================================
const moveProfileDown = idx => {
  const tmp = character.rules[idx + 1];
  character.rules[idx + 1] = character.rules[idx];
  character.rules[idx] = tmp;

  for (let i = 0; i < character.rules.length; ++i) {
    character.rules[i].sort_order = i;
  }
};

//========================================================================
const moveProfileUp = idx => {
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
const resetStagingProfile = () => {
  stagingProfile.name_override = "";
  stagingProfile.book = null;
  stagingProfile.issue = "";
  stagingProfile.page = null;
  stagingProfile.url = "";
  stagingProfile.obsolete = null;
  stagingProfile.sortOrder = null;
};

//========================================================================
const resetStagingResource = () => {
  stagingResource.title = "";
  stagingResource.book = null;
  stagingResource.issue = "";
  stagingResource.page = null;
  stagingResource.type = "";
  stagingResource.url = "";
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
            onclick: () => figure_lookup_mode = !figure_lookup_mode
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

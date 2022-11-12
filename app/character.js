/* global module, require */

const m = require("mithril");

const Credentials   = require("credentials");
const FiguresEditor = require("admin-components/figure-list-edit");
const Header        = require("header");
const K             = require("constants");
const Nav           = require("nav");
const Request       = require("request");
const SelectBook    = require("components/select-book");
const SelectFaction = require("components/select-faction");
const Typeahead     = require("components/typeahead");

const character = {
  id: null,
  name: null,
  faction: null,
  book: null,
  page: null,
  figure_ids: [],
  resources: []
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

// When true, character name field acts as lookup of existing
// character; when false, user is adding a new character
var figure_lookup_mode = false;

//========================================================================
const addResource = () => {
  character.resources.push(Object.assign({}, stagingResource)); // shallow copy
  resetStagingResource();
};

//========================================================================
const characterSelect = target => {
  if (!target.dataset.id) {
    return null;
  }

  Request.get("/character/" + target.dataset.id,
              resp => {
                initCharacterForm();

                character.id = resp.data.id;
                character.name = resp.data.name;
                character.faction = resp.data.faction;
                character.book = resp.data.book;
                character.page = resp.data.page;
                character.figure_ids = resp.data.figures.map(f => f.id);
                character.resources = resp.data.resources;

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

    "Faction",
    m("br"),
    m(SelectFaction,
      {
        initialValue: character.faction,
        onchange: ev => {
          character.faction = ev.target.value;
          return true;
        }
      }
     ),
    m("br"),
    m("br"),

    m("table",
      m("tr",
        m("td", "Book"),
        m("td", "Page")),
      m("tr",
        m("td",
          m(SelectBook,
            {
              initialValue: character.book,
              onchange: ev => character.book = ev.target.value
            }
           )),
        m("td",
          m("input[name=page][type=number][size=5]",
            {
              value: character.page,
              onchange: ev => character.page = parseInt(ev.target.value, 10)
            }
           )))),
    m("br"),
    m("br"),

    domFigures(),
    m("br"),
    m("br"),

    domResources(),
    m("br"),
    m("br"),

    m("button", { onclick: ev => saveCharacter() }, "Save"),
    " ",
    m("button", { onclick: ev => initCharacterForm() }, "New Character")
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
    m(FiguresEditor,
      {
        onItemSelect: figureSelect
      }
     ),

    figures.length !== 0
      ? figures.map((f, idx)  =>
          m(".figure-list-figure",
            {
              id: "fig" + f.id
            },
            f.name,
            m("span.icon",
              {
                onclick: ev => removeFigure(idx)
              },
              K.ICON_STRINGS.remove)
           ))
      : null,
  ];
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
                     resourceElements(rsrc)),
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
                    onchange: ev => stagingResource.book = ev.target.value
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
  ];
};

//========================================================================
const figureSelect = (target) => {
  if (target === null) {
    debugger;
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
  character.faction = null;
  character.book = null;
  character.page = null;
  character.figure_ids = [];

  figures.length = 0;

  figure_lookup_mode = false;
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
const resourceElements = r => {
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
    });
};

//========================================================================
const CharacterDetailScreen = {
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

module.exports = CharacterDetailScreen;

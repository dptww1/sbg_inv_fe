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
  figure_ids: []
};

// Array of {id: x, name: "abc"}
const figures = [];

// When true, character name field acts as lookup of existing
// character; when false, user is adding a new character
var figure_lookup_mode = false;

//========================================================================
const characterSelect = target => {
  if (!target.dataset.id) {
    debugger;
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

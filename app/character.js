/* global module, require */

const m = require("mithril");

const Credentials   = require("credentials");
const FiguresEditor = require("admin-components/figure-list-edit");
const Header        = require("header");
const K             = require("constants");
const Nav           = require("nav");
const Request       = require("request");
const SelectBook    = require("components/select-book");

const character = {
  id: null,
  name: null,
  book: null,
  page: null,
  figure_ids: []
};

// Array of {id: x, name: "abc"}
const figures = [];

//========================================================================
const initCharacterForm = () => {
  character.id = null;
  character.name = null;
  character.book = null;
  character.page = null;
  character.figure_ids = [];

  figures.length = 0;
};

//========================================================================
const onItemSelect = (target) => {
  if (target === null) {
    return;
  }

  figures.push({ id: target.dataset.id, name: target.dataset.name });
  character.figure_ids = figures.map(f => f.id);
};

//========================================================================
const removeFigure = idx => {
  figures.splice(idx, 1);
  character.figure_ids = figures.map(f => f.id);
};

//========================================================================
const saveCharacter = () => {
  console.log("+++ saving ");
  console.log(JSON.parse(JSON.stringify(character)));

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
      m("div.main-content", [

        "Character Name",
        m("br"),
        m("input[name=name][size=50]",
          {
            value: character.name,
            onchange: ev => character.name = ev.target.value
          }
         ),
        m("br"),

        m("table",
          m("tr",
            m("td", "Book"),
            m("td", "Page")),
          m("tr",
            m("td",
              m(SelectBook,
                {
                  onchange: ev => character.book = parseInt(ev.target.value, 10)
                }
               )),
            m("td",
              m("input[name=page][type=number][size=5]",
                {
                  value: character.page,
                  onchange: ev => character.page = parseInt(ev.target.value, 10)
                }
               ))),
          m("tr",
            m("td",
              m(FiguresEditor,
                {
                  onItemSelect: onItemSelect
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
                        K.ICON_STRINGS.remove))
                  )
                : null,

             ))),

        m("button",
          {
            onclick: ev => saveCharacter()
          },
          "Save"),

        " ",

        m("button",
          {
            onclick: ev => initCharacterForm()
          },
          "New Character")
      ])
    ];
  }
};

module.exports = CharacterDetailScreen;

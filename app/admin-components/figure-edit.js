/* global require module */

const m    = require("mithril");

const Header      = require("header");
const Credentials = require("credentials");
const K           = require("constants");
const Nav         = require("nav");
const Request     = require("request");

let figure = { factions: [], type: "hero" };

//========================================================================
const refresh = () => {
  if (m.route.param("id")) {
    Request.get("/figure/" + m.route.param("id"),
                resp => figure = resp.data
               );
  } else {
    figure = { factions: [], type: "hero" };
  }
};

//========================================================================
const submitFigure = (ev) => {
  if (!figure.name) {
    Request.errors("Name is required!");
    return;
  }

  Request.putOrPost("/figure",
                    figure.id,
                    { figure: figure },
                    () => {
                      Request.messages("Saved " + figure.name);
                      figure = { factions: [], type: "hero" };
                      m.route.set("/figures")
                    });
};

//========================================================================
const updateFactions = ev => {
  if (ev.target.checked) {
    figure.factions.push(ev.target.value);

  } else {
    figure.factions = figure.factions.filter(x => x != ev.target.value);
  }
};

//========================================================================
const FigureEditScreen = {
  oninit: (/*vnode*/) => {
    refresh();
  },

  view: () => {
    if (!Credentials.admin()) {
      return null;
    }

    return [
      m(Header),
      m(Nav),
      m("div.main-content",
        m(".inputForm",
          m(".formTitle", figure.id ? "Edit Figure" : "Create New Figure"),
          m("table",
            m("tr",
              m("td", "Type"),
              m("td", m("select",
                        {
                          onchange: ev => figure.type = ev.target.value,
                          value: figure.type
                        },
                        m("option[value=hero]", "Hero"),
                        m("option[value=warrior]", "Warrior"),
                        m("option[value=monster]", "Monster"),
                        m("option[value=sieger]", "Sieger")))),

            m("tr",
              m("td", "Unique?"),
              m("td", m("input[type=checkbox][name=unique]",
                        {
                          onchange: ev => figure.unique = ev.target.checked,
                          checked: figure.unique
                        }
                       ))),

            m("tr",
              m("td", "Name"),
              m("td", m("input[type=text][name=name][size=40]",
                        {
                          onchange: ev => figure.name = ev.target.value,
                          value: figure.name
                        }
                       ))),

            m("tr",
              m("td", "Plural Name"),
              m("td", m("input[type=text][name=plural_name][size=40]",
                        {
                          onchange: ev => figure.plural_name = ev.target.value,
                          value: figure.plural_name
                        }
                       ))),

            m("tr",
              m("td.valign-top", "Factions"),
              m("td",
                K.SORTED_FACTION_NAMES.map(f => {
                  return [
                    m("input[type=checkbox]",
                      {
                        id: K.FACTION_ABBREV_BY_NAME[f],
                        value: K.FACTION_ABBREV_BY_NAME[f],
                        checked: figure.factions.indexOf(K.FACTION_ABBREV_BY_NAME[f]) >= 0,
                        onchange: updateFactions
                      }),
                    m("label", { for: K.FACTION_ABBREV_BY_NAME[f] }, f),
                    m("br")
                  ]
                }))),

            m("tr",
              m("td"),
              m("td", m("button", { onclick: submitFigure }, "Submit")))
           )))
    ];
  }
};

module.exports = FigureEditScreen;

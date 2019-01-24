/* global require module */

const m    = require("mithril");
const prop = require("mithril/stream");

const Header      = require("header");
const Credentials = require("credentials");
const K           = require("constants");
const Nav         = require("nav");
const Request     = require("request");

const formFieldName       = prop("");
const formFieldPluralName = prop("");
const formFieldType       = prop(0);
const formFieldUnique     = prop(false);
const formFieldFactions   = prop([]);

//========================================================================
const assembleMultiSelectValues = (setterFn) => (ev) => {
    const opts = ev.target.options;
    let ary = [];

    for (let i = 0; i < opts.length; ++i) {  // the DOM API *sigh*
        const opt = opts.item(i);
        if (opt.selected) {
            ary.push(opt.value);
        }
    }

    setterFn(ary);
};

//========================================================================
const submitNewFigureForm = (ev) => {
    if (!formFieldName()) {
        alert("Name is required!");
        return;
    }

    Request.post("/figure",
                 {
                   figure: {
                     name: formFieldName(),
                     plural_name: formFieldPluralName,
                     type: formFieldType,
                     unique: formFieldUnique,
                     factions: formFieldFactions
                   }
                 },
                 () => {
                   Request.messages("Saved " + formFieldName());
                   formFieldName("");
                   formFieldPluralName("");
                   formFieldType(0);
                   formFieldUnique(false);
                   formFieldFactions([]);
                 });
};

//========================================================================
const FigureEditScreen = {
  view: () => {
    if (!Credentials.admin()) {
      return null;
    }

    return [
      m(Header),
      m(Nav),
      m("div.main-content",
        m(".inputForm",
          m(".formTitle", "Create New Figure"),
          m("table",
            m("tr",
              m("td", "Type"),
              m("td", m("select", { onchange: m.withAttr("selectedIndex", formFieldType) },
                        m("option[value=0]", "Hero"),
                        m("option[value=1]", "Warrior"),
                        m("option[value=2]", "Monster"),
                        m("option[value=3]", "Sieger")))),

            m("tr",
              m("td", "Unique?"),
              m("td", m("input[type=checkbox][name=unique][value=true]", { onchange: m.withAttr("checked", formFieldUnique) } ))),

            m("tr",
              m("td", "Name"),
              m("td", m("input[type=text][name=name][size=40]", { onchange: m.withAttr("value", formFieldName) } ))),

            m("tr",
              m("td", "Plural Name"),
              m("td", m("input[type=text][name=plural_name][size=40]", { onchange: m.withAttr("value", formFieldPluralName) } ))),

            m("tr",
              m("td", "Factions"),
              m("td", m("select[multiple=true]", { onchange: assembleMultiSelectValues(formFieldFactions) },
                        Object.keys(K.FACTION_INFO)
                        .map(f => m("option", { value: f }, K.FACTION_INFO[f].name))))),

            m("tr",
              m("td"),
              m("td", m("button", { onclick: submitNewFigureForm }, "Submit")))
           )))
    ];
  }
};

module.exports = FigureEditScreen;

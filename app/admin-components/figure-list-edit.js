/* global module require */

const m = require("mithril");

const Request   = require("request");
const Typeahead = require("components/typeahead");

//========================================================================
const findMatches = (searchString, typeahead) => {
  Request.get("/search?type=f&q=" + searchString,
              resp => {
                typeahead.suggestions = resp.data.map(x => {
                  x.len = searchString.length;
                  return x;
                });
              });
}

//========================================================================
// Usage: m(FigureListEditor, {opts})
// Options:
//   - onItemSelect
//       callback; same interface as Typeahead component's `onItemSelect`
//------------------------------------------------------------------------
const FigureListEditor = {
  view: ({ attrs }) =>
    m(".form-container figure-list-edit-row",
      m(Typeahead, {
        placeholder: "Figure name",
        findMatches: findMatches,
        onItemSelect: attrs.onItemSelect
      }))
};

module.exports = FigureListEditor;

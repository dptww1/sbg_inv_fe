import m from "mithril";

import { Request   } from "../request.js";
import { Typeahead } from "../components/typeahead.js";

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
export const FigureListEditor = {
  view: ({ attrs }) =>
    m(".form-container figure-list-edit-row",
      m(Typeahead, {
        placeholder: "Figure name",
        findMatches: findMatches,
        onItemSelect: attrs.onItemSelect
      }))
};

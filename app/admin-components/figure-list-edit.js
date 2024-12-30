import m from "mithril";

import { Request   } from "../request.js";
import { Typeahead } from "../components/typeahead.js";

let exclusions = null;

//========================================================================
const findMatches = (searchString, typeahead) => {
  Request.get("/search?type=f&q=" + searchString,
              resp => {
                typeahead.suggestions = resp.data
                  .filter(elt => !exclusions || !exclusions.includes(elt.id))
                  .map(x => {
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
//   - exclusions:
//       array of figure IDs
//------------------------------------------------------------------------
export const FigureListEditor = {
  view: ({ attrs }) => {
    exclusions = attrs.exclusions;

    return m(".form-container figure-list-edit-row",
      m(Typeahead, {
        placeholder: "Figure name",
        findMatches: findMatches,
        onItemSelect: attrs.onItemSelect
      }));
  }
};

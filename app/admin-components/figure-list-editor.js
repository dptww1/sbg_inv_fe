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
/**
 * Mithril component for editing a list of figures, providing a typeahead
 * to make assigning figures easy.
 *
 * @component
 *
 * @vattr {function({target:Object})} onItemSelect - callback when a figure
 *     is selected, with the parameter being a DOM object containing the
 *     selected figure's info. See {@link Typeahead} for the details.
 * @vattr {?number[]} exclusions - array of figure IDs to filter out from
 *     the typeahead, presumably because they've already been selected.
 *
 * @todo shouldn't use DOM in the callback
 */
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

/*global BOOK_INFO */

import m from "mithril";

import * as U from "../utils.js";

/**
 * Mithril component showing an alphabetized dropdown list of books.
 *
 * @component
 *
 * @vattr {function(bookKey)} callback - function called when the selected
 *     book changes; note that the callback parameter is a book `key`
 *     rather than an `id`.
 * @vattr {?string} value - key which should be used as the currently-selected book
 */
export const SelectBook = () => {

  const alphaSortedBooks =
      BOOK_INFO.all().sort((a, b) => U.strCmp(a.name, b.name));

  return {
    view: vnode =>
      m("select[name=book]",
        {
          value: vnode.attrs.value,
          onchange: ev => vnode.attrs.callback(ev.target.value)
        },
        alphaSortedBooks
          .map(book =>
            m("option",
              {
                value: book.key
              },
              book.name)))
  };
};

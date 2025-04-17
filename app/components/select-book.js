/*global BOOK_INFO */

import m from "mithril";

import * as U from "../utils.js";

//========================================================================
// m(SelectBook, { value: <currentValue>, callback: fn(newValue) })
//------------------------------------------------------------------------
export const SelectBook = () => {

  const alphaSortedBooks =
      BOOK_INFO.all().sort((a, b) => U.strCmp(a.name, b.name));

  return {
    view: vnode =>
      m("select[name=book]",
        {
          value: vnode.attrs.value,
          onchange: ev => {
            vnode.attrs.callback(ev.target.value);
          }
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

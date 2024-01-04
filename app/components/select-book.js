import m from "mithril";

import * as K from "../constants.js";
import * as U from "../utils.js";

//========================================================================
export const SelectBook = ({ attrs: { onchange: callbackFn, initialValue } }) => {

  var selectedValue = initialValue;

  return {
    view: (/*vnode*/) =>
      m("select[name=book]",
        {
          value: selectedValue,
          onchange: ev => {
            selectedValue = ev.target.value;
            callbackFn(ev);
          }
        },
        K.BOOKS
          .sort((a, b) => U.strCmp(a.name, b.name))
          .map(book =>
            m("option",
              {
                value: book.key
              },
              book.name)))
  };
};

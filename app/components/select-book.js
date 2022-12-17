/* global module require */

const m = require("mithril");

const K = require("constants");
const U = require("utils");

//========================================================================
const SelectBook = ({ attrs: { onchange: callbackFn, initialValue } }) => {

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
  }
}

module.exports = SelectBook;

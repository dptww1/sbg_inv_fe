/* global module require */

const m = require("mithril")

const K = require("constants")
const U = require("utils")

//========================================================================
const SelectBook = ({ attrs: { onchange: callbackFn } }) => {

  return {
    view: (/*vnode*/) =>
      m("select[name=book]",
        {
          onchange: ev => callbackFn(ev)
        },
        K.BOOKS
          .sort((a, b) => U.strCmp(a.name, b.name))
          .map((book) => m("option", { value: book.index }, book.name)))
  }
}

module.exports = SelectBook;

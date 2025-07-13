import m from "mithril";
import prop from "mithril/stream";

import { FormField  } from "../components/form-field.js";
import { SelectBook } from "../components/select-book.js";
import * as U         from "../utils.js";

export const BookResourceEditor = (idxProp, commitFn) => {
  const resource = {
    book:  prop(), // key, not id
    issue: prop(),
    page:  prop()
  };

  return {
    view: () => {
      console.log("BOOKRESOURCEEDITOR!", idxProp, "RSRC.book()", resource.book());

      return m(".book-resource-editor-form",
        m("span", "Book"),
        m(SelectBook, { value: resource.book(), callback: val => resource.book(val) }),

        FormField.text(resource.issue, "Issue"),

        FormField.text(resource.page, "Page"),

        m("span", ""),
        m("button",
          {
            onclick: () => {
              commitFn(U.unpropertize(resource));
              U.emptyOutObject(resource)
            }
          },
          "Add Source"))
    }
  }
};

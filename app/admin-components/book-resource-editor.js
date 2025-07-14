import m from "mithril";
import prop from "mithril/stream";

import { FormField  } from "../components/form-field.js";
import { SelectBook } from "../components/select-book.js";
import * as U         from "../utils.js";

/**
 * Mithril component for handling creating & editing of Book resources.
 *
 * Required vnode attributes:
 *   - commitFn({ book: <string>, issue: <string>, page: <string> }) called when user submits the form.
 *       The parameter will be `null` if the user cancels.
 *
 * Optional vnode attributes:
 *   - initData value is object with optional `book`, `issue`, and `page` keys, which are the initial
 *       values of those fields in the form.
 *
 * TODO: handle sort_order, id attributes?
 */
export const BookResourceEditor = () => {
  let resource = {
    book:  prop(), // key, not id
    issue: prop(),
    page:  prop()
  };

  let editMode = false;

  //========================================================================
  const isFormValid = () => !U.isBlank(resource.book()) && !U.isBlank(resource.page());

  //========================================================================
  return {
    oninit: vnode => {
      const initData = vnode.attrs.initialData;
      if (initData) {
        resource.book(initData.book);
        resource.issue(initData.issue);
        resource.page(initData.page);

        editMode = true;
      }
    },

    view: vnode => m(".book-resource-editor-form",
      m("span", "Book"),
      m(SelectBook, { value: resource.book(), callback: val => resource.book(val) }),

      FormField.text(resource.issue, "Issue"),

      FormField.text(resource.page, "Page"),

      m("span", ""),
      m("span.button-bar",
        m("button",
          {
            disabled: !isFormValid(),
            onclick: () => {
              vnode.attrs.commitFn(U.unpropertize(resource));
              U.emptyOutObject(resource)
            }
          },
          editMode ? "Save" : "Add"),
        editMode
          ? m("button",
              {
                onclick: () => vnode.attrs.commitFn(null)
              },
              "Cancel")
          : null))
  }
};

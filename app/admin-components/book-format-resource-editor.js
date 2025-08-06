import m from "mithril";
import prop from "mithril/stream";

import { FormField  } from "../components/form-field.js";
import { SelectBook } from "../components/select-book.js";
import * as U         from "../utils.js";

/**
 * Mithril component for handling creating & editing of Book resources.
 *
 * Optional vnode attributes:
 *   - commitFn({ book: <string>, issue: <string>, page: <string> }) called when user submits the form.
 *       The parameter will be `null` if the user cancels.  Must be provided unless `embedded: true`,
 *       in which case this parameter is ignored.
 *   - embedded if `true`, buttons are disabled and the caller's fields are edited directly
 *   - initialData value is object with optional `book`, `issue`, and `page` keys, which are the initial
 *       values of those fields in the form.  If `embedded: true`, those fields are assumed to be
 *       `prop()`s, otherwise they are assumed *not* to be `prop()`s.
 *
 * TODO: handle sort_order, id attributes?
 */
export const BookFormatResourceEditor = () => {
  const PARAMS = [ "book", "issue", "prop" ];
  let resource = {
    book:  prop(), // key, not id
    issue: prop(),
    page:  prop()
  };

  let editMode = false;

  //========================================================================
  return {
    oninit: vnode => {
      if (vnode.attrs.embedded) {
        // If resource is embedded, we assume the client code is
        // already using prop() for the attributes
        resource = vnode.attrs.initialData;

      } else {
        const initData = vnode.attrs.initialData;
        if (initData) {
          // If not embedded and initial data is provided, assume
          // that data is *not* props, and slurp it into our local
          // shadow buffer for editing.
          PARAMS.forEach(p => resource[p] = prop(initData[p]));
          editMode = true;

        } else {
          // Not embedded and no initial data provided; set up resource
          PARAMS.forEach(p => resource[p] = prop());
        }
      }
    },

    view: vnode => {
      const formFields = [
        m("label", "Book"),
        m(SelectBook, { value: resource.book(), callback: val => resource.book(val) }),

        FormField.text(resource.issue, "Issue"),

        FormField.text(resource.page, "Page"),

        vnode.attrs.embedded || vnode.attrs.fieldsOnly
          ? null
          : [
            m("span", ""),
            m("span.button-bar",
              m("button",
                {
                  disabled: !BookFormatResourceEditor.isValid(resource),
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
                : null)
          ]
      ];

      return vnode.attrs.fieldsOnly
        ? formFields
        : m(".book-resource-editor-form", formFields);
    }
  }
};

//========================================================================
BookFormatResourceEditor.isValid = resource =>
  U.isNotBlank(U.getByPath(resource, "book"))
    && U.isNotBlank(U.getByPath(resource, "page"));

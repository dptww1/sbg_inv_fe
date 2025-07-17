import m from "mithril";

import * as K from "../constants.js";

/**
 * Mithril component to manage an sortable list of items.
 *
 * Caller is responsible for styling of the CSS columns, which
 * are contained within a `sortable-list-container` element:
 *   - `sortable-list-edit`
 *   - `sortable-list-up-arrow`
 *   - `sortable-list-down-arrow`
 *   - `sortable-list-delete`
 *
 * Required vnode attributes:
 *   - itemsProp a Mithril stream containing the array of items to manage
 *   - renderFn(elt, idx) function returning a Mithril-renderable object for the
 *       item `elt` at `idx` within `itemsProp`
 *
 * Optional vnode attributes:
 *   - editFn(idx) callback notifying client code to edit element at `idx` of `itemsProp`.
 *       The edit icon is only shown if this attribute is provided.
 *   - suppressControls if `true`, the edit/move/delete controls are not rendered
 */
export const SortableList = () => {

  //========================================================================
  const moveDown = (prop, idx) => {
    let tmp = prop()[idx + 1];
    prop()[idx + 1] = prop()[idx];
    prop()[idx] = tmp;

    prop()[idx + 1].sort_order += 1;
    prop()[idx].sort_order -= 1;
  };

  //========================================================================
  const moveUp = (prop, idx) => {
    const tmp = prop()[idx - 1];
    prop()[idx - 1] = prop()[idx];
    prop()[idx] = tmp;

    prop()[idx - 1].sort_order -= 1;
    prop()[idx].sort_order += 1;
  };

  //========================================================================
  const toArray = (obj) => Array.isArray(obj) ? obj : [ obj ];

  //========================================================================
  return {
    view: vnode => {
      const { itemsProp, editFn, renderFn, suppressControls } = vnode.attrs;

      return m(".sortable-list",
        m(".sortable-list-container",
          itemsProp().map((elt, i) => {
            let clientItems = toArray(renderFn(elt, i));

            if (suppressControls) {
              return clientItems;
            }

            return clientItems.concat(
              [
                editFn
                  ? m(".sortable-list-edit.action",
                    {
                      onclick: () => editFn(i)
                    },
                    K.ICON_STRINGS.edit)
                  : null,

                m(".sortable-list-up-arrow.action",
                  {
                    onclick: () => moveUp(itemsProp, i)
                  },
                  i > 0 ? K.ICON_STRINGS.up : ""),

                m(".sortable-list-down-arrow.action",
                  {
                    onclick: () => moveDown(itemsProp, i)
                  },
                  i < (itemsProp().length - 1) ? K.ICON_STRINGS.down : ""),

                m(".sortable-list-delete.action",
                  {
                    onclick: () => itemsProp().splice(i, 1)
                  },
                  K.ICON_STRINGS.remove)
              ])
          })))
    }
  }
};

import m from "mithril";

import * as K from "../constants.js";

/**
 * Mithril component to manage an ordered list of items.
 *
 * Caller is responsible for styling of the CSS columns, which
 * are contained within a <code>sorted-list-container</code> element:
 * <ul>
 *   <li><code>sorted-list-edit</code></li>
 *   <li><code>sorted-list-up-arrow</code></li>
 *   <li><code>sorted-list-down-arrow</code></li>
 *   <li><code>sorted-list-delete</code></li>
 * </ul>
 *
 * @callback sortedListRenderFn
 * @param elt item that caller should render; caller should set CSS style to <code>grid-column-start: 1</code>
 * @returns a Mithril-renderable object, or an array of such objects
 *
 * @callback sortedListEditFn
 * @param i {integer} index of the item use wants to edit
 *
 * @param {Mithril stream} itemsProp property containing the array of items to manage
 * @param {sortedListRenderFn} renderFn
 *
 * @returns Mithril component
 */
export const SortedList = (itemsProp, renderFn, editFn) => {

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
    view: () => m(".sorted-list",
      m(".sorted-list-container",
        itemsProp().map((elt, i) =>
          toArray(renderFn(elt)).concat(
            [
              editFn
              ? m(".sorted-list-edit.action",
                  {
                    onclick: () => editFn(i)
                  },
                  K.ICON_STRINGS.edit)
              : null,

              m(".sorted-list-up-arrow.action",
                {
                  onclick: () => moveUp(itemsProp, i)
                },
                i > 0 ? K.ICON_STRINGS.up : ""),

              m(".sorted-list-down-arrow.action",
                {
                  onclick: () => moveDown(itemsProp, i)
                },
                i < (itemsProp().length - 1) ? K.ICON_STRINGS.down : ""),

              m(".sorted-list-delete.action",
                {
                  onclick: () => itemsProp().splice(i, 1)
                },
                K.ICON_STRINGS.remove)
            ]))))
  }
};

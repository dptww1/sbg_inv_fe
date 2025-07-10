import m from "mithril";

import * as K from "../constants.js";

export const SortedList = (itemsProp, renderFn) => {

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
  return {
    view: () => m(".sorted-list",
                  m(".sorted-list-container",
                    itemsProp().map((elt, i) => [
                      m(".sorted-list-row-content", renderFn(elt)),

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
                    ])))
  }
};

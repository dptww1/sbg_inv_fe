import m from "mithril";

import * as K from "../constants.js";
import * as U from "../utils.js";

//========================================================================
// m(SelectFaction, { value: <currentValue>, callback: fn(newValue) })
//------------------------------------------------------------------------
export const SelectFaction = () => {

  return {
    view: vnode =>
      m("select[name=faction]",
        {
          value: vnode.attrs.value,
          onchange: ev => {
            vnode.attrs.callback(ev.target.value);
          }
        },
        K.SORTED_FACTION_NAMES
        .map(name =>
          m("option",
            {
              value: K.FACTION_ABBREV_BY_NAME[name]
            },
            name)))
  };
};

/*global FACTION_INFO */

import m from "mithril";

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
        FACTION_INFO.sortedFactionNames()
        .map(name =>
          m("option",
            {
              value: FACTION_INFO.byName(name).abbrev
            },
            name)))
  };
};

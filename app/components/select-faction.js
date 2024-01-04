import m from "mithril";

import * as K from "../constants.js";
import * as U from "../utils.js";

//========================================================================
export const SelectFaction = ({ attrs: { onchange: callbackFn, initialValue } }) => {

  var selectedValue = initialValue;


  return {
    view: (/*vnode*/) =>
      m("select[name=faction]",
        {
          value: selectedValue,
          onchange: ev => {
            selectedValue = ev.target.value;
            callbackFn(ev);
          }
        },
        Object.keys(K.FACTION_INFO)
          .sort((a, b) => U.strCmp(K.FACTION_INFO[a].name, K.FACTION_INFO[b].name))
          .map(key =>
            m("option",
              {
                value: key
              },
              K.FACTION_INFO[key].name)))
  };
};

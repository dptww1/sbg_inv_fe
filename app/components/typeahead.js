/* global module require */

const m = require("mithril");

let attrs;

var data = { suggestions: [] };
var selectedIdx = -1;

//========================================================================
const decorateName = (s, pos, len) => [
  s.substring(0, pos),
  m("span[class='highlight']", s.substring(pos, pos + len)),
  s.substring(pos + len)
];

//========================================================================
const initData = () => {
  data = { suggestions: [] };
  selectedIdx = -1;
};

//========================================================================
const selectSuggestion = target => {
  target.closest("div.typeahead-container").getElementsByTagName("input")[0].value = "";
  initData();
  attrs.onItemSelect(target);
};

//========================================================================
const suggestionAttrs = (s, idx) => {
  return Object.assign(
    {
      className: idx === selectedIdx ? "selected" : "",
      onclick: ev => selectSuggestion(ev.target)
    },
    Object.keys(s).reduce(
      (acc, val) => {
        acc["data-" + val] = (s[val] + "").replace(/"/g, '\\"');
        return acc;
      },
      {})
  );
};

//========================================================================
const handleKey = (ev) => {
  switch (ev.which) {
  case 13: // enter
    if (selectedIdx >= 0) {
      selectSuggestion(ev.target.closest(".typeahead-container").getElementsByClassName("suggestion")[selectedIdx]);
    }
    ev.preventDefault();
    break;

  case 27: // esc
    initData();
    ev.preventDefault();
    break;

  case 38: // up
    selectedIdx = Math.max(0, selectedIdx - 1);
    ev.preventDefault();
    break;

  case 40: // down
    selectedIdx = Math.min(selectedIdx + 1, data.suggestions.length - 1);
    ev.preventDefault();
    break;
  }

  if (ev.target.value === "") {
    initData();
  } else {
    attrs.findMatches(ev.target.value, data);
  }
};

//========================================================================
const Typeahead = {
  oninit: (vnode) => {
    attrs = vnode.attrs;
    initData();
  },

  view: ({ attrs }) => {
    return m('.typeahead-container',
             m('input[type=search]',
               {
                 oncreate: vnode => vnode.dom.focus(),
                 placeholder: attrs.placeholder || 'Search...',
                 onkeyup: handleKey
               }),
             data.suggestions.length == 0
             ? null
             : m(".suggestions",
                 m("ul", data.suggestions.map((s, idx) => m("li.suggestion",
                                                            suggestionAttrs(s, idx),
                                                            decorateName(s.name, s.start, s.len))))));
  }
};

module.exports = Typeahead;

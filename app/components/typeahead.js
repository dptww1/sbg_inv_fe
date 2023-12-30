import m from "mithril";

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

  // If the user clicks on the highlighted portion of the suggestion, the target is
  // different than if they click the unhighlighted portion. Don't make the client deal
  // with that. Instead just pretend it's always the unhighlighted portion which is clicked.
  if (target.className === "highlight") {
    target = target.parentElement;
  }

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

  case 27: // esc: cancel search
    initData();
    attrs.onItemSelect(null);
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
// Usage: m(Typeahead, {opts})
// Options:
//   - onItemSelect (function(target))
//       Callback when user selects a choice. `target` will be the selected
//       DOM element, with `data-x` attribute for each field returned by the
//       `findMatches` callback.  For example, if `findMatches` populates
//       the suggestions array with `{id: 12, name:"abc"}` and the user
//       selects that choice, then `target.dataset.id === 12` and
//       `target.dataset.name === "abc"`.
//       If the user cancels the search, `target` == `null`.
//
//   - placeholder (string)
//       Optional placeholder text for the input widget
//
//   - findMatches (function(searchString, data)
//       callback function to get suggestions with parameters:
//         - searchString: string to search for
//         - data: object of form { suggestions: [] }; `findMatches` should
//             populate the `suggestions` array with objects with at least
//             the following fields:
//               . name  - text to show
//               . start - 0-based starting position of the match of `searchString` within `name`
//               . len   - length of `searchString`
//------------------------------------------------------------------------
export const Typeahead = {
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

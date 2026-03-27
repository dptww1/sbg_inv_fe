import m from "mithril";

import * as K          from "../constants.js";
import { Credentials } from "../credentials.js";

/**
 * Mithril component for text which can be edited.
 *
 * @component
 *
 * @vattr {string} text - the text to show
 * @vattr {function(newText:string)} commit - callback when editing is complete
 *
 * @example
 *   const model = { text: "Example text" };
 *   m(EditableText, { text: model.text, commit: newText => model.text = newText });
 *
 * @todo should probably use a Mithril stream as parameter, move to FormField?
 */
export const EditableText = () => {

  let commitFn;
  let editMode;
  let originalText;
  let text;

  //========================================================================
  const domEditMode = () => [
    m("textarea",
      {
        value: text,
        oncreate: vnode => setHeight(vnode.dom),
        onkeyup: ev => {
          text = ev.target.value;
          setHeight(ev.target);
        }
      }),
    m("br"),
    m("button",
      {
        onclick: () => {
          text = originalText;
          editMode = false;
        }
      },
      "Cancel"),
    " ",
    m("button",
      {
        onclick: () => {
          commitFn(text);
          editMode = false;
        }
      },
      "Save")
  ];

  //========================================================================
  const domTextMode = () =>
        text
        ? [
            Credentials.isAdmin()
              ? m("span.action", { onclick: () => editMode = true }, K.ICON_STRINGS.edit)
              : null,
            m.trust(text)
          ]
        : null;

  //========================================================================
  const setHeight = elt => {
    elt.style.height = "1px";
    elt.style.height = elt.scrollHeight + "px";
  }

  //========================================================================
  return {
    oninit: ({ attrs: createAttrs }) => {
      editMode = false;
      commitFn = createAttrs.commit;
      originalText = createAttrs.text;
      text = createAttrs.text;
    },

    view: () => m(".editable-text-container", editMode ? domEditMode() : domTextMode())
  };
};

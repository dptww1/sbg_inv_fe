import m from "mithril";

import * as K          from "../constants.js";
import { Credentials } from "../credentials.js";

/**
 * @module admin-components/editable-text
 *
 * @example
 * const model = { text: "Example text" };
 * m(EditableText, { text: model.text, commit: newText => model.text = newText });
 */
export const EditableText = ({ attrs: createAttrs }) => {

  const commitFn = createAttrs.commit;

  let editMode = false;
  let originalText = createAttrs.text;
  let text = createAttrs.text;

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
    view: () => m(".editable-text-container", editMode ? domEditMode() : domTextMode())
  };
};

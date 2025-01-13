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
    m("textarea[style='width:85vw;height=fit-content']",
      {
        value: text,
        onkeyup: ev => {
          text = ev.target.value;
          ev.target.style.height = "1px";
          ev.target.style.height = ev.target.scrollHeight + "px";
        },
        overflow: "hidden"
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
              ? m("span.action.editable-text", { onclick: () => editMode = true }, K.ICON_STRINGS.edit)
              : null,
            m.trust(text)
          ]
        : null;

  //========================================================================
  return {
    view() {
      return editMode ? domEditMode() : domTextMode();
    }
  };
};

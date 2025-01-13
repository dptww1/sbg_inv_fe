import m from "mithril";

/**
 * @module components/text-area
 *
 * @example
 * m(TextArea, { editMode: BOOLEAN_PROP, bodyTextProp: STRING_PROP, onSave: () => PERSIST_METHOD })
 */
export const TextArea = ({ attrs: createAttrs }) => {

  const editModeProp = createAttrs.editMode;
  const bodyTextProp = createAttrs.prop;
  const onSave = createAttrs.onSave;

  let originalBodyText = null;

  return {
    view() {
      if (!originalBodyText && bodyTextProp()) {
        originalBodyText = bodyTextProp();
      }

      return editModeProp()
        ? [
            m("textarea[style='width:85vw;height=fit-content']",
              {
                value: bodyTextProp(),
                onkeyup: ev => {
                  bodyTextProp(ev.target.value);
                  ev.target.style.height = "1px";
                  ev.target.style.height = ev.target.scrollHeight + "px";
                },
                overflow: "hidden"
              }),
            m("br"),
            m("button",
              {
                onclick: () => {
                  bodyTextProp(originalBodyText);
                  editModeProp(false);
                }
              },
              "Cancel"),
            " ",
            m("button",
              {
                onclick: () => {
                  onSave();
                  editModeProp(false);
                }
              },
              "Save")
          ]
        : m("div", m.trust(bodyTextProp()));
    }
  };
};

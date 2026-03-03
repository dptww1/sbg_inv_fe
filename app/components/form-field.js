import m from "mithril";

import * as U from "../utils.js";

//========================================================================
const convertTo = (valType, val) => valType === "integer" ? parseInt(val, 10) : val;

//========================================================================
const copyAttributes = (destObj, srcObj, ...attrs) => {
  if (attrs) {
    attrs.forEach(attr => {
      if (attr in srcObj) {
        destObj[attr] = srcObj[attr];
      }
    })
  }
}

//========================================================================
const labelToId = label => U.isBlank(label)
  ? crypto.randomUUID()
  : label.replaceAll(/\s+/g, "-").toLowerCase();

//========================================================================
export const FormField = {

  //========================================================================
  checkbox: (prop, label, configProps = {}) => {
    const fieldId = configProps["id"] || labelToId(label);
    return [
      m(`label[for=${fieldId}]`, label),
      m(`input[type=checkbox][id=${fieldId}]`,
      {
        onchange: ev => prop(ev.target.checked),
        checked: prop()
      })
    ]
  },

  //========================================================================
  hidden: (prop, name) => {
    return m("input[type=hidden]",
      {
        name: name,
        value: prop()
      });
  },

  //========================================================================
  numeric: (prop, label, configProps = {}) => {
    if (configProps.readOnly) {
      return m(".form-field-numeric-wrapper", prop());
    }

    const fieldId = configProps["id"] || labelToId(label);
    const attrs = {
      onchange: ev => prop(ev.target.value),
      value: prop()
    };

    copyAttributes(attrs, configProps, "max", "min", "name", "size");

    return [
      U.isBlank(label) ? null : m(`label[for=${fieldId}`, label),
      m(".form-field-numeric-wrapper",
        m(`input[type=number][id=${fieldId}]`, attrs))
    ]
  },

  //========================================================================
  select: (prop, label, configProps = {}) => {
    const fieldId = configProps["id"] || labelToId(label);
    return [
      m(`label[for=${fieldId}]`, label),
      m(`select[id=${fieldId}]`,
        {
          onchange: ev => prop(convertTo(configProps["valueType"], ev.target.value)),
        },
        (configProps["options"] || []).map(o => {
          const [optLabel, val] = o.includes("=") ? o.split(/\s*=\s*/) : [o, o];
          return m(`option[value=${val}]`,
            {
              selected: String(prop()) === val
            },
            optLabel)
        }))
    ]
  },

  /**========================================================================
   * Renders a text input with the given optional `label`.
   *
   * prop: Mithril stream with the current value of the text input, updated as the user interacts with the widget
   * configProps: optional object with any/all of the following fields
   *   - fieldNote:
   *   - id: used as id for the text widget
   *   - placeholder: used as widget placeholder or content if `readOnly` is `true` and `prop()` is empty
   *   - readOnly: if `true`, no widget is rendered, only the `prop` value (or `placeholder` if none)
   *   - size: width in characters of the widget (60 default)
   *------------------------------------------------------------------------*/
  text: (prop, label, configProps = {}) => {
    if (configProps.readOnly) {
      const content = prop() || configProps.placeholder || '';
      return m(".form-field-text-wrapper", content);
    }

    const fieldId = configProps["id"] || labelToId(label);
    const attrs = {
      onkeyup: ev => prop(ev.target.value),
      size: 60,
      value: prop()
    };

    copyAttributes(attrs, configProps, "placeholder", "size");

    return [
      U.isBlank(label) ? null : m(`label[for=${fieldId}]`, label),
      m(".form-field-text-wrapper",
        configProps["fieldNote"] ? m(`.field-note ${fieldId}-field-note`, configProps["fieldNote"]) : null,
        m(`input[type=text][id=${fieldId}]`, attrs))
    ];
  }
};

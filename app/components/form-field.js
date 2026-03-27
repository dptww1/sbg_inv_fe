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
/**
 * Namespace for HTML form field management.  Methods generally take the
 * following parameters:
 *
 * - `prop` - a Mithril steam giving the widget's initial value; this stream
 *     is updated as the user interacts with the widget
 * - `label` - text to display next to the widget, linked to the widget
 *     so the user can click the label to activate the widget
 * - `configProps` - an optional Object with widget-specific configuration.
 *     All widgets accept an `id`-keyed value here which is used as the
 *     HTML `id` attribute; if not provided, an id is generated from
 *     the label; if none, a random UUID is used.
 *
 */
export const FormField = {

  //========================================================================
  /**
   * Renders an HTML checkbox input with the given label.
   *
   * Config props:
   *
   * - {`?string`} id - widget id
   *
   * @param {stream} prop - value of the numeric widget (`true` or `false`)
   * @param {?string} label - label for the numeric input
   * @param {Object} configProps - widget configuration
   */
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
  /**
   * Renders an HTML hidden "input".  There's no label parameter for this
   * method for what I hope is obvious reasons.
   *
   * @param {stream} prop - value of the hidden widget
   * @param {?string} name - name for the hidden input
   */
  hidden: (prop, name) => {
    return m("input[type=hidden]",
      {
        name: name,
        value: prop()
      });
  },

  //========================================================================
  /**
   * Renders an HTML numeric input with the given optional label.
   *
   * Config props:
   *
   * - {`?string`} id - widget id
   * - {`?numeric`} max - maximum value of the widget
   * - {`?numeric`} min - minimum value of the widget
   * - {`?boolean`} readOnly - if `true`, no widget is rendered, only the `prop`
   *     value
   * - {`?number`} size - width in characters of the widget
   *
   * @param {stream} prop - value of the numeric widget
   * @param {?string} label - label for the numeric input
   * @param {Object} configProps - widget configuration
   */
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
  /**
   * Renders an HTML drop-down widget with the given label.
   *
   * Config props:
   *
   * - {`?string`} id - widget id
   * - {`Array`} options - list of `"name"` and/or `"name=value"` strings
   *     used as the drop-down choices; the name is used as the value if
   *     no value is provided
   * - {`?string`} valueType - if `"integer"`, the option values are converted
   *     to integers; otherwise, the values are treated as strings
   *
   * @param {stream} prop - value of the drop-down
   * @param {string} label - label for the dropdown (required!)
   * @param {Object} configProps - dropdown configuration
   */
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
   * Renders an HTML text input with the given optional `label`.
   *
   * Config props:
   *
   * - {`?string`} fieldNote - optional note rendered above the input widget
   * - {`?string`} id - widget id
   * - {`?string`} placeholder - used as widget placeholder or content if
   *     `readOnly` is `true` and `prop()` is empty
   * - {`?boolean`} readOnly - if `true`, no widget is rendered, only the `prop`
   *     value (or `placeholder` if none)
   * - {`?number`} size - width in characters of the widget (default: 60)
   *
   * @param {stream} prop - value of the text widget
   * @param {?string} label - label for the text input
   * @param {Object} configProps - widget configuration
   */
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

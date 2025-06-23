import m from "mithril";

const convertTo = (valType, val) => valType === "integer" ? parseInt(val, 10) : val;

const labelToId = label => label.replaceAll(/\s+/g, "-").toLowerCase();

export const FormField = {

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

  select: (prop, label, configProps = {}) => {
    const fieldId = configProps["id"] || labelToId(label);
    return [
      m(`label[for=${fieldId}]`, label),
      m(`select[id=${fieldId}]`,
        {
          onchange: ev => prop(convertTo(configProps["valueType"], ev.target.value)),
        },
        (configProps["options"] || []).map(o => {
          const [optLabel, val] = o.split(/\s*=\s*/)
          return m(`option[value=${val}]`,
            {
              selected: String(prop()) === val
            },
            optLabel)
        }))
    ]
  },

  text: (prop, label, configProps = {}) => {
    const fieldId = configProps["id"] || labelToId(label);
    return [
      m(`label[for=${fieldId}]`, label),
      m("div",
        configProps["fieldNote"] ? m(`.field-note ${fieldId}-field-note`, configProps["fieldNote"]) : null,
        m(`input[type=text][id=${fieldId}]`,
          {
            onchange: ev => prop(ev.target.value),
            value: prop()
          }))
    ];
  }
};

/* global module require */

const m = require("mithril");

//========================================================================
const DateRangePicker = ({ attrs: { range, callbackFn } }) => {
  let customMode = false;
  let now = new Date();

  const pad = s => s.length > 1 ? s : "0" + s;

  const formatDate = dateObj =>
      dateObj.getFullYear() +
      "-" +
      pad(dateObj.getMonth() + 1 + "") +
      "-" +
      pad(dateObj.getDate() + "");


  const updateDateRange = ev => {
    let now = new Date();
    range.toDate = formatDate(new Date());
    customMode = false;

    switch (ev.target.value) {
    case 'all':
      range.fromDate = formatDate(new Date(1999, 0, 1));
      callbackFn(range);
      break;

    case 'month':
      range.fromDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      callbackFn(range);
      break;

    case 'year':
      range.fromDate = formatDate(new Date(now.getFullYear(), 0, 1));
      callbackFn(range);
      break;

    case 'custom':
      customMode = true;
      break;
    }
  };

  return {
    oninit: _vnode => {
      let now = new Date();
      range.fromDate = range.fromDate || formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      range.toDate = range.toDate || formatDate(now);
      callbackFn(range);
    },

    view: _vnode => {
      return [
        m("select.date-range-picker-select",
          { onchange: updateDateRange },
          m("option[value=all]", "All Time"),
          m("option[value=year]", "This Year"),
          m("option[value=month][selected]", "This Month"),
          m("option[value=custom]", "Custom")
          ),
        m("span.date-range-picker-from",
          customMode ? m("input[type=date][size=10]",
                         {
                           onchange: ev => range.fromDate = ev.target.value,
                           value: range.fromDate
                         })
                     : range.fromDate),
        m("span", " - "),
        m("span.date-range-picker-to",
          customMode ? m("input[type=date][placeholder=YYYY-MM-DD][size=10]",
                         {
                           onchange: ev => range.toDate = ev.target.value,
                           value: range.toDate
                         })
                     : range.toDate),
        customMode
          ? m("button",
              { onclick: _ => callbackFn(range) },
              "Go!")
          : null
      ];
    }
  };
};

module.exports = DateRangePicker;

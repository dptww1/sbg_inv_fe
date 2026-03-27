import m from "mithril";

//========================================================================
/**
 * Mithril component managing the date filters on the Account page.
 *
 * @component
 *
 * @vattr {Object} range - object with two fields, `fromDate` and `toDate`
 *     with date strings in `YYYY-MM-DD` format
 * @vattr {function(range:{fromDate:string, toDate:string)} callbackFn -
 *     function called when the date widgets here are updated
 */
export const DateRangePicker = () => {
  let callback;
  let selectedRangeName;
  let customMode;

  //========================================================================
  const formatDate = dateObj => dateObj.toISOString().substring(0, 10);

  //========================================================================
  const prevMonthFromDate = () => {
    const now = new Date();
    let mm = now.getMonth() - 1;
    let yyyy = now.getFullYear();
    if (mm < 0) {
      mm = 11;
      yyyy -= 1;
    }
    return formatDate(new Date(yyyy, mm, 1));
  };

  //========================================================================
  const prevMonthToDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    let mm = now.getMonth() - 1;
    if (mm < 0) {
      mm = 11;
    }

    let dd = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][mm];
    if (m === 1 && (yyyy % 100 === 0 && yyyy % 400 !== 0)) {
      dd = 29;
    }
    return formatDate(new Date(yyyy, mm, dd));
  };

  //========================================================================
  const updateDateRange = (newRangeName, range) => {
    const now = new Date();
    range.toDate = formatDate(new Date());
    customMode = false;

    switch (selectedRangeName = newRangeName) {
    case "all":
      range.fromDate = formatDate(new Date(1999, 0, 1));
      callback(range);
      break;

    case "lastmonth":
      range.fromDate = prevMonthFromDate();
      range.toDate = prevMonthToDate();
      callback(range);
      break;

    case "lastyear":
      range.fromDate = formatDate(new Date(now.getFullYear() - 1, 0, 1));
      range.toDate = formatDate(new Date(now.getFullYear() - 1, 11, 31));
      callback(range);
      break;

    case "month":
      range.fromDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      callback(range);
      break;

    case "year":
      range.fromDate = formatDate(new Date(now.getFullYear(), 0, 1));
      callback(range);
      break;

    case "custom":
      customMode = true;
      break;
    }
  };

  return {
    oninit: ({ attrs: { range, callbackFn } }) => {
      selectedRangeName = "month";
      customMode = false;
      let now = new Date();
      range.fromDate = range.fromDate || formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      range.toDate = range.toDate || formatDate(now);
      callback = callbackFn;
      callback(range);
    },

    view: ({ attrs: { range, callbackFn } }) => {
      return [
        m("select.date-range-picker-select",
          {
            onchange: ev => updateDateRange(ev.target.value, range)
          },
          m("option[value=all]",       { selected: selectedRangeName == "all"       }, "All Time"),
          m("option[value=year]",      { selected: selectedRangeName == "year"      }, "This Year"),
          m("option[value=lastyear]",  { selected: selectedRangeName == "lastyear"  }, "Last Year"),
          m("option[value=month]",     { selected: selectedRangeName == "month"     }, "This Month"),
          m("option[value=lastmonth]", { selected: selectedRangeName == "lastmonth" }, "Last Month"),
          m("option[value=custom]",    { selected: selectedRangeName == "custom"    }, "Custom")
          ),
        m("span.date-range-picker-from",
          customMode
            ? m("input[type=date][size=10]",
                {
                  onchange: ev => range.fromDate = ev.target.value,
                  value: range.fromDate
                })
            : range.fromDate),
        m("span", " - "),
        m("span.date-range-picker-to",
          customMode
            ? m("input[type=date][placeholder=YYYY-MM-DD][size=10]",
                {
                  onchange: ev => range.toDate = ev.target.value,
                  value: range.toDate
                })
            : range.toDate),
        customMode
          ? m("button",
              { onclick: () => callbackFn(range) },
              "Go!")
          : null
      ];
    }
  };
};

import m from "mithril";

let selectedRange = "month";

//========================================================================
export const DateRangePicker = ({ attrs: { range, callbackFn } }) => {
  let customMode = false;

  //------------------------------------------------------------------------
  const pad = s => s.length > 1 ? s : "0" + s;

  //------------------------------------------------------------------------
  const formatDate = dateObj =>
      dateObj.getFullYear() +
      "-" +
      pad(String(dateObj.getMonth() + 1)) +
      "-" +
      pad(String(dateObj.getDate()));

  //------------------------------------------------------------------------
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

  //------------------------------------------------------------------------
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

  //------------------------------------------------------------------------
  const updateDateRange = ev => {
    const now = new Date();
    range.toDate = formatDate(new Date());
    customMode = false;

    switch (selectedRange = ev.target.value) {
    case "all":
      range.fromDate = formatDate(new Date(1999, 0, 1));
      callbackFn(range);
      break;

    case "lastmonth":
      range.fromDate = prevMonthFromDate();
      range.toDate = prevMonthToDate();
      callbackFn(range);
      break;

    case "lastyear":
      range.fromDate = formatDate(new Date(now.getFullYear() - 1, 0, 1));
      range.toDate = formatDate(new Date(now.getFullYear() - 1, 11, 31));
      callbackFn(range);
      break;

    case "month":
      range.fromDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      callbackFn(range);
      break;

    case "year":
      range.fromDate = formatDate(new Date(now.getFullYear(), 0, 1));
      callbackFn(range);
      break;

    case "custom":
      customMode = true;
      break;
    }
  };

  return {
    oninit: () => {
      let now = new Date();
      range.fromDate = range.fromDate || formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
      range.toDate = range.toDate || formatDate(now);
      callbackFn(range);
    },

    view: () => {
      return [
        m("select.date-range-picker-select",
          { onchange: updateDateRange },
          m("option[value=all]",       { selected: selectedRange == "all"       }, "All Time"),
          m("option[value=year]",      { selected: selectedRange == "year"      }, "This Year"),
          m("option[value=lastyear]",  { selected: selectedRange == "lastyear"  }, "Last Year"),
          m("option[value=month]",     { selected: selectedRange == "month"     }, "This Month"),
          m("option[value=lastmonth]", { selected: selectedRange == "lastmonth" }, "Last Month"),
          m("option[value=custom]",    { selected: selectedRange == "custom"    }, "Custom")
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

import m         from "mithril";
import prop      from "mithril/stream";

import { ActivityChart     } from "./components/activity-chart.js";
import { Credentials       } from "./credentials.js";
import { DateRangePicker   } from "./components/date-range-picker.js";
import { EditDialog        } from "./components/edit-dialog.js";
import { FigureHistoryList } from "./components/figure-history-list.js";
import { Header            } from "./header.js";
import * as K                from "./constants.js";
import { Nav               } from "./nav.js";
import { Request           } from "./request.js";
import * as U                from "./utils.js";

let userHistory = [];
let dateRange = {};
let historyFilters = [];

// Redraws happen twice when the DateRangePicker controls are used,
// as the control changes generate an update and then the callback
// does a request which generates a second update. This variable
// allows the chart to update only when true.
let allowChartUpdate = false;

const figureHistoryOptions = [
  {
    label: "Show All",
    filters: []
  },
  {
    label: "Show Only Bought",
    filters: [ "buy_unpainted", "buy_painted" ]
  },
  {
    label: "Show Only Painted",
    filters: [ "paint" ]
  },
  {
    label: "Show Only Sold",
    filters: [ "sell_unpainted", "sell_painted" ]
  }
];

let curFigureHistoryOptionLabel = figureHistoryOptions[0].label;

//========================================================================
const domBackEndAdmin = () => {
  return [
    m(".section-header back-end-admin", "Back End Admin"),
    m("select.back-end",
      {
        onchange: ev => Request.setApi(ev.target.value)
      },
      Request.apis.map(api => m("option",
                                {
                                  selected: api.name === Request.curApi().name,
                                  value: api.name
                                },
                                api.name))),
    m("span.back-end-url", Request.curApi().url)
  ];
};

//========================================================================
const domHistoryTypeFilter = () => {
  return m("select",
           {
             onchange: ev => {
               curFigureHistoryOptionLabel = figureHistoryOptions[ev.target.value].label;
               historyFilters = figureHistoryOptions[ev.target.value].filters;
             }
           },
           figureHistoryOptions.map((o, i) =>
             m("option",
               {
                 value: i,
                 selected: o.label === curFigureHistoryOptionLabel
               },
               o.label)));
};

//========================================================================
const refreshHistory = _vnode => {
  if (Credentials.isLoggedIn() &&
      dateRange.fromDate &&
      dateRange.fromDate.match(/\d\d\d\d-\d\d-\d\d/) &&
      dateRange.toDate &&
      dateRange.toDate.match(/\d\d\d\d-\d\d-\d\d/)) {
    Request.get("/userhistory?from=" + dateRange.fromDate + "&to=" + dateRange.toDate,
                resp => {
                  userHistory = resp.data;
                  allowChartUpdate = true;
                });
  }
};

//========================================================================
const updateAccount = () => {
  var paramMap = {};

  if (Credentials.email()) {
    paramMap["email"] = Credentials.email();
  }

  if (Credentials.password()) {
    paramMap["password"] = Credentials.password();
  }

  Request.put("/users/" + Credentials.userId(),
              { user: paramMap },
              resp => {
                Request.messages("Account updated.");
              });
};

//========================================================================
export const Account = {
  view: _vnode => {
    const filteredActivityList = userHistory.filter(
      h => !historyFilters.length || historyFilters.includes(h.op));

    return [
      m(Header),
      m(Nav, { selected: "Account" }),
      m("div.main-content",

        Credentials.isAdmin() ? domBackEndAdmin() : null,

        m(m.route.Link,
          { href: "/scenarios", onclick: () => { Credentials.clear(); } },
          m("span.action", K.ICON_STRINGS.log_out),
          "Log Out"),

        m(".section-header", "Activity"),

        m("p",
          domHistoryTypeFilter()),

        m("p",
          m(DateRangePicker,
            {
              callbackFn: refreshHistory,
              range: dateRange,
            })),

        m(".chartContainer",
          m(ActivityChart,
            {
              activityList: filteredActivityList,
              onbeforeupdate: () => {
                let retVal = allowChartUpdate;
                allowChartUpdate = false;
                return retVal;
              }
            })),

        m("p",
          m(FigureHistoryList,
            {
              list: filteredActivityList,
              hideName: false,
              callbackFn: refreshHistory,
              showTotals: historyFilters.length
            })),

        m(".section-header", "Account Admin"),

        m("p", "Use this form to update your email address and/or password"),

        m("p",
          m("table",

            m("tr",
              m("td", "Name"),
              m("td", Credentials.name())),

            m("tr",
              m("td", "Email"),
              m("td", m("input[type=text][name=email][size=40]",
                        { onchange: ev => Credentials.email(ev.target.value), value: Credentials.email() }))),

            m("tr",
              m("td", "New Password"),
              m("td", m("input[type=password][name=password][size=40]",
                        { onchange: ev => Credentials.password(ev.target.value), value: Credentials.password() }))),

            m("tr.field-note",
              m("td", ""),
              m("td", "(leave empty to keep the same password)")),

            m("tr",
              m("td", ""),
              m("td", m("button[value=Update][name=update]", { onclick: updateAccount }, "Update My Account")))))
       ),

      m(EditDialog),
    ];
  }
};

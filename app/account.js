/* global module require */

const m           = require("mithril");
const prop        = require("mithril/stream");

const Credentials = require("credentials");
const Header      = require("header");
const Nav         = require("nav");
const Request     = require("request");

//========================================================================
const domBackEndAdmin = () => {
  return [
    m(".section-header", "Back End Admin"),
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
const update = () => {
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
var AccountScreen = {
  view: (/*vnode*/) => {
    return [
      m(Header),
      m(Nav, { selected: "Account" }),
      m("div.main-content back-end-admin",

        Credentials.isAdmin() ? domBackEndAdmin() : null,

        m(".section-header", "Account Admin"),

        m("div.text", "Use this form to update your email address and/or password"),

        m("p.text",
          m("table",

            m("tr",
              m("td", "Name"),
              m("td", Credentials.name())),

            m("tr",
              m("td", "Email"),
              m("td", m("input[type=text][name=email][size=40]",
                        { onchange: m.withAttr("value", Credentials.email), value: Credentials.email() }))),

            m("tr",
              m("td", "New Password"),
              m("td", m("input[type=password][name=password][size=40]",
                        { onchange: m.withAttr("value", Credentials.password), value: Credentials.password() })),
              m("td", m("span.field-note", "(leave empty to keep the same password)"))),

            m("tr",
              m("td", ""),
              m("button[value=Update][name=update]", { onclick: () => update() }, "Update My Account")))))
    ];
  }
};

module.exports = AccountScreen;

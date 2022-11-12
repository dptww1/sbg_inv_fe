/* global module require */

const m           = require("mithril");
const prop        = require("mithril/stream");

const Credentials = require("credentials");
const Header      = require("header");
const Nav         = require("nav");
const Request     = require("request");

//========================================================================
const login = () => {
  Request.post("/sessions",
               { user: { email: Credentials.email(), password: Credentials.password() } },
               resp => {
                 Credentials.token(resp.data.token);
                 m.route.set("/scenarios");
               });
};

//========================================================================
const register = () => {
  Request.post("/users",
               { user: { name: Credentials.name(), email: Credentials.email(), password: Credentials.password() } },
               login);
};

//========================================================================
const RegisterScreen = {
  view: (/*vnode*/) => {
    return [
      m(Header),
      m(Nav, { selected: "Login" }),
      m("p",
        "Please fill in all fields completely. Your name and/or email will not be displayed anywhere on the site, nor be ",
        "sold, traded, or otherwise used as anything other than a way to provide login credentials."),

      m("div.main-content register",
        m("table",
          m("tr",
            m("td", "Name"),
            m("td", m("input[type=text][name=name][size=40]", { onchange: ev => Credentials.name(ev.target.value) }))),

          m("tr",
            m("td", "Email"),
            m("td", m("input[type=text][name=email][size=40]", { onchange: ev => Credentials.email(ev.target.value) }))),

          m("tr",
            m("td", "Password"),
            m("td",
              m("input[type=password][name=password][size=40]", { onchange: ev => Credentials.password(ev.target.value) }))),

          m("tr",
            m("td", ""),
            m("td",
              m("button[value=Sign In][name=signin]", { onclick: () => register() }, "Sign Up!")))))
    ];
  }
};

module.exports = RegisterScreen;

/* global require module */

const m    = require("mithril");
const prop = require("mithril/stream");

//===========================================================================
const Cookie = {
    delete: (name) => {
        //console.log("*** DELETE COOKIE " + name);
        document.cookie = name + "=; expires=Wed, 01 Jan 1970";
    },

    read: (name) => {
        const cookies = document.cookie.split(/\s*;\s*/);
        for (var i = 0; i < cookies.length; ++i) {
            if (cookies[i].indexOf(name) == 0) {
                //console.log("*** READ COOKIE " + cookies[i].substring(name.length + 1));
                return cookies[i].substring(name.length + 1);
            }
        }
        return null;
    },

    write: (name, value) => {
        const d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
        document.cookie = name + '=' + value + "; expires = " + d.toUTCString();
        //console.log("*** WRITE COOKIE " + document.cookie);
    }
};

//===========================================================================
const propCookie = (cookieName) => {
    return (...args) => {
        if (args.length > 0) {
            if (args[0] === undefined) {
                Cookie.delete(cookieName);
            } else {
                Cookie.write(cookieName, args[0]);
            }
            return args[0];
        } else {
            return Cookie.read(cookieName);
        }
    };
};

//===========================================================================
const Credentials = {
    name: propCookie("name"),
    email: prop(),
    admin: prop(),
    password: prop(),
    token: propCookie("token"),
    userId: prop(),

    clear() {
        Credentials.admin(false);
        Credentials.name(undefined);
        Credentials.token(undefined);
        Credentials.userId(undefined);
    },

    isAdmin() {
        return Credentials.admin();
    },

    isLoggedIn() {
        return Credentials.token();
    }
};

module.exports = Credentials;

import m from "mithril";
import prop from "mithril/stream";

//===========================================================================
const Cookie = {
    delete: (name) => {
        document.cookie = name + "=; expires=Wed, 01 Jan 1970";
    },

    read: (name) => {
        const cookies = document.cookie.split(/\s*;\s*/);
        for (var i = 0; i < cookies.length; ++i) {
            if (cookies[i].indexOf(name) == 0) {
                return cookies[i].substring(name.length + 1);
            }
        }
        return null;
    },

    write: (name, value) => {
        const d = new Date();
        d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
      document.cookie = [
        name + '=' + value,
        " expires=" + d.toUTCString(),
        " SameSite=Strict",
        " Secure"
      ].join(";");
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
export const Credentials = {
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

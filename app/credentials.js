import prop from "mithril/stream";

//===========================================================================
const Cookie = {
  delete: (name) => {
    document.cookie = name + "=; expires=Wed, 01 Jan 1970";
  },

  read: (name) => {
    const cookies = document.cookie.split(/\s*;\s*/);
    for (let i = 0; i < cookies.length; ++i) {
      if (cookies[i].indexOf(name) == 0) {
        return cookies[i].substring(name.length + 1);
      }
    }
    return null;
  },

  write: (name, value) => {
    const d = new Date();
    d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
    const params = [
      name + '=' + value,
      " expires=" + d.toUTCString(),
      " SameSite=Lax",
    ];
    // Safari will not set a Secure cookie when using http:,
    // as currently is happening with local development.
    if (location.protocol === "https:") {
      params.push(" Secure");
    }
    document.cookie = params.join(";");
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
/**
 * Namespace for user account utilities.
 */
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

  /**
   * Slightly more idiomatic way to check if the user is an administrator.
   * You can hack this on the front-end, but, barring bugs, the back end
   * will not believe you.
   *
   * @return {boolean} `true` if the BE reported the user as an admin, else `false`
   */
  isAdmin() {
    return Credentials.admin();
  },

  /**
   * Determines if the user is logged in.
   *
   * @return {boolean} `true` if the user has logged in, or `false` if they are anonymous
   */
  isLoggedIn() {
    return Credentials.token();
  }
};

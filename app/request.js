/* global BACKEND */
import m from "mithril";
import prop from "mithril/stream";

import { Credentials } from "./credentials.js";

const APIS = [
  {
    name: "prod",
    url: "https://homely-uncomfortable-wreckfish.gigalixirapp.com/api"
  },
  {
    name: "local",
    url: "http://127.0.0.1:4000/api"
  }
];

let curApi = APIS[BACKEND];

//===========================================================================
const clearText = () => {
  Request.messages(null);
  Request.errors(null);
};

//===========================================================================
const extractFn = xhr => {
  window.setTimeout(clearText, 250);

  if (xhr.status === 401 || xhr.status == 400) {
    Credentials.clear();
    Request.errors({ errors: "Authentication failed. Please log in." });
    throw Request.errors().errors;

  } else if (xhr.status == 422) {
    failFn(xhr.response);

  } else if (xhr.status >= 300) {
    failFn(xhr.response);
    throw Request.errors().errors;
  }

  return xhr.response || "{}";  // some legal responses return no data (e.g. HTTP 204)
};

//===========================================================================
const failFn = resp => {
  window.setTimeout(clearText, 250);

  if (resp && typeof resp === "object" && typeof resp.errors === "object") {
    Request.errors(resp.errors);

  } else {
    Request.errors({ errors: "The server appears to be down. Please try again later." });
  }

  throw Request.errors().errors;
};

//===========================================================================
const request = (httpMethod, url, data, successFn) => {
  clearText();

  const opts = {
    method: httpMethod,
    url: curApi.url + url,
    extract: extractFn,
    timeout: 5000,
    responseType: "json"
  };

  if (Credentials.token()) {
    opts.config = function(xhr) {
      xhr.setRequestHeader("authorization", "Token token=" + Credentials.token());
    };
  }

  if (data) {
    opts.body = data;
  }

  return m.request(opts).then(resp => successFn(resp));
};

//===========================================================================
/**
 * Namespace for HTTP request methods. If there is an authorization token
 * available in {@link Credentials}, the token is automatically added
 * to the request.
 *
 * For all methods, the `url` parameter should be relative to the host
 * `.../api` URL.  The methods do not return data directly; clients should
 * instead rely on the `successFn` parameter to provide a callback on
 * successful request.  For failed requests, the `error` variable will
 * be filled in automatically.
 */
export const Request = {
  /**
   * Mithril stream containing an error message string, or an object with
   * an `"errors"` key containing the message. Intended to be used for
   * error messages such as form validation errors.
   *
    * The multiple allowable types is unfortunate.
   */
  errors: prop(),

  /**
   * Mithril stream containing a message string. Intended to be used for regular
   * notifications, such as successful saves.
   *
   * The plural name is unfortunate.
   */
  messages: prop(),

  /**
   * Perform an HTTP `DELETE` request.
   *
   * @param {string} url - the URL to get data from
   * @param {function(response:Object)} successFn - function called on
   *     successful HTTP call
   */
  delete: (url, successFn) => request("DELETE", url, null, successFn),

  /**
   * Perform an HTTP `GET` request.
   *
   * @param {string} url - the URL to get data from
   * @param {function(response:Object)} successFn - function called on
   *     successful HTTP call
   */
  get: (url, successFn) => request("GET", url, null, successFn),

  /**
   * Perform an HTTP `POST` request.
   *
   * @param {string} url - the URL to get data from
   * @param {?Object} data - request data
   * @param {function(response:Object)} successFn - function called on
   *     successful HTTP call
   */
  post: (url, data, successFn) => request("POST", url, data, successFn),

  /**
   * Perform an HTTP `PUT` request.
   *
   * @param {string} url - the URL to get data from
   * @param {?Object} data - request data
   * @param {function(response:Object)} successFn - function called on
   *     successful HTTP call
   */
  put: (url, data, successFn) => request("PUT", url, data, successFn),

  /**
   * Perform an HTTP `PUT` or `POST` request.
   *
   * @param {string} url - the URL to get data from
   * @param {?number} id - if present, perform a `PUT` request for this
   *     object id; otherwise perform a `POST` request
   * @param {?Object} data - request data
   * @param {function(response:Object)} successFn - function called on
   *     successful HTTP call
   */
  putOrPost: (url, id, data, successFn) => {
    if (id) {
      return Request.put(url + "/" + id, data, successFn);
    } else {
      return Request.post(url, data, successFn);
    }
  },

  curApi: () => curApi,

  apis: APIS,

  setApi: apiName => {
    curApi = APIS.find(api => api.name === apiName);
    Request.messages(`Now working with ${apiName} back end`);
    Credentials.clear();
    m.route.set("/login");
  }
};

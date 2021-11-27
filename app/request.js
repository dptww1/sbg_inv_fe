/* global require module */

const m           = require("mithril");
const prop        = require("mithril/stream");
const Credentials = require("credentials");

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

var curApi = APIS[1];

//===========================================================================
const clearText = _ => {
  Request.messages(null);
  Request.errors(null);
};

//===========================================================================
const extractFn = (xhr, xhrOptions) => {
  window.setTimeout(clearText, 250);

  if (xhr.status === 401 || xhr.status == 400) {
    Credentials.clear();
    return Request.errors({ errors: "Authentication failed. Please log in." });

  } else {
    return JSON.parse(xhr.responseText || "{}");  // some legal responses return no data (e.g. HTTP 204)
  }
};

//===========================================================================
const failFn = (resp) => {
  window.setTimeout(clearText, 250);

  if (resp === null) {
    Request.errors({ errors: "The server appears to be down. Please try again later." });
  } else {
    Request.errors({ errors: resp.errors });
  }
};

//===========================================================================
const request = (httpMethod, url, data, successFn) => {
  clearText();

  const opts = {
    method: httpMethod,
    url: curApi.url + url,
    extract: extractFn,
    timeout: 5000
  };

  if (Credentials.token()) {
    opts.config = function(xhr) {
      xhr.onerror = () => failFn(null),
      xhr.setRequestHeader("authorization", "Token token=" + Credentials.token());
    };
  }

  if (data) {
    opts.body = data;
  }

  return m.request(opts).then(
    resp => successFn(resp),
    resp => failFn(resp)
  );
};

//===========================================================================
const Request = {
  errors: prop(),

  messages: prop(),

  delete: (url, successFn) => request("DELETE", url, null, successFn),

  get: (url, successFn) => request("GET", url, null, successFn),

  post: (url, data, successFn) => request("POST", url, data, successFn),

  put: (url, data, successFn) => request("PUT", url, data, successFn),

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

module.exports = Request;

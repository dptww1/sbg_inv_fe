/* global localStorage, Intl, BOOK_INFO */

import m    from "mithril";
import prop from "mithril/stream";

import * as K from "./constants.js";

const sortOrderMap = {};

//========================================================================
/**
 * Massages the key/value pairs in the `hash` parameter
 * into an array of strings suitable for passing to
 * {@link FormField#select}.
 *
 * @param {Object} hash - object with key/value pairs
 *
 * @return {string[]} Array of of `"string=value"` strings
 */
export const alphabetizedOptionsByValue = hash => {
  let reverseMap = Object.keys(hash).reduce((map, key) => {
    map[hash[key]] = key;
    return map;
  }, {});

  let values = Object.keys(reverseMap).sort(strCmp);

  return values.reduce((list, val) => list.concat([val + "=" + reverseMap[val]]), []);
};

//========================================================================
/**
 * Converts a string in `snake_case` to `Snake Case`.
 *
 * @param {string} s - string to convert
 *
 * @return {string} the converted string
 */
export const asLabel = s =>
  s.replaceAll(/_/g, " ")
   .replace(/\b\w/g, c => c.toUpperCase());

//========================================================================
/**
 * Normalizes a string to a form suitable for title sorting.
 * Removes initial articles (A, The) and accents.
 *
 * @param {string} s - string to convert
 *
 * @example
 *   asNormalized("The Hobbit") // => "Hobbit"
 * @example
 *   asNormalized("Éomer") // "Eomer"
 *
 * @return {string} the normalized string
 */
export const asNormalized = s => {
  let s2 = sortOrderMap[s] ||
           s.normalize('NFD') // normalize unicode
            .replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/^The /, "") // Remove leading "The "
            .replace(/^A /, ""); // Remove leading "A "
  sortOrderMap[s] = s2;
  return s2;
};

//========================================================================
/**
 * Compares two values, suitable for using with `Array.sort`.
 *
 * @param {number|string} a - first value
 * @param {number|string} b - second value
 *
 * @return {number} -1 (`a` < `b`), 0 (`a` == `b`), or 1 (`a` > `b`)
 */
export const cmp = (a, b) => a > b ? 1 : a < b ? -1 : 0;

//========================================================================
/**
 * Gets the current date, taking the user's timezone into account.
 *
 * @return {string} the current date in `YYYY-MM-DD` format
 */
export const currentDate = () => {
  let d = new Date();

  return new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
      .toISOString()
      .substring(0, 10);
};

//========================================================================
/**
 * Computes the number of days between two dates, inclusive.
 * It doesn't matter which date is earlier nor which is later.
 *
 * @param {string} d1 - first date, in `YYYY-MM-DD` format
 * @param {string} d2 - second date, in `YYYY-MM-DD` format
 *
 * @example
 *   daysInRange("2026-02-05", "2026-02-07") // => 3
 * @example
 *   daysInRange("2026-03-10", "2026-03-10") // => 1
 *
 * @return {number} the number of days
 */
export const daysInRange = (d1, d2) => {
  if (d1.match(/\d\d\d\d-\d\d-\d\d/) &&
      d2.match(/\d\d\d\d-\d\d-\d\d/)) {

    const utc1 = Date.UTC(d1.substring(0, 4), d1.substring(5, 7), d1.substring(8));
    const utc2 = Date.UTC(d2.substring(0, 4), d2.substring(5, 7), d2.substring(8));

    return Math.floor(Math.abs(utc1 - utc2) / (1000 * 60 * 60 * 24)) + 1;
  }

  return 0;
};

//========================================================================
/**
 * Restores all non-null fields in an object to default values.
 *
 * - Array fields are reset to `[]`.
 * - Object fields are reset to `{}`.
 * - Other fields are set to the empty string.
 *
 * These default values can be be overridden on a per-field basis by supplying
 * key/value pairs in the optional `overrides` parameter, where the key is
 * the field name, and the value is the default value which should be used.
 *
 * Function fields are assumed to be Mithril streams and will have their values
 * reset, too, per the above.
 *
 * Fields with `null` values will remain `null`.
 *
 * **IMPORTANT!** This function modifies the object!
 *
 * @param {Object} obj - the object to reset
 * @param {?Object} overrides - key/value pairs to use as non-standard defaults
 *
 * @example
 *   emptyOutObject({"a": "x", "b": [123], "c": {"z": 456}))
 *   // => {"a": "", "b": [], "c": {}}
 * @example
 *   emptyOutObject({"n": 123, "p": "foo", "q": null}, {"n": 0}
 *   // => {"n": 0, "p": "", "q": null}
 */
export const emptyOutObject = (obj, overrides = {}) =>
  Object.entries(obj).reduce(
    (acc, [key, val]) => {
      if (typeof val === "function") { // assumed to be a Mithril stream
        const propVal = val.apply(null, [])
        val.apply(null, [ emptyOutObjectDefaultValueForType(key, propVal, overrides) ])

      } else {
        acc[key] = emptyOutObjectDefaultValueForType(key, val, overrides);
      }

      return acc;
    },
    obj);

//========================================================================
const emptyOutObjectDefaultValueForType = (key, val, overrides) => {
  // Can't just use `overrides[key]` here because we might
  // want to override with null/undefined/etc
  if (key in overrides) {
    return overrides[key];

  } else if (val === null) {
    return null;

  } else if (Array.isArray(val)) {
    return [];

  } else if (typeof val === "object") {
    return {};

  } else {
    return "";
  }
}


//========================================================================
const NUMERIC_FMT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/**
 * Formats a number with guaranteed 2 digits after the decimal point,
 * rounding if necessary.
 *
 * Uses US conventions, so the decimal point is `.` not `,`. Sorry.
 *
 * @param {number} n - number to format
 *
 * @return {string} the formatted number
 *
 * @example
 *   formatNumber(12) // => 12.00
 * @example
 *   formatNumber(1.187) // => 1.19
 */
export const formatNumber = n => NUMERIC_FMT.format(n);

/**
 * Returns a possibly deeply-nested field from a data structure. The `path`
 * parameter is a series of field names separated by slashes, each element
 * digging a level down into the object.  Both Objects and Arrays are
 * supported in any combination.
 *
 * If the path specifies a field with a `null` value, there's no way
 * to tell if this function succeeded or not.
 *
 * Fields which are functions are assumed to be Mithril streams,
 * and should be handled correctly.
 *
 * @example
 *   getByPath({"a": {"b": 1, "c": {"d": 3}}}, "a/c/d") // => 3
 *
 * @param {?Object} object - the object to get the field value for
 * @param {?string} path - field names separated by `/`
 *
 * @return {Object|number|string|Array} whatever data is at the given path,
 *     or `null` if either parameter is `null` or `path` contains a
 *     field name not in the object
 */
export const getByPath = (object, path) => {
  //console.log("1)", object, "PATH", path);
  if (!object
    || !path
    || (typeof object != "object")) {
    return null;
  }

  const thisPath = path.split("/", 1)[0];
  let thisObject = object[thisPath];

  //console.log("2) THISPATH", thisPath, "THISOBJECT", thisObject);

  // Account for thisObject being a property
  if (typeof thisObject === "function") {
    //console.log("2A) PROP, NOW", thisObject.call());
    thisObject = thisObject.call();
  }

  // Have we reached the end of the path?
  const nextPath = path.replace(new RegExp(`^.{${thisPath.length}}/?`), "");
  //console.log("3) NEXTPATH", nextPath);
  if (nextPath.length === 0) {
    //console.log("END) VAL", thisObject);
    return thisObject;
  }

  // If not, recurse
  return getByPath(thisObject, nextPath);
}

//========================================================================
/**
 * Gets a true/false value from local storage.
 *
 * @param {string} keyName - the local storage key
 *
 * @return {boolean} the value of the local storage key
 */
export const getLocalStorageBoolean = keyName => {
  const strVal = localStorage.getItem(keyName);
  return strVal === "true";
};

//========================================================================
/**
 * Determines if a thing has no content.
 *
 * See also {@link isNotBlank}.
 *
 * @param {Array|string} o - the thing to test
 *
 * @return {boolean} `true` if the thing is `null`, `undefined`,
 *     or an empty array or string
 *
 * @todo handle `Object`s
 */
export const isBlank = o =>
  o === null
    || o === undefined
    || (Array.isArray(o) && o.length === 0)
    || (typeof o === "string" && o.length === 0);

//========================================================================
/**
 * Checks that none of the arguments are blank, per {@link isBlank}.
 *
 * @param {...*} args - the things to check
 *
 * @return {boolean} `false` if any argument was blank, else `true`
 */
export const isNoneBlank = (...args) => {
  for (const arg of args) {
    if (isBlank(arg)) {
      return false;
    }
  }

  return true;
};

//========================================================================
/**
 * Determines if a thing has content.
 *
 * See also {@link isBlank}.
 *
 * @param {Array|Object|string|number} o - the thing to test
 *
 * @return {boolean} `true` if `o` is any number or object, or a non-empty string or array
 *
 * @todo empty objects return `true`
 */
export const isNotBlank = o => !isBlank(o);

//========================================================================
/**
 * Convert the fields of the given object from primitive types to
 * Mithril streams.
 *
 * See also {@link unpropertize}.
 *
 * **IMPORTANT!** This function modifies the input object!
 *
 * @param {Object} obj - the object to instantiate streams for
 *
 * @return {Object} the input object; this is a bit useless as the caller
 *     can just continue to use the input object since it's been
 *     modified.
 *
 * @todo this function isn't recursive and probably should be
 */
export const propertize = obj => {
  if (obj) {
    const keys = Object.keys(obj);
    keys.forEach(key => {
      if (typeof key !== "function") {
        obj[key] = prop(obj[key]);
      }
    });
  }

  return obj;
}

//========================================================================
/**
 * Returns the plural name for figure, or the singular name if none.
 *
 * @param {Object} figure - a figure structure as returned from the
 *     back end APIs.
 *
 * @return {string} the plural name
 */
export const pluralName = figure => figure.plural_name || figure.name;

//========================================================================
/**
 * Returns the string for the given scenario resource icon.
 *
 * @param {Object} res - scenario resource structure as returned
 *     from the back end
 *
 * @return {string} the icon string, or the empty string for unknown types
 */
export const resourceIcon = res => {
  switch (res.resource_type) {
  case "podcast":      return K.ICON_STRINGS.podcast;
  case "video_replay": return K.ICON_STRINGS.video_replay;
  case "web_replay":   return K.ICON_STRINGS.web_replay;
  default:             return "";
  }
};

//========================================================================
/**
 * Constructs the label for a book resource.
 *
 * See also {@link shortResourceLabel}.
 *
 * @param {Object} res - resource object as returned from the back end,
 *     containing `book` field with a book abbreviation
 *
 * @return {string} the full name of the book (with issue number if present)
 */
export const resourceLabel = res =>
  res && res.book
    ? BOOK_INFO.byKey(res.book).name + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
/**
 * Construct the markup appropriate for a reference to the location
 * of rules or a scenario.
 *
 * @param {?Object} res - resource object as returned by the back end
 *
 * @return {string|Object} string or Mithril markup for the reference,
 *     or `null` if `res` is `null` or an invalid resource
 */
export const resourceReference = res => {
  if (res) {
    if (res.book) {
      return resourceLabel(res) + ", p." + res.page;
    }

    if (res.url) {
      return m("a", { href: res.url }, res.title || res.url);
    }
  }

  return null;
};

//========================================================================
/**
 * Finds the source object for the given scenario or figure.
 *
 * @param {Object} rec - a figure or scenario record from the back end API
 *
 * @return {Object} the source object, or `null` if there is none
 *
 * @todo scenarios and figures have different source formats; should
 *     fix the API
 */
export const scenarioSource = rec =>
  rec.scenario_resources && rec.scenario_resources.source && rec.scenario_resources.source.length > 0
    ? rec.scenario_resources.source[0]  // scenario
    : rec.source;                       // figure

//========================================================================
/**
 * Constructs a shortened label for a book resource.
 *
 * See also {@link resourceLabel}
 *
 * @param {Object} res - resource object as returned from the back end
 *
 * @return {string} the short name of the book (with issue number if present)
 */
export const shortResourceLabel = res =>
  res && res.book
    ? BOOK_INFO.byKey(res.book).shortName + (res.issue ? " #" + res.issue : "")
    : "";

//========================================================================
/**
 * Constructs the complete relative URL for a figure silhouette.
 *
 * @param {string} slug - the `slug` field from a figure
 *
 * @return {string} the full relative URL
 */
export const silhouetteUrl = slug => "/images/factions" + slug + ".png";

//========================================================================
/**
 * Compares two strings after normalizing them.  This make this a suitable
 * function for alphabetic sorting aimed at humans.
 *
 * See also {@link cmp}, {@link asNormalized}.
 *
 * @param {string} a - first string
 * @param {string} b - second string
 *
 * @return {number} -1 (`a` < `b`), 0 (`a` == `b`), or 1 (`a` > `b`)
 */
export const strCmp = (a, b) => {
  let a2 = asNormalized(a);
  let b2 = asNormalized(b);

  return a2 > b2 ? 1 : a2 < b2 ? -1 : 0;
};

//========================================================================
/**
 * Converts the Mithril stream fields in the given object to their
 * primitive values, recursively.
 *
 * See also {@link propertize}.  Note that unlike that function,
 * this one returns a *copy* and leaves the parameter unmodified.
 *
 * @param {Object} o - the object to unpropertize
 */
export const unpropertize = o =>
  Object.entries(o).reduce(
    (acc, [key, val]) => {
      if (typeof val === "function") {
        acc[key] = val.call();

      } else if (typeof val === "object" && val !== null) {
        acc[key] = unpropertize(o[key]);

      } else {
        acc[key] = val;
      }
      return acc;
    },
    {});

/**
 * Constants for inventory management actions. Values
 * are the English labels for the keys.
 * @constants
 */
export const USER_FIGURE_OPS = {
  buy_unpainted:  "Bought Unpainted",
  sell_unpainted: "Sell Unpainted",
  buy_painted:    "Buy Painted",
  sell_painted:   "Sell Painted",
  paint:          "Painted"
};

/**
 * Constants for UTF-8 icons.
 *
 * @constants
 */
export const ICON_STRINGS = {
  // Nav Bar Icons
  about:        "\uea09",
  account:      "\ue902",
  back:         "\ue968", // NB: same as log_out
  figures:      "\ue9dc",
  log_in:       "\ue969",
  log_out:      "\ue968",
  minus:        "\uea0b",
  paint_figure: "\ue90b",
  plus:         "\uea0a",
  register:     "\ue969",
  search:       "\ue986",
  scenarios:    "\ue920",
  stats:        "\ue99c",

  // Scenario Resource Icons
  cheatsheet:      "\ue922",
  magazine_replay: "\ue91f",
  podcast:         "\uea27",
  video_replay:    "\ue912",
  web_replay:      "\ue9c9",

  // Admin Icons
  down:   "\uea3e",
  edit:   "\ue905",
  remove: "\uea0e",
  up:     "\uea3a",
  closed: "\u25b6",
  open:   "\u25bc"
};

/**
 * Constants for Image URLs.
 *
 * @constants
 */
export const IMAGE_STRINGS = {
  // Figure Resource Icons
  analysis:       "<img src='/images/icons/analysis.svg', width='16', height='16'>",
  painting_guide: "<img src='/images/icons/painting_guide.svg' width='16' height='16'>"
};

/**
 * Constants for scenario locations. Values are the
 * English labels for the keys.
 *
 * @constants
 */
export const LOCATIONS = {
  amon_hen:     "Amon Hen",
  arnor:        "Arnor",
  dale:         "Dale",
  dol_guldur:   "Dol Guldur",
  erebor:       "Erebor",
  eriador:      "Eriador",
  fangorn:      "Fangorn",
  fornost:      "Fornost",
  goblintown:   "Goblintown",
  gondor:       "Gondor",
  harad:        "Harad",
  harondor:     "Harondor",
  helms_deep:   "Helm's Deep",
  isengard:     "Isengard",
  ithilien:     "Ithilien",
  laketown:     "Lake-town",
  lothlorien:   "Lothlorien",
  minas_morgul: "Minas Morgul",
  minas_tirith: "Minas Tirith",
  mirkwood:     "Mirkwood",
  mordor:       "Mordor",
  moria:        "Moria",
  morannon:     "Morannon",
  osgiliath:    "Osgiliath",
  rhovanion:    "Rhovanion",
  rhun:         "Rhûn",
  rohan:        "Rohan",
  the_shire:    "The Shire",
  weathertop:   "Weathertop",
  orthanc:      "Orthanc"
};

/**
 * Constants for the scenario resource types.
 *
 * @constants
 */
export const RESOURCE_TYPE_MAP = {
  source:           "0",
  video_replay:     "1",
  web_replay:       "2",
  terrain_building: "3",
  podcast:          "4",
  magazine_replay:  "5",
  cheatsheet:       "6"
};

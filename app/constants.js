// Indexes here must match sbg_inv_be project's :ecto_enums.ex
export const BOOKS = [
  { key: "bot5a",   shortName: "Bo5A (2014)",   name: "Battle of the Five Armies (2014)" },
  { key: "bpf",     shortName: "BoPF (2004)",   name: "Battle of the Pelennor Fields (2004)" },
  { key: "dos",     shortName: "DoS (2013)",    name: "Desolation of Smaug (2013)" },
  { key: "fotn",    shortName: "FotN (2006)",   name: "Fall of the Necromancer (2006)" },
  { key: "fotn2",   shortName: "FotN (2021)",   name: "Fall of the Necromancer (2021)" },
  { key: "fotr",    shortName: "FotR (2001)",   name: "Fellowship of the Ring (2001)" },
  { key: "fotr_jb", shortName: "FotR (2005)",   name: "Fellowship of the Ring (2005)" },
  { key: "fp",      shortName: "FP (2011)",     name: "Free Peoples (2011)" },
  { key: "fr",      shortName: "FR (2011)",     name: "Fallen Realms (2011)" },
  { key: "gif",     shortName: "GiF (2007)",    name: "Gondor in Flames (2007)" },
  { key: "gt",      shortName: "EfG (2012)",    name: "Escape from Goblintown (2012)" },
  { key: "harad",   shortName: "Harad (2007)",  name: "Harad (2007)" },
  { key: "hobbit",  shortName: "HUJ (2012)",    name: "The Hobbit: An Unexpected Journey (2012)" },
  { key: "kd",      shortName: "KD (2007)",     name: "Khazad-dûm (2007)" },
  { key: "km",      shortName: "KoM (2011)",    name: "Kingdoms of Men (2011)" },
  { key: "ma",      shortName: "M&A (2011)",    name: "Moria & Angmar (2011)" },
  { key: "mordor",  shortName: "Mordor (2011)", name: "Mordor (2011)" },
  { key: "omordor", shortName: "Mordor (2007)", name: "Mordor (2007)" },
  { key: "roa",     shortName: "Arnor (2006)",  name: "Ruin of Arnor (2006)" },
  { key: "rotk",    shortName: "RotK (2003)",   name: "Return of the King (2003)" },
  { key: "rotk_jb", shortName: "RotK (2007)",   name: "Return of the King (2007)" },
  { key: "saf",     shortName: "S&F (2003)",    name: "Shadow & Flame (2003)" },
  { key: "sbg",     shortName: "SBG Magazine",  name: "SBG Magazine" },
  { key: "site",    shortName: "SitE (2005)",   name: "A Shadow in the East (2005)" },
  { key: "sog",     shortName: "SoG (2004)",    name: "Siege of Gondor (2004)" },
  { key: "sots",    shortName: "SotS (2004)",   name: "The Scouring of the Shire (2004)" },
  { key: "tba",     shortName: "T&BA (2016)",   name: "There and Back Again (2016)" },
  { key: "ttt",     shortName: "TTT (2002)",    name: "The Two Towers (2002)" },
  { key: "ttt_jb",  shortName: "TTT (2006)",    name: "The Two Towers (2006)" },
  { key: "bpf_ss",  shortName: "BoPF (2018)",   name: "Battle of the Pelennor Fields (2018)" },
  { key: "alotr",   shortName: "ALotR (2018)",  name: "Armies of the Lord of the Rings (2018)" },
  { key: "ah",      shortName: "AH (2018)",     name: "Armies of the Hobbit (2018)" },
  { key: "gaw",     shortName: "GaW (2019)",    name: "Gondor at War (2019)" },
  { key: "bgime",   shortName: "BGiME (2002-)", name: "Battle Games in Middle Earth (2002-)" },
  { key: "sos2",    shortName: "SotS (2019)",   name: "The Scouring of the Shire (2019)" },
  { key: "wfr",     shortName: "WiR (2019)",    name: "War in Rohan (2019)" },
  { key: "qrb",     shortName: "Quest (2020)",  name: "Quest of the Ringbearer (2020)" },
  { key: "dotn",    shortName: "DotN (2022)",   name: "Defence of the North (2022)" },
  { key: "bog",     shortName: "BoO (2022)",    name: "Battle of Osgiliath (2022)" },
  { key: "ang",     shortName: "Angmar (2024)", name: "Rise of Angmar (2024)" },
  { key: "aaa",     shortName: "AoA&A (2024)",  name: "Armies of Arnor and Angmar (2024)" }
];

BOOKS.forEach((book, i) => book.index = i);

// Key: BOOKS[key]  Value: BOOKS[shortName]
export const BOOK_SHORT_NAMES =
  BOOKS.reduce(
    (prev, cur) => {
      prev[cur["key"]] = cur["shortName"];
      return prev;
    },
    {});

// Key: BOOKS[key]  Value: BOOKS[name]
export const BOOK_NAMES =
  BOOKS.reduce(
    (prev, cur) => {
      prev[cur["key"]] = cur["name"];
      return prev;
    },
    {});

export const FACTION_INFO = {
  angmar:          { name: "Angmar",                    letter: "a", id: 0 },
  army_thror:      { name: "Army of Thrór",             letter: "o", id: 1 },
  arnor:           { name: "Arnor",                     letter: "A", id: 2 },
  azogs_hunters:   { name: "Azog's Hunters",            letter: "z", id: 3 },
  azogs_legion:    { name: "Azog's Legion",             letter: "Z", id: 4 },
  barad_dur:       { name: "Barad-Dûr",                 letter: "b", id: 5 },
  dale:            { name: "Garrison of Dale",          letter: "q", id: 6 },
  desolator_north: { name: "Desolator of the North",    letter: "D", id: 7 },
  dol_guldur:      { name: "Dark Powers of Dol Guldur", letter: "x", id: 8 },
  dunharrow:       { name: "Dead of Dunharrow",         letter: "X", id: 9 },
  easterlings:     { name: "Easterlings",               letter: "e", id: 10 },
  erebor:          { name: "Erebor Reclaimed",          letter: "O", id: 11 },
  fangorn:         { name: "Fangorn",                   letter: "f", id: 12 },
  far_harad:       { name: "Far Harad",                 letter: "c", id: 13 },
  fellowship:      { name: "Fellowship",                letter: "f", id: 14 },
  fiefdoms:        { name: "Fiefdoms",                  letter: "F", id: 15 },
  goblintown:      { name: "Goblin-town",               letter: "G", id: 16 },
  harad:           { name: "Serpent Horde",             letter: "h", id: 17 },
  iron_hills:      { name: "Iron Hills",                letter: "I", id: 18 },
  isengard:        { name: "Isengard",                  letter: "i", id: 19 },
  khand:           { name: "Variags of Khand",          letter: "k", id: 20 },
  khazad_dum:      { name: "Khazad-dûm",                letter: "K", id: 21 },
  laketown:        { name: "Army of Lake-town",         letter: "L", id: 22 },
  lothlorien:      { name: "Lothlórien",                letter: "l", id: 23 },
  minas_tirith:    { name: "Minas Tirith",              letter: "g", id: 24 },
  mirkwood:        { name: "Dark Denizens of Mirkwood", letter: "w", id: 25 },
  misty_mountains: { name: "Misty Mountains",           letter: "y", id: 26 },
  mordor:          { name: "Mordor",                    letter: "M", id: 27 },
  moria:           { name: "Moria",                     letter: "m", id: 28 },
  numenor:         { name: "Númenor",                   letter: "N", id: 29 },
  radagast:        { name: "Radagast's Alliance",       letter: "J", id: 30 },
  rangers:         { name: "Rangers",                   letter: "R", id: 31 },
  rivendell:       { name: "Rivendell",                 letter: "n", id: 32 },
  rogues:          { name: "Sharkey's Rogues",          letter: "g", id: 33 },
  rohan:           { name: "Rohan",                     letter: "r", id: 34 },
  shire:           { name: "Shire",                     letter: "s", id: 35 },
  survivors:       { name: "Survivors of Lake-town",    letter: "S", id: 36 },
  thorins_co:      { name: "Thorin's Company",          letter: "t", id: 37 },
  thranduil:       { name: "Halls of Thranduil",        letter: "H", id: 38 },
  trolls:          { name: "The Trolls",                letter: "T", id: 39 },
  umbar:           { name: "Corsairs of Umbar",         letter: "U", id: 40 },
  wanderers:       { name: "Wanderers in the Wild",     letter: "W", id: 41 },
  white_council:   { name: "White Council",             letter: "w", id: 42 },
  wildmen:         { name: "Wildmen of Drúadan",        letter: "E", id: 43 },
  beornings:       { name: "Beornings",                 letter: "B", id: 44 },
  fornost:         { name: "Battle of Fornost",         letter: "-", id: 45 },
  arathorn:        { name: "Arathorn's Stand",          letter: "-", id: 46 },
  witch_king:      { name: "Host of the Witch King",    letter: "-", id: 47 },
  shadows:         { name: "Shadows of Angmar",         letter: "-", id: 48 },
  buhrdur:         { name: "Burhdûr's Horde",           letter: "-", id: 49 },
  wolf_angmar:     { name: "Wolf Pack of Angmar",       letter: "-", id: 50 },
  carn_dum:        { name: "Army of Carn Dûm",          letter: "-", id: 51 }
};

export const SORTED_FACTION_NAMES =
  Object.keys(FACTION_INFO)
        .map(abbr => FACTION_INFO[abbr].name)
        .sort((a, b) => {
          let lca = a.toLowerCase();
          let lcb = b.toLowerCase();
          if (lca < lcb) {
            return -1;
          } else if (lcb < lca) {
            return 1;
          } else {
            return 0;
          }
        });

export const FACTION_NAME_BY_ID =
  Object.keys(FACTION_INFO)
        .reduce((acc, abbr) => {
            acc[FACTION_INFO[abbr].id] = FACTION_INFO[abbr].name;
            return acc;
          },
          {});

export const FACTION_ABBREV_BY_NAME =
  Object.keys(FACTION_INFO)
        .reduce((acc, abbr) => {
                  acc[FACTION_INFO[abbr].name] = abbr;
                  return acc;
                },
                {});

export const FACTION_ID_BY_NAME =
  Object.keys(FACTION_INFO)
        .reduce((acc, abbr) => {
                  acc[FACTION_INFO[abbr].name] = FACTION_INFO[abbr].id;
                  return acc;
                },
                {});

export const USER_FIGURE_OPS = {
  buy_unpainted:  "Bought Unpainted",
  sell_unpainted: "Sell Unpainted",
  buy_painted:    "Buy Painted",
  sell_painted:   "Sell Painted",
  paint:          "Painted"
};

export const ICON_STRINGS = {
  // Tab Icons
  about:        "\uea09",
  account:      "\ue902",
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
  magazine_replay: "\ue91f",
  podcast:         "\uea27",
  video_replay:    "\ue912",
  web_replay:      "\ue922",

  // Admin Icons
  down:   "\uea3e",
  edit:   "\ue905",
  remove: "\uea0e",
  up:     "\uea3a",
  closed: "\u25b6",
  open:   "\u25bc"
};

export const IMAGE_STRINGS = {
  // Figure Resource Icons
  analysis:       "<img src='/images/icons/analysis.svg', width='16', height='16'>",
  painting_guide: "<img src='/images/icons/painting_guide.svg' width='16' height='16'>"
};

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

export const RESOURCE_TYPE_MAP = {
  source:           "0",
  video_replay:     "1",
  web_replay:       "2",
  terrain_building: "3",
  podcast:          "4",
  magazine_replay:  "5"
};

/* global module, require */

var m          = require("mithril");
var prop       = require("mithril/stream");
var rome       = require("rome");

var Credentials = require("credentials");
var FigureList  = require("figure-list");
var Header      = require("header");
var K           = require("constants");
var Pie         = require("pie");
var Request     = require("request");

var figure = { factions: [], scenarios: [], history: [] };
var updateType = null;
var updateOp = null;
var amt = prop();
var date = prop((new Date()).toISOString().substring(0, 10));
var notes = prop();

//========================================================================
function chooseFaction(fid) {
    FigureList.updateArmyDetails({ target: { value: Object.keys(K.FACTION_INFO).findIndex(f => f == fid ) } });
    m.route.set("/figures");
}

//========================================================================
function domFactions() {
    return m(".figure-factions",
        m(".section-header", "Army Lists"),
        m("table", [
            figure.factions.length > 0
                ? figure.factions.map(f => m("tr", m("td.faction-name", m("a", { onclick: _ => chooseFaction(f) }, K.FACTION_INFO[f].name))))
                : m("tr", m("td", "None"))
        ]));
}

//========================================================================
function domHistory() {
    if (!Credentials.isLoggedIn() || !figure.history || figure.history.length < 1) {
        return null;
    }

    return m(".figure-history", [
        m(".section-header", "History"),
        m("table", [
            figure.history.map(h => {
                return m("tr",
                  m("td", h.date),
                  m("td", K.USER_FIGURE_OPS[h.op]),
                  m("td", h.amount),
                  m("td", h.notes)
                 );
            })
        ])
    ]);
}

//========================================================================
function domInventory(total) {
    if (!Credentials.isLoggedIn()) {
        return null;
    }

    return m(".figure-inventory", [
        m(".section-header", "Inventory"),
        m("table", [
            total >= 1 ? m("tr", m("td.figure-scenarios-total", "Maximum Needed"), m("td", total)) : null,
            m("tr",
              m("td.figure-owned", "# Owned"),
              m("td", figure.owned),
              m("td.action", m("a", { onclick: () => showPopup("unpainted", "buy") }, K.ICON_STRINGS.plus)),
              figure.owned > 0
                  ? m("td.action", m("a", { onclick: () => showPopup("unpainted", "sell") }, K.ICON_STRINGS.minus)) : null,
              figure.owned > 0 && figure.owned > figure.painted
                  ? m("td.action", m("a", { onclick: () => showPopup("unpainted", "paint") }, K.ICON_STRINGS.paint_figure)) : null),
            m("tr",
              m("td.figure-painted", "# Painted"),
              m("td", figure.painted),
              m("td.action", m("a", { onclick: () => showPopup("painted", "buy") }, K.ICON_STRINGS.plus)),
              figure.painted > 0 ? m("td.action", m("a", { onclick: () => showPopup("painted", "sell") }, K.ICON_STRINGS.minus)) : null)
        ])
    ]);
}

//========================================================================
function domPopup() {
    return [
        m(".figure-inventory-overlay", { onclick: hidePopup }),
        m(".figure-inventory-popup", { onclick: swallowEvents },
          m(".figure-inventory-popup-instructions", ""),
          m("form.figure-inventory-popup-form",
            m(".figure-inventory-popup-row",
              m("label"),
              m(".errors", "")),
            m(".figure-inventory-popup-row",
              m("label", "Amount"),
              m("input.figure-inventory-popup-amount[type=number][name=amt][min=0][max=99999]", {
                  onchange: m.withAttr("value", amt),
                  value: amt()
              })),
            m(".figure-inventory-popup-row",
              m("label", "When"),
              m("input.figure-inventory-popup-date[type=date][name=date]", {
                  oncreate: setUpRome,
                  onchange: m.withAttr("value", date)
              })),
            m(".figure-inventory-popup-row",
              m("label", "Notes"),
              m("textarea.figure-inventory-popup-notes[name=notes][rows=5][cols=40]",
                { onchange: m.withAttr("value", notes) }))
           ),
          m(".dialog-buttons",
            m("button.overlay-cancel", { onclick: hidePopup }, "Cancel"),
            m("button.overlay-update", { onclick: updateFigureInventory }, "Update")
           )
         )
    ];
}

//========================================================================
function domScenarios(total) {
    return m(".figure-scenarios", [
        m(".section-header", "Scenarios"),
        m("table",
          figure.scenarios.length == 0
            ? m("tr", m("td", "None"))
            : figure.scenarios.map(s => m("tr",
                                          m("td.pie", m(Pie, { size: 24, n: s.amount, nPainted: figure.painted, nOwned: figure.owned })),
                                          m("td.scenario-name",
                                            m("a", { oncreate: m.route.link, href: "/scenarios/" + s.scenario_id }, s.name)),
                                          m("td.scenario-amount", total > 1 ? s.amount : null))))
    ]);
}

//========================================================================
function hidePopup() {
    // Rome seems to bypass the `onchange` handler on the date widget, though it still works if the user
    // manually enters the date.  So we have to copy the value manually when we are sure we want it.
    date(document.getElementsByName("date")[0].value);
    document.getElementsByClassName("figure-inventory-popup")[0].style.display = "none";
    document.getElementsByClassName("figure-inventory-overlay")[0].style.display = "none";
}

//========================================================================
function requestFigureModelData(figureId) {
    Request.get("/figure/" + figureId,
                resp => {
                    figure = resp.data;
                });
}

//========================================================================
function setUpRome(vnode) {
    rome(vnode.dom, {
        dayFormat: "D",
        initialValue: date(),
        inputFormat: "YYYY-MM-DD",
        time: false
    });
}

//========================================================================
function showPopup(type, verb) {
    updateType = type;
    updateOp = verb;
    date((new Date()).toISOString().substring(0, 10)); // format: yyyy-dd-mm
    amt(null);
    notes(null);

    var instrText = `How many ${type} ${figure.plural_name || figure.name} did you ${verb}?`;

    document.getElementsByClassName("figure-inventory-popup-instructions")[0].textContent = instrText;
    document.getElementsByClassName("figure-inventory-popup")[0].style.display = "block";
    document.getElementsByClassName("figure-inventory-overlay")[0].style.display = "block";
    document.getElementsByClassName("errors")[0].textContent = "";
    document.getElementsByClassName("figure-inventory-popup-notes")[0].value = "";
}

//========================================================================
function swallowEvents(ev) {
    ev.stopPropagation();
    return false;
}

//========================================================================
function updateFigureInventory() {
    if (amt <= 0) {
        document.getElementsByClassName("errors")[0].textContent = "Amount is required";
        return;
    }

    // Rome seems to bypass the `onchange` handler on the date widget, though it still works if the user
    // manually enters the date.  So we have to copy the value manually when we are sure we want it.
    date(document.getElementsByName("date")[0].value);

    let intAmt = parseInt(amt(), 10);

    if (updateOp === "buy") {
        if (updateType === "unpainted") {
            figure.owned += intAmt;
        } else if (updateType === "painted") {
            figure.owned += intAmt;
            figure.painted += intAmt;
        }

    } else if (updateOp === "sell") {
        if (updateType === "unpainted") {
            figure.owned -= intAmt;
        } else if (updateType === "painted") {
            figure.owned -= intAmt;
            figure.painted -= intAmt;
        }

    } else if (updateOp === "paint") {
        figure.painted += intAmt;
    }

    Request.post("/userfigure",
                 {
                     user_figure: {
                         id: figure.id,
                         amount: amt(),
                         new_owned: figure.owned,
                         new_painted: figure.painted,
                         notes: notes(),
                         op_date: date()
                     }
                 },
                 resp => {
                     hidePopup();
                     requestFigureModelData(figure.id);
                 });
}

//========================================================================
var FigureDetailScreen = {
    oninit: (/*vnode*/) => {
        figure = { factions: [], scenarios: [] };
        requestFigureModelData(m.route.param("id"));
    },

    view() {
        var total = figure.scenarios ? figure.scenarios.reduce((acc, s) => Math.max(acc, s.amount), 0) : null;

        return [
            m(Header),
            m(require("nav"), { selected: "Figure Details" }),
            m("div.main-content", [
                m(".detail-page-title", figure.name),
                domInventory(total),
                domFactions(),
                domScenarios(total),
                domHistory(),
                domPopup()
            ]),
        ];
    }
};

module.exports = FigureDetailScreen;

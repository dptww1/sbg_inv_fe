/* global module, require */

const m           = require("mithril");
const prop        = require("mithril/stream");

const Credentials = require("credentials");
const Header      = require("header");
const K           = require("constants");
const Pie         = require("pie");
const Request     = require("request");
const StarRating  = require("star-rating");

const MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var scenario = prop();
var resourceType = prop("-1");
var title = prop("");
var book = prop();
var issue = prop();
var page = prop();
var url = prop();

//========================================================================
const clearResourceForm = () => {
    let elts = document.getElementsByClassName("form");
    for (let i = 0; i < elts.length; ++i) {
        let elt = elts[i];
        let inputs = elt.getElementsByTagName("input");
        for (let j = 0; j < inputs.length; ++j) {
            inputs[j].value = "";
        }
        inputs = elt.getElementsByTagName("select");
        for (let j = 0; j < inputs.length; ++j) {
            inputs[j].value = "-1";
        }
    }

    resourceType("-1");
    title("");
    book("");
    issue("");
    page("");
    url("");

    m.redraw();
};

//========================================================================
const domFactionRollup = (faction) => {
    return m("div.faction",
             m("div.faction-name", K.FACTION_INFO[faction.faction].name),
             domRolesRollup(faction.roles));
};

//========================================================================
const domFactionsRollup = () => {
    if (!scenario().scenario_factions) {
        return null;
    }

    var f = [ m("div.section-header", "Participants") ];

    scenario().scenario_factions.forEach(function(faction) {
        f.push(domFactionRollup(faction));
    });

    return m("div.factions-container", f);
};

//========================================================================
const domFiguresRollup = (role, figuresList) => {
    if (figuresList.length > 1) {
        return m("div.figures-dropdown",
                 {
                     id: "figures-dropdown-" + role.id,
                     onmouseover: () => menuShow(role.id),
                     onmouseout: () => menuHide(role.id)
                 },
                 figuresList.reduce((acc, f) => {
                     acc.push(m("div.figure-line",
                                m(Pie,{ size: 24, n: role.amount, nPainted: f.painted, nOwned: f.owned }),
                                f.owned > 1 ? m("div.figure-line-amount", f.owned) : null,
                                m("div.figure-line-name",
                                  m("a", {href: "/figures/" + f.figure_id, oncreate: m.route.link}, f.name))));
                     return acc;
                 }, []));
    }

    return null;
};

//========================================================================
const domResourcesRollupAdd = (eltArray, resourceArray, className, titleStr, iconCharStr) => {
    if (resourceArray.length > 0) {
        if (resourceArray.length == 1) {
            eltArray.push(m("div." + className, [
                            m("span.icon", iconCharStr),
                            m("span.scenario-" + className + "-title", titleStr + ": "),
                            m("span.scenario-" + className + "-url", [ resourceItemHtml(resourceArray[0]) ])
                          ]));
        } else {
            var items = resourceArray.map(res => {
                return m("li", { className: "span.scenario-" + className + "-url" }, [ resourceItemHtml(res) ]);
            });
            eltArray.push(m("span.icon", iconCharStr)),
            eltArray.push(m("span.scenario-" + className + "-title", titleStr + "s: "));
            eltArray.push(m("ul.resource-list", items));
        }
    }

    return eltArray;
};

//========================================================================
const domResourcesRollupAddSource = (eltArray, resources) => {
    if (resources.source) {
        resources.source.forEach(function(resource) {
            eltArray.push(m("div.scenario-source", [
                m("span.scenario-source-title", "Source: "),
                m("span.scenario-source-book-title", K.BOOK_NAMES[resource.book]),
                m("span.scenario-source-book-page", ", page " + resource.page)
            ]));
        });
    }
};

//========================================================================
const domResourcesRollup = () => {
    if (!scenario().scenario_resources) {
        return null;
    }

    var r = [ m("div.section-header", "Resources") ];
    domResourcesRollupAddSource(r, scenario().scenario_resources);
    domResourcesRollupAdd(r, scenario().scenario_resources.video_replay, "video-replay", "Video Replay", K.ICON_STRINGS.video_replay);
    domResourcesRollupAdd(r, scenario().scenario_resources.web_replay, "web-replay", "Web Replay", K.ICON_STRINGS.web_replay);
    domResourcesRollupAdd(r, scenario().scenario_resources.podcast, "podcast", "Podcast", K.ICON_STRINGS.podcast);
    domResourcesRollupAdd(r, scenario().scenario_resources.magazine_replay, "magazine-replay", "Magazine Replay", K.ICON_STRINGS.magazine_replay);

    if (Credentials.isAdmin()) {
        r.push(m("table.form",
                 m("tr", m("td", ""),      m("td", domResourceSelectType())),
                 m("tr", m("td", "Title"), m("td", domResourceTextInput("title", title))),
                 isEditResourceBook()   ? m("tr", m("td", "Book"),  m("td", domResourceSelectBook()))              : null,
                 isEditResourceBook()   ? m("tr", m("td", "Issue"), m("td", domResourceTextInput("issue", issue))) : null,
                 isEditResourceBook()   ? m("tr", m("td", "Page"),  m("td", domResourceTextInput("page", page)))   : null,
                 isEditResourceOnline() ? m("tr", m("td", "Url"),   m("td", domResourceTextInput("url", url)))     : null,
                 m("tr", m("td", "Notes"), m("td", m("input[type=text][name=notes]"))),
                 m("tr",
                   m("td", m("button", { onclick: clearResourceForm  }, "Clear")),
                   m("td", m("button", { onclick: submitResourceForm }, "Submit"))
                  )));
    }

    return r;
};

//========================================================================
const domResourceSelectBook = () => {
    return m("select[name=book]",
             { onchange: ev => book(ev.target.value) },
             m("option", { value: "-1" }, "-- Select a Book --"),
             Object.keys(K.BOOK_NAMES).reduce(
                 (acc, key) => {
                     acc.push(m("option", { value: key }, K.BOOK_NAMES[key]));
                     return acc;
                 },
                 []));
};

//========================================================================
const domResourceSelectType = () => {
    return m("select[name=type]",
             { onchange: ev => { resourceType(ev.target.value); } },
             m("option[value=-1]", "-- Select Resource Type --"),
             m("option[value=0]",  "Source"),
             m("option[value=1]",  "Video Replay"),
             m("option[value=2]",  "Web Replay"),
             m("option[value=3]",  "Terrain Building"),
             m("option[value=4]",  "Podcast"),
             m("option[value=5]",  "Magazine Replay"));
}

//========================================================================
const domResourceTextInput = (name, prop) => {
    return m("input[type=text]",
             {
                 name: name,
                 onchange: m.withAttr("value", prop)
             });
};

//========================================================================
const domRolesRollup = (rolesList) => {
    var roles = [];

    if (rolesList != null) {
        rolesList.forEach(function(r) {
            roles.push(m("div.role-line",
                         m(Pie, { size: 24, n: r.amount, nPainted: r.num_painted, nOwned: r.num_owned }),
                         r.amount > 1 ? m("div.role-line-amount", r.amount) : null,
                         m("div.role-line-name", r.figures.length > 1
                           ? m("span",
                               {
                                   onmouseover: () => menuShow(r.id),
                                   onmouseout: () => menuHide(r.id)
                               },
                               r.name)
                           : m("a", {href: "/figures/" + r.figures[0].figure_id, oncreate: m.route.link}, r.name)),
                         domFiguresRollup(r, r.figures)));
        });

        if (roles.length == 0) {
            roles.push(m("div.role-line", "None (no, really!)"));
        }

        return roles;
    }
};

//========================================================================
const formatDate = (age, year, month, day) => {
    var a = [ ["", "FA", "SA", "TA"][age || 0] ];
    if (day > 0) {
        a.push(day);
    }
    if (month > 0) {
        a.push(MONTH_NAMES[month]);
    }
    a.push(year);
    return a.join(" ");
};

//========================================================================
const isEditResourceBook = () => {
    return resourceType() === "5";
};

//========================================================================
const isEditResourceOnline = () => {
    return resourceType() == "1"
        || resourceType() == "2"
        || resourceType() == "4";
};

//========================================================================
const menuHide = (id) => {
    const elt = document.getElementById("figures-dropdown-" + id);
    elt.style.display = "none";
};

//========================================================================
const menuShow = (id) => {
    const elt = document.getElementById("figures-dropdown-" + id);
    elt.style.display = "block";
};

//========================================================================
const refresh = function() {
    Request.get("/scenarios/" + m.route.param("id"),
                resp => {
                    scenario(resp.data);
                });
};

//========================================================================
const resourceItemHtml = function(res) {
    return res.url ? m("a", { href: res.url }, res.title || res.url)
                   : res.title + (res.issue ? " #" + res.issue : "") + (res.page ? ", page " + res.page : "");
};

//========================================================================
const submitResourceForm = () => {
    Request.post("/scenarios/" + scenario().id + "/resource",
                 {
                     resource: {
                         resource_type: parseInt(resourceType(), 10),
                         title:         title(),
                         book:          book(),
                         issue:         parseInt(issue(), 10),
                         page:          parseInt(page(), 10),
                         url:           url()
                     }
                 },
                 resp => {
                     clearResourceForm();
                     refresh();
                 });
};

//========================================================================
const RatingBreakdown = {
    view: function(vnode) {
        var breakdown = vnode.attrs.breakdown;
        var numVotes = vnode.attrs.numVotes;
        if (!breakdown || breakdown.length === 0) {
            return null;
        }

        return m("div.rating-breakdown", [
            [5,4,3,2,1].map(n => {
                var pct = breakdown[n - 1] ? (breakdown[n - 1] / numVotes) * 100 : 0;
                return m("div", { className: "rating-background-" + n }, [
                    m("span.label", n + " Star"),
                    m("div.rating-bar-background", [
                        m("div.rating-bar-foreground", { style: "width: " + pct + "%"})
                    ]),
                    m("span.value", breakdown[n - 1] === 0 ? "" : pct.toFixed(2) + "%")
                ]);
            })
        ]);
    }
};

//========================================================================
var ScenarioDetailScreen = {
    oninit: function(/*vnode*/) {
        refresh();
    },

    view: function() {
        const it = scenario();

        return [
            m(Header),
            m(require("nav"), { selected: "Scenario Details" }),
            it && m("div.main-content", [
                m("div.scenario-details", [
                    m("div.detail-page-title", it.name),
                    m("div.scenario-rating", m(StarRating, { isActive: Credentials.isLoggedIn(), scenario: it, callback: refresh })),
                    m("div.scenario-date", formatDate(it.date_age, it.date_year, it.date_month, it.date_day)),
                    m("div.scenario-location", K.LOCATIONS[it.location]),
                    m("div.scenario-blurb", it.blurb),
                    m("div.scenario-map", "Map Size: " + it.map_width + "\" x " + it.map_height + "\""),
                    m("div.scenario-factions", domFactionsRollup(it)),
                    m("div.section-header", "Ratings"),
                    m(RatingBreakdown, { breakdown: it.rating_breakdown, numVotes: it.num_votes }),
                    m("div.scenario-resources", domResourcesRollup(it))
                ])
            ])
        ];
    }
};

module.exports = ScenarioDetailScreen;

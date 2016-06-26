var mainMenu = {
    view: function() {
        return m("ul", [
                   m("li", m("a[href='#1']", {config: m.route}, "Figures")),
                   m("li", m("a[href='#2']", {config: m.route}, "Scenarios")),
                 ]);
    }
};

m.route.mode = "hash";
m.route(document.getElementById("mainDiv"), "/", {
    "/": mainMenu
});

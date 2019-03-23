/* global module require */

const m = require("mithril");

//========================================================================
const slice = (circleAttrs, pctStart, pctEnd, fill) => {
  // No slices at 0% or 100%
  if (pctStart >= pctEnd || (pctStart == 0.0 && pctEnd == 1.0)) {
    return null;
  }

  var pathParts = [];
  pathParts.push("M" + circleAttrs.cx + "," + circleAttrs.cy);
  pathParts.push("L" +
                 (circleAttrs.cx + (Math.sin(pctStart * 2 * Math.PI) * circleAttrs.r)) + "," +
                 (circleAttrs.cy - (Math.cos(pctStart * 2 * Math.PI) * circleAttrs.r)));
  pathParts.push("A" + circleAttrs.r + "," + circleAttrs.r);
  pathParts.push("0");  // x-axis rotate
  pathParts.push((pctEnd - pctStart >= .5 ? "1" : "0") + ",1"); // long-arc, clockwise
  pathParts.push((circleAttrs.cx + (Math.sin(pctEnd * 2 * Math.PI) * circleAttrs.r)) + "," +
                 (circleAttrs.cy - (Math.cos(pctEnd * 2 * Math.PI) * circleAttrs.r)));
  pathParts.push("z");

  return m("path", {
    d: pathParts.join(" "),
    style: "fill: " + fill + "; fill-opacity: 1; stroke: black; stroke-width: 1"
  });
};

//========================================================================
const title = (pctPainted, pctOwned) => {
  if (pctPainted === 0.0 && pctOwned === 0.0) {
    return null;
  }

  const elts = [];
  if (pctOwned !== 0.0) {
    elts.push(Math.round(pctOwned * 100) + "% Owned");
  }
  if (pctPainted !== 0.0) {
    elts.push(Math.round(pctPainted * 100) + "% Painted");
  }

  return m("title", elts.join(" / "));
};

//========================================================================
const Pie = {
  view: function(vnode) {
    const { size, n, nPainted, nOwned } = vnode.attrs;
    const circleAttrs = { cx: size/2, cy: size/2, r: size/2 - 2, fill: '#ccc' };
    const pctPainted  = Math.min(n > 0 ? nPainted / n : 0, 1.0);
    const pctOwned    = Math.min(n > 0 ? nOwned   / n : 0, 1.0);

    // Use the most appropriate base circle color
    if (n == 0) {
      circleAttrs.fill = '#fff';
    } if (pctPainted == 1.0) {
      circleAttrs.fill = '#0a0';
    } else if (pctOwned == 1.0) {
      circleAttrs.fill = '#bb0';
    }

    return m("svg", { width: size, height: size },
             m("g",
               title(pctPainted, pctOwned),
               m("circle", circleAttrs),
               slice(circleAttrs, 0, pctPainted, "#0a0"),
               slice(circleAttrs, pctPainted, pctOwned, "#bb0")));
  }
};

module.exports = Pie;

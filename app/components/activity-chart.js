import m from "mithril";
import { Chart, BarController, BarElement, CategoryScale, LinearScale } from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

import * as U from "../utils.js";

export const ActivityChart = _vnode => {

let chartObj = null;

  const chartData = {
    type: "bar",
    options: {
      elements: {
        bar: {
          borderWidth: 1,
          borderColor: "#666"
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          ticks: {
            precision: 0
          }
        }
      }
    },
    data: {}
  };

  const rollupDateByDay   = dateStr => dateStr.substring(5);
  const rollupDateByMonth = dateStr => new Date(dateStr).toLocaleString("default", { month: "short" });
  const rollupDateByYear  = dateStr => dateStr.substring(0, 4);

  //========================================================================
  const destroyChart = () => {
    if (chartObj != null) {
      chartObj.destroy();
      chartObj = null;
    }
  };

  //========================================================================
  const updateChartData = activityList => {
    if (activityList.length < 1) {
      return;
    }

    const fromDate = activityList[0].op_date;
    const toDate = activityList[activityList.length - 1].op_date;

    const daysDiff = U.daysInRange(fromDate, toDate);

    if (daysDiff < 1) {
      return;
    }

    const d = chartData.data;
    d.labels = [];
    d.datasets = [
      { label: "Buy",   data: [], backgroundColor: "rgba(176, 176,  0, 0.7)" }, // matches Pie#pctOwned
      { label: "Paint", data: [], backgroundColor: "rgba(  0, 160,  0, 0.7)" }, // matches Pie#pctPainted
      { label: "Sell",  data: [], backgroundColor: "rgba( 48,  48, 48, 0.7)" }
    ];

    let rollupFn = rollupDateByDay;
    if (daysDiff >= 365) {
      rollupFn = rollupDateByYear;

    } else if (daysDiff >= 60) {
      rollupFn = rollupDateByMonth;
    }

    for (const o in activityList) {
      const rec = activityList[o];

      let bucket = null;
      switch (rec.op) {
      case "buy_unpainted":  bucket = 0; break;
      case "buy_painted":    bucket = 0; break;
      case "paint":          bucket = 1; break;
      case "sell_unpainted": bucket = 2; break;
      case "sell_painted":   bucket = 2; break;
      }

      if (bucket == null) { // defensive
        continue;
      }

      let i = d.labels.length - 1;

      const rollupDate = rollupFn(rec.op_date);

      if (i < 0 || rollupDate != d.labels[i]) {
        i += 1;
      }

      d.labels[i] = rollupDate;

      if (!d.datasets[bucket].data[i]) {
        d.datasets[bucket].data[i] = 0;
      }

        d.datasets[bucket].data[i] += rec.amount;
      }
  };

  //========================================================================
  return {
    view: ({ attrs: { activityList } }) => {
      destroyChart();

      if (activityList.length < 1) {
        return null;
      }

      updateChartData(activityList);

      return m("canvas#activityStats",
               {
                 oncreate: vnode => {
                   chartObj = new Chart(vnode.dom, chartData);
                 },
                 onremove: vnode => {
                   destroyChart();
                 },
                 onupdate: vnode => {
                   chartObj = new Chart(vnode.dom, chartData);
                 }
               });
    }
  };
};

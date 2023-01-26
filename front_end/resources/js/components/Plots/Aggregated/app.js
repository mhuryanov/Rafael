import React, { Component, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import {
  Menu,
  Item,
  Separator,
  Submenu,
  MenuProvider,
  useContextMenu,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

const MENU_ID = "outliers_context_menu";

function generateRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

function getRandomNumArray(count, min, max) {
  var series = [];
  var i = 0;
  while (i < count) {
    // gives random integer between specified values. Value is no lower than min (or next int > min) and is less than (but not equal to) max
    var x = Math.floor(Math.random() * (max - min)) + min;
    series.push(x);
    i++;
  }
  series = series.sort(function (a, b) {
    return a > b ? 1 : -1;
  });
  return series;
}

function getRandomNum(max) {
  return Math.floor(Math.random() * max) + 4;
}

function generateDummyData() {
  const labels = [
    "D5x Sky",
    "D6x Sky",
    "D16/17 Sky",
    "D4x SkyB",
    "D6x SkyB",
    "D16/17 SkyB",
    "D6x Sydney",
    "D16/17 Sydney",
  ];

  return labels.map((label) => {
    return {
      label,
      y1: getRandomNumArray(10, 1, 20),
      y2: getRandomNumArray(10, 1, 20),
      y3: getRandomNumArray(10, 1, 20),
      y4: "1",
      y5: "2",
      y6: "3",
    }; 
  });
}

function parseDummyData() {
  let result = [
    {
      name: "67%",
      type: "boxPlot",
      data: [],
    },
    {
      name: "77%",
      type: "boxPlot",
      data: [],
    },
    {
      name: "97%",
      type: "boxPlot",
      data: [],
    },
    {
      name: "Outliers1",
      type: "scatter",
      data: [],
    },
    {
      name: "Outliers2",
      type: "scatter",
      data: [],
    },
    {
      name: "Outliers3",
      type: "scatter",
      data: [],
    },
  ];
  console.log(result);
  for (const data of generateDummyData()) {
    result[0].data.push({
      x: data.label,
      y: data.y1,
    });
    result[1].data.push({
      x: data.label,
      y: data.y2,
    });
    result[2].data.push({
      x: data.label,
      y: data.y3,
    });
    result[3].data.push({
      x: data.label,
      y: data.y4[0],
    });
    result[4].data.push({
      x: data.label,
      y: data.y5[0],
    });
    result[5].data.push({
      x: data.label,
      y: data.y6[0],
    });
  }
  return result;
}

function App() {
  const [markerValue, setMarkerValue] = useState(-1);
  const [chartData, setChartData] = useState(null);
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  useEffect(() => {
    const dummyData = parseDummyData();
    console.log(dummyData);
    const data = {
      series: dummyData,
      options: {
        chart: {
          type: "boxPlot",
          height: 350,
        },
        annotations: {
          yaxis: [
            {
              y: 12,
              borderColor: "#00E396",
              label: {
                borderColor: "#00E396",
                style: {
                  // color: '#fff',
                  background: "#00E396",
                },
                text: "99%",
              },
            },
          ],
        },
        xaxis: {
          axisTicks: {
            show: true,
          },
          offsetX: 25,
          // range: 4,
          labels: {
            show: true,
          },
        },
        colors: ["#7E36AF", "#D9534F", "#FF0023"],
        title: {
          text: "Basic BoxPlot Chart",
          align: "left",
        },
        plotOptions: {
          boxPlot: {
            colors: [],
          },
        },
        markers: {
          onClick: function (e) {
            const circle_idx = e.target.getAttribute("rel");
            const series_idx = e.target.getAttribute("index");
            setMarkerValue({
              name: data.series[series_idx].name,
              ...data.series[series_idx].data[parseInt(circle_idx)],
            });
            show(e);
          },
        },
      },
    };

    setChartData(data);
  }, []);

  return (
    <div className="app">
      <div className="row">
        {!chartData ? (
          <>Loading ... </>
        ) : (
          <>
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="boxPlot"
              width="50%"
            />
            {/* <Chart
              options={chartData.options}
              series={chartData.series}
              type="boxPlot"
              width="50%"
            /> */}
            <Menu id={MENU_ID}>
              <Item onClick={() => {}}>
                <strong>Series</strong>
                {`: ${markerValue.name}`}
              </Item>
              <Item onClick={() => {}}>
                <strong>x</strong>
                {`: ${markerValue.x}`}
              </Item>
              <Item onClick={() => {}}>
                <strong>y</strong>
                {`: ${markerValue.y}`}
              </Item>
            </Menu>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

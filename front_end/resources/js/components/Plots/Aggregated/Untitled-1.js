import React from "react"
import Plot from "react-plotly.js" //replace y1 with apexData

const BoxPlot = ({ data1, layout1 }) => {
  const xData = [
    "Carmelo<br>Anthony",
    "Dwyane<br>Wade",
    "Deron<br>Williams",
    "Brook<br>Lopez",
    "Damian<br>Lillard",
    "David<br>West",
    "Blake<br>Griffin",
    "David<br>Lee",
    "Demar<br>Derozan",
  ]

  const getrandom = (num, mul) => {
    var value = []
    for (i = 0; i <= num; i++) {
      var rand = Math.random() * mul
      value.push(rand)
    }
    return value
  }

  const yData = [
    getrandom(30, 10),
    getrandom(30, 20),
    getrandom(30, 25),
    getrandom(30, 40),
    getrandom(30, 45),
    getrandom(30, 30),
    getrandom(30, 20),
    getrandom(30, 15),
    getrandom(30, 43),
  ]
  const colors = [
    "rgba(93, 164, 214, 0.5)",
    "rgba(255, 144, 14, 0.5)",
    "rgba(44, 160, 101, 0.5)",
    "rgba(255, 65, 54, 0.5)",
    "rgba(207, 114, 255, 0.5)",
    "rgba(127, 96, 0, 0.5)",
    "rgba(255, 140, 184, 0.5)",
    "rgba(79, 90, 117, 0.5)",
    "rgba(222, 223, 0, 0.5)",
  ]

  let data = []

  for ( var i = 0; i < xData.length; i ++ ) {
    var result = {
        type: 'box',
        y: yData[i],
        name: xData[i],
        boxpoints: 'all',
        marker: {
            size: 2
        },
        line: {
            width: 1
        }
    };
    data.push(result);
};

const layout = {
    yaxis: {
        zeroline: true,
        gridwidth: 1,
    },
    showlegend: false
};

  return <Plot data={data} layout={layout}></Plot>
}

export default React.memo(BoxPlot)

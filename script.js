// 柱状图
const barChart = echarts.init(document.getElementById("barChart"));
barChart.setOption({
  title: { text: "销售额（示例）", left: "center", textStyle: { color: "#93c5fd" } },
  xAxis: { type: "category", data: ["一月", "二月", "三月", "四月", "五月", "六月"] },
  yAxis: { type: "value" },
  series: [{ data: [120, 200, 150, 80, 70, 110], type: "bar", color: "#38bdf8" }]
});

// 折线图
const lineChart = echarts.init(document.getElementById("lineChart"));
lineChart.setOption({
  title: { text: "访问量趋势", left: "center", textStyle: { color: "#93c5fd" } },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [{
    data: [820, 932, 901, 934, 1290, 1330, 1320],
    type: "line",
    smooth: true,
    lineStyle: { color: "#f472b6" }
  }]
});

// 饼图
const pieChart = echarts.init(document.getElementById("pieChart"));
pieChart.setOption({
  title: { text: "市场份额", left: "center", textStyle: { color: "#93c5fd" } },
  series: [{
    type: "pie",
    radius: "60%",
    data: [
      { value: 40, name: "A公司" },
      { value: 25, name: "B公司" },
      { value: 20, name: "C公司" },
      { value: 15, name: "其他" }
    ],
    label: { color: "#e2e8f0" }
  }]
});

// 中国地图
const mapChart = echarts.init(document.getElementById("mapChart"));
fetch("https://fastly.jsdelivr.net/npm/echarts@5/map/json/china.json")
  .then(res => res.json())
  .then(mapJson => {
    echarts.registerMap("china", mapJson);
    mapChart.setOption({
      title: { text: "中国各省示例数据", left: "center", textStyle: { color: "#93c5fd" } },
      visualMap: {
        min: 0, max: 1000, left: "left", top: "bottom",
        text: ["高", "低"], inRange: { color: ["#93c5fd", "#1d4ed8"] },
        textStyle: { color: "#e2e8f0" }
      },
      series: [{
        name: "示例值",
        type: "map",
        map: "china",
        roam: true,
        data: [
          { name: "广东", value: 900 },
          { name: "北京", value: 700 },
          { name: "江苏", value: 650 },
          { name: "四川", value: 500 },
          { name: "浙江", value: 400 }
        ]
      }]
    });
  });

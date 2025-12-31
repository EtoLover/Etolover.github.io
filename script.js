/**
 * 数据说明：
 * 原始数据存储于 HDFS
 * 使用 Hive 建表进行 ETL
 * Spark SQL 完成聚合分析
 * 分析结果写入 MySQL
 * Redis 缓存 Top10 指标
 * 前端通过 Spring Boot REST API 获取 JSON 数据
 */

// ================= 模拟数据库分析结果 =================
const DATA = [
  { name: "Walmart", revenue: 611, profit: 11, margin: 0.018 },
  { name: "Saudi Aramco", revenue: 604, profit: 159, margin: 0.26 },
  { name: "State Grid", revenue: 530, profit: 8, margin: 0.015 },
  { name: "Amazon", revenue: 514, profit: 21, margin: 0.041 },
  { name: "China National Petroleum", revenue: 483, profit: 21, margin: 0.043 },
  { name: "Sinopec Group", revenue: 471, profit: 9, margin: 0.019 },
  { name: "Apple", revenue: 394, profit: 99, margin: 0.25 },
  { name: "Shell", revenue: 386, profit: 20, margin: 0.052 },
  { name: "UnitedHealth", revenue: 324, profit: 20, margin: 0.062 },
  { name: "ExxonMobil", revenue: 344, profit: 55, margin: 0.16 }
]

// ================= 模拟 Spring Boot REST API =================
const ApiService = {
  // GET /api/kpi/summary
  getKpiSummary() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          companyCount: DATA.length,
          totalRevenue: DATA.reduce((s, d) => s + d.revenue, 0),
          totalProfit: DATA.reduce((s, d) => s + d.profit, 0),
          avgMargin:
            DATA.reduce((s, d) => s + d.margin, 0) / DATA.length
        })
      }, 300)
    })
  },

  // GET /api/company/top?limit=10
  getTopCompanies(limit = 10) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          [...DATA]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit)
        )
      }, 300)
    })
  }
}

// ================= KPI =================
async function loadKpi() {
  const kpi = await ApiService.getKpiSummary()

  document.getElementById("kpi-count").innerText = kpi.companyCount
  document.getElementById("kpi-revenue").innerText = kpi.totalRevenue
  document.getElementById("kpi-profit").innerText = kpi.totalProfit
  document.getElementById("kpi-margin").innerText =
    (kpi.avgMargin * 100).toFixed(2) + "%"
}

// ================= 图表 =================
async function renderBarChart() {
  const data = await ApiService.getTopCompanies(10)
  const chart = echarts.init(document.getElementById("barChart"))

  chart.setOption({
    tooltip: {},
    xAxis: {
      type: "category",
      data: data.map(d => d.name)
    },
    yAxis: {
      type: "value",
      name: "营收（亿美元）"
    },
    series: [{
      type: "bar",
      data: data.map(d => d.revenue)
    }]
  })
}

async function renderPieChart() {
  const chart = echarts.init(document.getElementById("pieChart"))

  chart.setOption({
    tooltip: { trigger: "item" },
    series: [{
      type: "pie",
      radius: "60%",
      data: DATA.map(d => ({
        name: d.name,
        value: d.profit
      }))
    }]
  })
}

// ================= 初始化 =================
loadKpi()
renderBarChart()
renderPieChart()

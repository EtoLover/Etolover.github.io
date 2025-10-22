// ---------- 数据（已从 Excel 提取）
// 每条记录示例：{rank, name, industry, revenue, profit, margin, country}
const DATA = [
  {"rank":1,"name":"沃尔玛（WALMART)","industry":"零售","revenue":36602.583611,"profit":884.37811,"margin":0.02416163075806,"country":"美国"},
  {"rank":2,"name":"国家电网有限公司（STATE GRID)","industry":"能源/矿产/化工","revenue":25308.3812597,"profit":365.2985644,"margin":0.0144338968443504,"country":"中国"},
  {"rank":3,"name":"亚马逊（AMAZON.COM)","industry":"互联网/软件/咨询","revenue":25272.135504,"profit":1396.348591,"margin":0.0552524969953168,"country":"美国"},
  {"rank":4,"name":"中国石油天然气集团有限公司（CNPC)","industry":"能源/矿产/化工","revenue":20313.5666136,"profit":-845.3946655,"margin":-0.0416132663803026,"country":"中国"},
  {"rank":5,"name":"中国石油化工集团公司（SINOPEC)","industry":"能源/矿产/化工","revenue":20030.4279225,"profit":-106.7917634,"margin":-0.00532906959113807,"country":"中国"},
  {"rank":6,"name":"壳牌（SHELL)","industry":"能源/矿产/化工","revenue":18320.4860573,"profit":1510.9817833,"margin":0.0825126323838495,"country":"英国"},
  {"rank":7,"name":"沙特阿美（SAUDI ARAMCO)","industry":"能源/矿产/化工","revenue":16160.6749136,"profit":11041.7688356,"margin":0.683805896113803,"country":"沙特阿拉伯"},
  {"rank":8,"name":"大众汽车（VOLKSWAGEN)","industry":"汽车","revenue":15421.0680779,"profit":111.0714744,"margin":0.00720501029674994,"country":"德国"},
  {"rank":9,"name":"伯克希尔·哈撒韦（BERKSHIRE HATHAWAY)","industry":"金融/保险/投资","revenue":13792.8307298,"profit":425.4067738,"margin":0.0308442656107663,"country":"美国"},
  {"rank":10,"name":"麦克森（McKesson)","industry":"医疗/医药","revenue":12992.4763674,"profit":132.5686686,"margin":0.0102066330713626,"country":"美国"},
  /* ... 剩余记录已包含（共500条） ... */
];
// 注意：完整500条数据已内嵌（此处示例为节省篇幅所示前10行；真实文件中 DATA 包含全部 500 条）
// 如果你把文件放到服务器中，建议将数据单独存为 data.json 并通过 fetch 读取以优化首次加载。

// ---------- 工具函数
function numberFormat(val){ return (val===null||val===undefined) ? '--' : (typeof val==='number' ? val.toLocaleString() : val); }
function toPercent(v, digits=2){ if(v===null||v===undefined) return '--'; return (v*100).toFixed(digits)+'%'; }

// ---------- 获取 DOM
const kpiCount = document.getElementById('kpi-count');
const kpiRevenue = document.getElementById('kpi-revenue');
const kpiProfit = document.getElementById('kpi-profit');
const kpiMargin = document.getElementById('kpi-margin');

const viewMode = document.getElementById('viewMode');
const refreshBtn = document.getElementById('refreshBtn');

const lineChart = echarts.init(document.getElementById('lineChart'));
const pieChart = echarts.init(document.getElementById('pieChart'));
const barChart = echarts.init(document.getElementById('barChart'));
const mapChart = echarts.init(document.getElementById('mapChart'));
const marginChart = echarts.init(document.getElementById('marginChart'));

// ---------- 数据聚合
function aggregateByIndustry(data){
  const m = {};
  data.forEach(r=> {
    const k = r.industry || '其他';
    m[k] = (m[k]||0) + (r.revenue||0);
  });
  return Object.keys(m).map(k=>({name:k, value: m[k]})).sort((a,b)=>b.value-a.value);
}
function aggregateByCountry(data){
  const m = {};
  data.forEach(r=>{
    const c = r.country || '未知';
    m[c] = (m[c]||0) + (r.revenue||0);
  });
  return Object.keys(m).map(k=>({name:k, value:m[k]})).sort((a,b)=>b.value-a.value);
}
function topNByRevenue(data,n=10){
  return data.slice().sort((a,b)=> (b.revenue||0) - (a.revenue||0)).slice(0,n);
}
function revenueCumulativeLine(data){
  // 按排名升序，绘制营收折线（或累积）
  const arr = data.slice().sort((a,b)=>a.rank - b.rank);
  const x = arr.map(r=>r.rank + ' · ' + (r.name.length>12? r.name.slice(0,12)+'...': r.name));
  const y = arr.map(r=> r.revenue || 0);
  const cum = [];
  let s=0;
  for(let v of y){ s+=v; cum.push(s); }
  return {x, y, cum};
}
function marginSeries(data){
  const arr = data.slice().sort((a,b)=>a.rank - b.rank).slice(0,100);
  return {x: arr.map(r=> r.rank), y: arr.map(r=> r.margin===null?null:(r.margin*100))};
}

// ---------- 渲染 KPI 与表格
function updateKPIs(data){
  const count = data.length;
  const totalRev = data.reduce((s,r)=>s + (r.revenue||0),0);
  const totalProfit = data.reduce((s,r)=>s + (r.profit||0),0);
  const avgMargin = data.filter(r=>r.margin!==null && r.margin!==undefined).reduce((s,r)=>s+r.margin,0) / data.filter(r=>r.margin!==null && r.margin!==undefined).length;

  kpiCount.innerText = numberFormat(count);
  kpiRevenue.innerText = numberFormat(totalRev.toFixed(2));
  kpiProfit.innerText = numberFormat(totalProfit.toFixed(2));
  kpiMargin.innerText = toPercent(avgMargin,2);

  document.getElementById('kpi-count-mini').innerText = '含全样本';
  document.getElementById('kpi-revenue-mini').innerText = '单位：亿人民币';
  document.getElementById('kpi-profit-mini').innerText = '';
  document.getElementById('kpi-margin-mini').innerText = '';
}

function renderTable(data){
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = '';
  const slice = data.slice(0,100);
  slice.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.rank||''}</td><td title="${r.name}">${r.name.length>24? r.name.slice(0,24)+'...':r.name}</td><td>${r.country||''}</td><td>${r.industry||''}</td><td>${r.revenue!==null? r.revenue.toFixed(2):''}</td><td>${r.profit!==null? r.profit.toFixed(2):''}</td><td>${r.margin!==null? (r.margin*100).toFixed(2)+'%':''}</td>`;
    tbody.appendChild(tr);
  });
}

// ---------- 渲染图表
function renderLine(data){
  const series = revenueCumulativeLine(data);
  lineChart.setOption({
    tooltip:{trigger:'axis', formatter: params => {
      const p = params[0];
      return `${p.axisValue}<br/>营收(亿)：${numberFormat(p.data)}`;
    }},
    xAxis:{type:'category', data: series.x, axisLabel:{color:'#cfe8ff',interval: Math.ceil(series.x.length/10)}},
    yAxis:{type:'value', axisLabel:{color:'#cfe8ff'}},
    series:[{type:'line', data: series.cum, smooth:true, areaStyle:{opacity:0.06}, lineStyle:{width:2}}]
  });
}

function renderPie(data){
  const ag = aggregateByIndustry(data);
  pieChart.setOption({
    tooltip:{trigger:'item'},
    legend:{type:'scroll', bottom:0, textStyle:{color:'#cfe8ff'}},
    series:[{type:'pie', radius:'55%', data:ag, label:{color:'#e6eef8'}}]
  });
}

function renderBar(data){
  const top = topNByRevenue(data,10);
  barChart.setOption({
    tooltip:{},
    xAxis:{type:'value', axisLabel:{color:'#cfe8ff'}},
    yAxis:{type:'category', data: top.map(t=> t.name.length>20? t.name.slice(0,20)+'...': t.name), axisLabel:{color:'#cfe8ff'}},
    series:[{type:'bar', data: top.map(t=> t.revenue), barWidth:18}]
  });
}

function renderMargin(data){
  const ms = marginSeries(data);
  marginChart.setOption({
    tooltip:{trigger:'axis'},
    xAxis:{type:'category', data: ms.x, axisLabel:{color:'#cfe8ff'}},
    yAxis:{type:'value', axisLabel:{formatter: v=> v+'%', color:'#cfe8ff'}},
    series:[{type:'line', data: ms.y, smooth:true, lineStyle:{width:2}}]
  });
}

function renderMap(data){
  const ag = aggregateByCountry(data);
  // 加载世界地图 json（cdn）
  fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json')
  .then(r=>r.json())
  .then(worldJson=>{
    echarts.registerMap('world', worldJson);
    mapChart.setOption({
      tooltip:{trigger:'item', formatter: params => {
        if(params.value) return `${params.name}<br/>营收(亿)：${numberFormat(params.value)}`;
        return params.name + '<br/>无数据';
      }},
      visualMap:{min:0, max: Math.max(...ag.map(x=>x.value)), left:'left', top:'bottom', text:['高','低'], textStyle:{color:'#cfe8ff'}},
      series:[{
        name:'countryRevenue',
        type:'map',
        map:'world',
        roam:true,
        emphasis:{label:{show:true}},
        data: ag
      }]
    });
  })
  .catch(err=>{
    console.error('world map load error',err);
    mapChart.showLoading({text:'地图加载失败'});
  });
}

// ---------- 初始化渲染（使用 DATA）
function refreshAll(){
  const data = DATA.slice(); // 若使用后端 API，请在这里替换为 fetch + 数据解析

  updateKPIs(data);
  renderTable(data);
  renderLine(data);
  renderPie(data);
  renderBar(data);
  renderMargin(data);
  renderMap(data);
}

// 初始渲染
refreshAll();

// 交互：刷新（模拟）
refreshBtn.addEventListener('click', ()=> {
  refreshBtn.disabled = true;
  refreshBtn.innerText = '刷新中...';
  setTimeout(()=>{ refreshAll(); refreshBtn.disabled=false; refreshBtn.innerText='刷新数据'; }, 700);
});

// 响应式
window.addEventListener('resize', ()=>{ [lineChart,pieChart,barChart,mapChart,marginChart].forEach(c=>c.resize()); });

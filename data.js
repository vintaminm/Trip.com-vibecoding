// demo data for one graduating class; every number on screen is derived from here
const ME = "m01";

const MEMBERS = [
  { id: "m01", name: "林小满", role: "organizer", city: "上海", filled: false, budget: 2, dates: ["07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09"], wish: ["dali","xiamen"], vibe: ["自然","拍照"], hard: [] },
  { id: "m02", name: "周子昂", role: "finance", city: "上海", filled: true, budget: 3, dates: ["07-01","07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09","07-10"], wish: ["dali","chengdu"], vibe: ["美食","夜生活"], hard: [] },
  { id: "m03", name: "陈雨桐", role: "member", city: "上海", filled: true, budget: 2, dates: ["07-03","07-04","07-05","07-06","07-07","07-08"], maybe: ["07-02"], wish: ["dali","xiamen"], vibe: ["拍照","躺平"], hard: [] },
  { id: "m04", name: "王浩然", role: "member", city: "上海", filled: true, budget: 2, dates: ["07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09","07-10","07-11"], wish: ["chengdu","dali"], vibe: ["自然","暴走"], hard: [] },
  { id: "m05", name: "李思语", role: "member", city: "北京", filled: true, budget: 3, dates: ["07-01","07-02","07-03","07-04","07-05","07-06"], maybe: ["07-07"], wish: ["xiamen","dali"], vibe: ["海边","拍照"], hard: ["7/8 回北京实习报到"] },
  { id: "m06", name: "张一帆", role: "member", city: "上海", filled: true, budget: 1, dates: ["07-03","07-04","07-05","07-06","07-07","07-08","07-09"], maybe: ["07-10"], wish: ["xiamen","changsha"], vibe: ["美食","躺平"], hard: ["预算上限 1,500"] },
  { id: "m07", name: "赵心怡", role: "member", city: "杭州", filled: true, budget: 2, dates: ["07-02","07-03","07-04","07-05","07-06","07-07","07-08"], wish: ["dali","qingdao"], vibe: ["自然","拍照"], hard: [] },
  { id: "m08", name: "刘宇辰", role: "member", city: "上海", filled: true, budget: 2, dates: ["07-04","07-05","07-06","07-07","07-08","07-09","07-10"], wish: ["chongqing","chengdu"], vibe: ["美食","夜生活"], hard: ["7/3 要去公司报到"] },
  { id: "m09", name: "黄诗涵", role: "member", city: "上海", filled: true, budget: 4, dates: ["07-01","07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09","07-10","07-11","07-12"], wish: ["sanya","dali"], vibe: ["海边","躺平"], hard: [] },
  { id: "m10", name: "吴嘉豪", role: "member", city: "北京", filled: true, budget: 2, dates: ["07-03","07-04","07-05","07-06","07-07","07-08","07-09"], wish: ["dali","xian"], vibe: ["自然","暴走"], hard: [] },
  { id: "m11", name: "郑雅宁", role: "member", city: "杭州", filled: true, budget: 2, dates: ["07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09","07-10"], wish: ["xiamen","dali"], vibe: ["海边","拍照"], hard: [] },
  { id: "m12", name: "孙铭泽", role: "member", city: "上海", filled: false, budget: 0, dates: [], wish: [], vibe: [], hard: [] },
  { id: "m13", name: "何沐阳", role: "member", city: "上海", filled: true, budget: 2, dates: ["07-03","07-04","07-05","07-06","07-07","07-08"], wish: ["dali","chengdu"], vibe: ["美食","拍照"], hard: [] },
  { id: "m14", name: "郭子轩", role: "member", city: "上海", filled: true, budget: 1, dates: ["07-02","07-03","07-04","07-05","07-06","07-07","07-08","07-09","07-10"], wish: ["xiamen","qingdao"], vibe: ["海边","躺平"], hard: ["不坐飞机", "预算上限 1,500"] },
];

const BUDGET_TIERS = [
  { tier: 1, label: "1,500 以内", max: 1500 },
  { tier: 2, label: "1,500–2,500", max: 2500 },
  { tier: 3, label: "2,500–3,500", max: 3500 },
  { tier: 4, label: "3,500 以上", max: 9999 },
];

const VIBES = ["海边", "自然", "美食", "拍照", "夜生活", "躺平", "暴走"];
const HARDS = ["不坐飞机", "预算上限 1,500", "有固定日期要回家", "素食", "不能走太久"];

const DESTS = {
  dali: { name: "大理", sub: "洱海 · 苍山", img: "img/dali.jpg", tag: "自然 拍照 躺平", days: "5 天", base: 2480, fit: "10 人以上民宿好订，环湖能分队" },
  xiamen: { name: "厦门", sub: "鼓浪屿 · 环岛路", img: "img/xiamen.jpg", tag: "海边 美食 躺平", days: "4 天", base: 1780, fit: "高铁直达，不坐飞机也能来" },
  chengdu: { name: "成都", sub: "茶馆 · 熊猫 · 火锅", img: "img/chengdu.jpg", tag: "美食 躺平", days: "4 天", base: 1980, fit: "吃为主，人均最省心" },
  chongqing: { name: "重庆", sub: "洪崖洞 · 江景", img: "img/chongqing.jpg", tag: "美食 夜生活 暴走", days: "4 天", base: 1900, fit: "夜景和火锅，晚上不散场" },
  qingdao: { name: "青岛", sub: "老城 · 海边", img: "img/qingdao.jpg", tag: "海边 拍照", days: "4 天", base: 1860, fit: "北方同学更近，啤酒节在 7 月" },
  changsha: { name: "长沙", sub: "湘江 · 夜市", img: "img/changsha.jpg", tag: "美食 夜生活", days: "3 天", base: 1500, fit: "高铁网好，人均最低" },
  xian: { name: "西安", sub: "城墙 · 不夜城", img: "img/xian.jpg", tag: "拍照 美食 暴走", days: "4 天", base: 1900, fit: "白天博物馆，晚上城墙骑行" },
  sanya: { name: "三亚", sub: "海滩 · 潜水", img: "img/sanya.jpg", tag: "海边 躺平", days: "5 天", base: 3200, fit: "淡季机票便宜，预算要高一档" },
};

// each plan carries the trip for every departure city, so the per-person price follows the roster
const PLANS = [
  {
    id: "A", dest: "dali", title: "大理 · 洱海慢游", nights: 4, start: "07-03", end: "07-07",
    dates: ["07-03","07-04","07-05","07-06","07-07"],
    cover: "img/dali.jpg", vibes: ["自然", "拍照", "躺平"],
    routes: {
      "上海": { how: "飞昆明 + 动车到大理", mode: "air", via: "昆明", price: 1290, arrive: "14:30", note: "08:05 起飞，昆明站动车 2 小时" },
      "北京": { how: "直飞大理", mode: "air", price: 1650, arrive: "13:10", note: "09:20 起飞" },
      "杭州": { how: "飞昆明 + 动车到大理", mode: "air", via: "昆明", price: 1200, arrive: "15:40", note: "09:30 起飞" },
    },
    stay: { name: "古城南门 · 洱海民宿", per: 150, rooms: "双人间", note: "4 晚，2 人一间，7 月 1 日前可免费退" },
    play: 520, meet: "7/3 16:30 大理站集合", flight: true,
    exceptions: [{ who: "m14", how: "高铁到昆明 + 动车（不坐飞机）", mode: "rail", via: "昆明", price: 1030, arrive: "7/2 晚到昆明，7/3 10:40 到大理", note: "提前一晚出发" }],
    aiNote: { who: "m08", text: "刘宇辰 7/3 要去公司报到。改成 7/4–7/8 就 14 人都能来，但周末返程机票贵约 120 元/人；或者他 7/4 中午到，我单独排接站。" },
  },
  {
    id: "B", dest: "xiamen", title: "厦门 · 海边躺平", nights: 3, start: "07-04", end: "07-07",
    dates: ["07-04","07-05","07-06","07-07"],
    cover: "img/xiamen.jpg", vibes: ["海边", "美食", "躺平"],
    routes: {
      "上海": { how: "高铁直达", mode: "rail", price: 800, arrive: "13:20", note: "07:50 发车，5 小时" },
      "北京": { how: "飞厦门", mode: "air", price: 1500, arrive: "12:40", note: "09:00 起飞" },
      "杭州": { how: "高铁直达", mode: "rail", price: 700, arrive: "12:50", note: "08:10 发车" },
    },
    stay: { name: "曾厝垵 · 海景民宿", per: 150, rooms: "双人间", note: "3 晚，2 人一间；换青旅四人间 60 元/人/晚" },
    play: 500, meet: "7/4 13:30 厦门北站集合", flight: false,
    aiNote: { who: "m06", text: "张一帆、郭子轩预算上限 1,500。住宿换成青旅四人间，上海出发的人能降到约 1,480 元。" },
  },
  {
    id: "C", dest: "chengdu", title: "成都 + 重庆 · 吃吃吃", nights: 4, start: "07-02", end: "07-06",
    dates: ["07-02","07-03","07-04","07-05","07-06"],
    cover: "img/chengdu.jpg", vibes: ["美食", "夜生活"],
    routes: {
      "上海": { how: "飞成都，重庆回", mode: "air", price: 1300, arrive: "12:10", note: "两段不同航司，各自退改" },
      "北京": { how: "飞成都，重庆回", mode: "air", price: 1400, arrive: "11:50", note: "" },
      "杭州": { how: "飞成都，重庆回", mode: "air", price: 1200, arrive: "12:30", note: "" },
    },
    stay: { name: "春熙路 + 解放碑 · 连锁酒店", per: 140, rooms: "双人间", note: "两城各 2 晚，中间高铁 1.5 小时" },
    play: 520, meet: "7/2 13:00 成都东站集合", flight: true,
    aiNote: null,
  },
];

const VOTES = { A: ["m02","m03","m04","m07","m10","m13"], B: ["m05","m06","m09","m11","m14"], C: ["m08"] };

// itinerary for plan a, the one the demo locks
const ITINERARY = [
  { day: 1, date: "07-03", title: "各地抵达 · 古城", items: [
    { time: "10:40–15:40", name: "三个出发地陆续到大理", cost: 0, type: "transit", note: "郭子轩动车 10:40 · 北京 13:10 · 上海 14:30 · 杭州 15:40；刘宇辰 7/4 12:20 到" },
    { time: "16:30", name: "大理站集合，包车进古城", cost: 25, type: "meet", note: "集合点 · 出站口 B，AI 领队已发给每个人" },
    { time: "17:30", name: "入住古城南门民宿", cost: 0, type: "stay", note: "7 间双人间，室友按偏好自动配好" },
    { time: "19:00", name: "人民路 晚饭", cost: 54, type: "food", note: "白族菜，13 人两桌" },
    { time: "21:00", name: "夜逛古城 · 自由活动", cost: 0, type: "free", note: "" },
  ]},
  { day: 2, date: "07-04", title: "洱海环湖", items: [
    { time: "09:00", name: "租电动车 环海西路", cost: 80, type: "play", note: "携程 POI · 两人一车，共 7 车" },
    { time: "12:00", name: "喜洲古镇 午饭 + 破酥粑粑", cost: 45, type: "food", note: "" },
    { time: "15:30", name: "海舌公园 看日落", cost: 0, type: "play", note: "开放时间 08:00–19:00，携程核验" },
    { time: "19:30", name: "火锅", cost: 92, type: "food", note: "" },
  ]},
  { day: 3, date: "07-05", title: "分队日", split: true, items: [
    { time: "09:00", name: "小队 1 · 苍山徒步 + 索道", cost: 180, type: "team", team: 1, note: "感通索道 往返 · 6 人" },
    { time: "10:00", name: "小队 2 · 古城咖啡 + 逛吃", cost: 60, type: "team", team: 2, note: "8 人" },
    { time: "18:30", name: "古城南门集合", cost: 0, type: "meet", note: "两队都到后出发，迟到的人收到自动提醒" },
    { time: "19:00", name: "毕业晚宴", cost: 120, type: "food", note: "包间已订，财务统一结账" },
  ]},
  { day: 4, date: "07-06", title: "双廊 · 毕业照", items: [
    { time: "09:30", name: "双廊古镇", cost: 0, type: "play", note: "" },
    { time: "11:00", name: "南诏风情岛 船票", cost: 50, type: "play", note: "携程门票，到岛即用" },
    { time: "15:00", name: "环海西路 拍毕业照", cost: 0, type: "play", note: "学士服带上，摄影 2 人轮流" },
    { time: "18:00", name: "自由活动", cost: 0, type: "free", note: "" },
  ]},
  { day: 5, date: "07-07", title: "返程", items: [
    { time: "10:00", name: "退房 · 行李寄存", cost: 0, type: "stay", note: "" },
    { time: "12:00–16:00", name: "各地返程", cost: 0, type: "transit", note: "北京直飞 12:40 · 上海 14:10 · 杭州 15:20" },
  ]},
];

const TEAMS = { 1: ["m04","m07","m10","m02","m13","m01"], 2: ["m03","m05","m06","m08","m09","m11","m12","m14"] };

const PROPOSALS = [
  { id: "p1", by: "m03", day: 2, text: "D2 下午把海舌公园换成磻溪村 S 湾，日落更好拍", likes: ["m07","m11","m09","m13"] },
  { id: "p2", by: "m04", day: 4, text: "D4 晚上加一个洱海夜游船，人均约 68", likes: ["m08","m02"] },
];

// shared bills on the trip: who paid, who ate
const EXPENSES = [
  { id: "e1", day: 1, name: "人民路 晚饭", amount: 702, by: "m02", among: ["m01","m02","m03","m04","m05","m06","m07","m09","m10","m11","m12","m13","m14"] },
  { id: "e2", day: 2, name: "电动车 7 辆", amount: 1120, by: "m01", among: "all" },
  { id: "e3", day: 2, name: "火锅", amount: 1288, by: "m03", among: "all" },
  { id: "e4", day: 3, name: "感通索道 小队 1", amount: 1080, by: "m04", among: ["m04","m07","m10","m02","m13","m01"] },
  { id: "e5", day: 3, name: "毕业晚宴", amount: 1680, by: "m02", among: "all" },
  { id: "e6", day: 4, name: "南诏风情岛 船票", amount: 700, by: "m09", among: "all" },
  { id: "e7", day: 4, name: "奶茶", amount: 96, by: "m07", among: ["m07","m03","m11","m09","m13","m01"] },
];

// who shares a room; a dropout leaves the roommate alone in it
const ROOMS = [["m01", "m03"], ["m05", "m07"], ["m09", "m11"], ["m02", "m04"], ["m06", "m13"], ["m08", "m12"], ["m10", "m14"]];

// group size unlocks group stock on trip.com: a whole guesthouse, a charter car, a private dining room
const PERKS = [
  { n: 6, name: "整栋民宿", note: "整栋包下，每人每晚省约 40 元", save: 160 },
  { n: 10, name: "包车接送站", note: "两辆车接站送站，每人每趟约 25 元", save: 70 },
  { n: 12, name: "晚宴包间", note: "人数够包间低消，免包间费", save: 50 },
];

// what the invite page shows: reactions and a few lines from people already in
const REACTS = [["🎓", 9], ["✈️", 6], ["🌊", 5], ["🔥", 4]];
const WALL = [
  { by: "m02", text: "这次终于不用我先垫钱了，冲" },
  { by: "m14", text: "我不坐飞机，有高铁的方案就来" },
  { by: "m09", text: "想看海，洱海也算海吧" },
];

const RULES = [
  { when: "出发 7 天前退出", what: "机票酒店按携程退改规则退，团内不扣钱" },
  { when: "出发 3–7 天退出", what: "承担自己房间的差价（室友变单人）" },
  { when: "出发 3 天内退出", what: "承担本人机酒损失，已付的共同费用不退" },
];

const ALBUM = [
  { img: "img/memory3.jpg", cap: "D2 海舌公园日落，13 个人一起喊了毕业快乐", by: "m03" },
  { img: "img/memory1.jpg", cap: "D4 双廊码头，坐了一下午什么都没干", by: "m09" },
  { img: "img/memory2.jpg", cap: "D2 火锅，周子昂说这顿他来，后来还是记了账", by: "m08" },
  { img: "img/memory4.jpg", cap: "D2 租车前的合影位，七辆车一辆没丢", by: "m01" },
];

const QUOTES = [
  { by: "m07", text: "没想到 14 个人的旅行三天就定下来了，以前光选地方就能吵一周。" },
  { by: "m02", text: "当财务最轻松的一次，没垫过一分钱。" },
  { by: "m14", text: "不坐飞机也没被落下，高铁到昆明再动车，AI 领队给我单独排的。" },
];

const HISTORY_CREW = { name: "高中同学 · 青岛 3 日", when: "2026-05-01 至 05-03", people: 8, spent: 1320, note: "已结清" };

const INSPIRE = ["dali", "xiamen", "chengdu", "qingdao", "changsha", "xian", "chongqing", "sanya"];

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const yuan = (n) => "¥" + Math.round(n).toLocaleString("zh-CN");
const clone = (o) => JSON.parse(JSON.stringify(o));
const COLORS = ["#2f6bff", "#ff6b4a", "#16b36a", "#6c4cf1", "#ffb400", "#0ea5e9", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#22c55e", "#e11d48", "#3b82f6", "#a16207"];
const IC = {
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 10h14M8.5 21 10 17M15.5 21 14 17M9 13.5h.01M15 13.5h.01"/>',
  bed: '<path d="M3 19V6M3 14h18v5M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 13.5c2.8 0 5 1.8 5.5 5.5"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  vote: '<path d="M4 13h16v7H4z"/><path d="M8 13V4h8v9"/><path d="M10 8.5l1.5 1.5L14 7"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  pin: '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  swap: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7 10 4h4l1.5 3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
};
const ic = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k] || ""}</svg>`;
const MASCOT = '<img class="mascot-sm" src="img/mascot.webp" alt="">';

// the guided path on the home page: each step opens the demo at that moment
const TOUR = [
  ["收到邀请", "点自己的名字就加入", "#/join?stage=collect"],
  ["一分钟偏好", "日期三档，预算匿名", "#/crew/plan?stage=collect&show=pref"],
  ["投票与折中", "能来人数优先于票数", "#/crew/plan?stage=vote"],
  ["分队行程", "分头玩，18:30 集合", "#/crew/itinerary?stage=plan&day=3"],
  ["各付各的", "订单拆成每人一份", "#/crew/money?stage=pay"],
  ["有人退出", "按出发约定自动算", "#/crew/members?stage=pay&show=drop"],
  ["出行当天", "签到、投票、记一笔", "#/crew/itinerary?stage=trip"],
  ["结清与纪念", "每人只转一次", "#/crew/money?stage=settle"],
];
const TRY = [["预算能不能再低点", "q:budget"], ["郭子轩不坐飞机怎么办", "q:train"], ["有人退出怎么算", "q:rules"], ["分队后怎么集合", "q:meet"]];

// rough coordinates for the route sketch; no borders are drawn
const GEO = { 上海: [121.47, 31.23, "rt"], 北京: [116.4, 39.9, "r"], 杭州: [120.16, 30.27, "rb"], 昆明: [102.71, 25.04, "b"], 大理: [100.23, 25.61, "l"], 厦门: [118.09, 24.48, "l"], 成都: [104.07, 30.67, "l"], 重庆: [106.55, 29.56, "b"] };

const STAGES = [
  { id: "collect", name: "收偏好", short: "偏好" },
  { id: "vote", name: "定方案", short: "方案" },
  { id: "plan", name: "排行程", short: "行程" },
  { id: "pay", name: "各付各的", short: "付款" },
  { id: "trip", name: "出行中", short: "出行" },
  { id: "settle", name: "结算纪念", short: "结算" },
];
const STAGE_NO = Object.fromEntries(STAGES.map((s, i) => [s.id, i]));
const CREW = { name: "信管 2026 届 · 毕业旅行", cover: "img/hero.jpg", window: "6 月 27 日 – 7 月 15 日", from: "毕业典礼 6/26 之后" };

// everything the demo can change lives here; reset puts it back
let S;
function fresh() {
  S = {
    stage: "collect",
    members: clone(MEMBERS),
    votes: clone(VOTES),
    plans: clone(PLANS),
    locked: null,
    late: null,
    proposals: clone(PROPOSALS),
    teams: clone(TEAMS),
    expenses: clone(EXPENSES),
    itinerary: clone(ITINERARY),
    paid: {},
    checkin: [],
    dinnerVote: { 火锅: ["m02", "m03", "m06", "m08", "m09", "m13"], 烧烤: ["m04", "m07", "m10", "m11"], 随便: ["m05", "m14"] },
    myDinner: null,
    ai: [],
    deadline: Date.now() + (23 * 60 + 14) * 60 * 1000,
    day: 1,
    nudged: false,
    adopted: [],
    seen: {},
    claim: null,
    joined: null,
    reacted: [],
    agree: false,
    settled: [],
    whoOpen: false,
  };
}
fresh();

const mem = (id) => S.members.find((m) => m.id === id);
const color = (id) => COLORS[S.members.findIndex((m) => m.id === id) % COLORS.length];
const who = (m) => (m.id === ME ? "你" : m.name);
const av = (id, cls = "") => { const m = mem(id); return `<span class="av ${cls}" style="--c:${color(id)}" title="${esc(m.name)}">${esc(m.name[0])}<img src="img/av/${id}.webp" alt="" loading="lazy" onerror="this.remove()"></span>`; };
const active = () => S.members.filter((m) => !m.dropped);
const filled = () => active().filter((m) => m.filled);
const unfilled = () => active().filter((m) => !m.filled);
const free = (m, d) => m.dates.includes(d) || (m.maybe || []).includes(d);
const canGo = (m, plan) => m.filled && plan.dates.every((d) => free(m, d));
const goers = (plan) => active().filter((m) => canGo(m, plan));
const cant = (plan) => active().filter((m) => m.filled && !canGo(m, plan));
const reluctant = (plan) => goers(plan).filter((m) => (m.maybe || []).some((d) => plan.dates.includes(d)));
const routeOf = (plan, m) => (plan.exceptions || []).find((e) => e.who === m.id) || plan.routes[m.city];

function personPrice(plan, m) {
  const ex = (plan.exceptions || []).find((e) => e.who === m.id);
  const route = ex ? ex.price : plan.routes[m.city].price;
  return route + plan.stay.per * plan.nights + plan.play;
}
function avgPrice(plan) {
  const ms = active();
  return ms.reduce((a, m) => a + personPrice(plan, m), 0) / ms.length;
}
function fitScore(plan) {
  const ms = active();
  const f = ms.filter((m) => m.filled);
  if (!f.length) return 0;
  const dates = goers(plan).length / ms.length;
  const wish = f.reduce((a, m) => a + (m.wish[0] === plan.dest ? 2 : m.wish[1] === plan.dest ? 1 : 0), 0) / (2 * f.length);
  const budget = f.filter((m) => BUDGET_TIERS[m.budget - 1].max >= personPrice(plan, m)).length / f.length;
  const vibe = f.filter((m) => m.vibe.some((v) => plan.vibes.includes(v))).length / f.length;
  return Math.round(100 * (0.4 * dates + 0.3 * wish + 0.2 * budget + 0.1 * vibe));
}
function voteCount(id) { return (S.votes[id] || []).filter((v) => mem(v) && !mem(v).dropped).length; }
function voted() { return new Set(Object.values(S.votes).flat()); }
function wishTally() {
  const t = {};
  filled().forEach((m) => { if (m.wish[0]) t[m.wish[0]] = (t[m.wish[0]] || 0) + 2; if (m.wish[1]) t[m.wish[1]] = (t[m.wish[1]] || 0) + 1; });
  return Object.entries(t).sort((a, b) => b[1] - a[1]);
}
function dateHeat() {
  const days = [];
  for (let d = 1; d <= 12; d++) {
    const key = "07-" + String(d).padStart(2, "0");
    const y = filled().filter((m) => m.dates.includes(key)).length;
    const mb = filled().filter((m) => (m.maybe || []).includes(key)).length;
    days.push({ key, d, n: y + mb, y, mb });
  }
  return days;
}
function budgetMedianTier() {
  const t = filled().map((m) => m.budget).sort((a, b) => a - b);
  return t.length ? t[Math.floor((t.length - 1) / 2)] : 2;
}
const lockedPlan = () => S.plans.find((p) => p.id === S.locked);
const going = () => active();

// the bills everyone pays on their own: one per departure route, plus the stay
function payItems() {
  const plan = lockedPlan();
  if (!plan) return [];
  const items = [];
  const groups = {};
  going().forEach((m) => {
    const ex = (plan.exceptions || []).find((e) => e.who === m.id);
    const key = ex ? "ex-" + m.id : m.city;
    (groups[key] = groups[key] || { key, ms: [], how: ex ? ex.how : plan.routes[m.city].how, mode: (ex || plan.routes[m.city]).mode, price: ex ? ex.price : plan.routes[m.city].price, city: ex ? m.name : m.city }).ms.push(m.id);
  });
  Object.values(groups).forEach((g) => items.push({ id: "r-" + g.key, name: `${g.city} · ${g.how}`, per: g.price, who: g.ms, kind: "transit", mode: g.mode, note: "往返 · 携程订单，各付各的" }));
  items.push({ id: "stay", name: `${plan.stay.name} · ${plan.nights} 晚`, per: plan.stay.per * plan.nights, who: going().map((m) => m.id), kind: "stay", note: `${Math.ceil(going().length / 2)} 间${plan.stay.rooms} · 退改按携程规则` });
  return items;
}
function isPaid(item, id) { return (S.paid[item.id] || []).includes(id); }

// who owes whom: everyone settles once with the treasurer, who nets the rest
function settlement() {
  const net = {};
  going().forEach((m) => (net[m.id] = 0));
  S.expenses.forEach((e) => {
    const among = e.among === "all" ? going().map((m) => m.id) : e.among.filter((id) => mem(id) && !mem(id).dropped);
    const share = e.amount / among.length;
    among.forEach((id) => (net[id] -= share));
    net[e.by] += e.amount;
  });
  const hub = (going().find((m) => m.role === "finance") || going()[0]).id;
  const transfers = [];
  Object.entries(net).forEach(([id, v]) => {
    if (id === hub) return;
    if (v < -0.5) transfers.push({ from: id, to: hub, amt: -v });
  });
  Object.entries(net).forEach(([id, v]) => {
    if (id === hub) return;
    if (v > 0.5) transfers.push({ from: hub, to: id, amt: v });
  });
  return { net, transfers, hub };
}

/* ---------- ai 领队 ---------- */
function aiIntro() {
  const f = filled().length, u = unfilled();
  const heat = dateHeat(); const best = heat.reduce((a, b) => (b.n > a.n ? b : a), heat[0]);
  const top = wishTally().slice(0, 3).map(([k, v]) => `${DESTS[k].name} ${v} 票`).join("、");
  const tier = BUDGET_TIERS[budgetMedianTier() - 1].label;
  switch (S.stage) {
    case "collect": return { text: `我看了 ${f} 份偏好：7 月 ${best.d} 日前后空的人最多（${best.n} 人），预算中位在 ${tier}，想去的前三是 ${top}。${u.length ? `还差 ${u.length} 人没填：${u.map(who).join("、")}。` : "大家都填好了，可以看方案了。"}`, chips: u.length ? [["催一下没填的", "nudge"], ["先看看方案", "go:plan"], ["预算能不能再低点", "q:budget"]] : [["去定方案", "go:plan"], ["预算能不能再低点", "q:budget"]] };
    case "vote": return { text: `三套方案都按 ${active().length} 个人、${new Set(active().map((m) => m.city)).size} 个出发地算过了。A 匹配最高，但刘宇辰 7/3 走不开；B 全员都能来，人均便宜约 ${yuan(avgPrice(S.plans[0]) - avgPrice(S.plans[1]))}。投票到点我会自动汇总。`, chips: [["看合并方案", "merge"], ["郭子轩不坐飞机怎么办", "q:train"], ["投票截止后会怎样", "q:deadline"]] };
    case "plan": return { text: `行程草稿按 ${going().length} 人、3 个出发地排好了，每一项都用了携程核验过的开放时间。D3 分队后 18:30 南门集合，集合点我已经发给每个人。${S.late ? `${mem(S.late).name} 7/4 中午到，接站排在小队日程之外。` : ""}陈雨桐的提议已有 ${S.proposals[0].likes.length} 人赞成，要不要采纳？`, chips: [["采纳陈雨桐的提议", "adopt:p1"], ["去付款", "go:money"], ["分队怎么集合", "q:meet"]] };
    case "pay": { const items = payItems(); const unpaid = items.reduce((a, it) => a + it.who.filter((id) => !isPaid(it, id)).length, 0); return { text: unpaid ? `还有 ${unpaid} 份没付（民宿和机票各自付自己的那份，没人垫钱）。机票价格 7/1 00:00 前有效，过了会重新报价。` : "所有人都付好了，订单在各自的携程账户里。出发前 3 天我会发集合提醒。", chips: unpaid ? [["提醒没付的人", "remind"], ["改四人间能省多少", "q:room"], ["有人退出怎么算", "q:rules"]] : [["有人退出怎么算", "q:rules"], ["跳到出行当天", "stage:trip"]] }; }
    case "trip": return { text: "今天 7/4 洱海环湖。大理下午 3 点后有阵雨，我把日落改成了喜洲的室内咖啡，环湖按原计划上午出发。刘宇辰 12:20 到大理站，我排了喜洲接站。", chips: [["记一笔", "expense"], ["晚饭投票", "q:dinner"], ["谁还没到", "q:late"]] };
    case "settle": { const total = S.expenses.reduce((a, e) => a + e.amount, 0); return { text: `5 天一共 ${S.expenses.length} 笔共同消费，${yuan(total)}，每人和财务转一次就结清，不用谁先垫。纪念册已经按时间轴排好，每人一句话还差 ${Math.max(0, going().length - QUOTES.length)} 人。`, chips: [["看纪念册", "go:album"], ["一键结清", "settle"], ["下次再约", "q:next"]] }; }
  }
}
function aiReset() { S.ai = []; const i = aiIntro(); S.ai.push({ who: "ai", text: i.text, chips: i.chips }); }
function aiSay(text, chips) { S.ai.push({ who: "ai", text, chips }); renderAi(); if (!$("#aiPanel").classList.contains("open") && !window.matchMedia("(min-width: 1180px)").matches) { const b = $("#aiBadge"); b.textContent = Number(b.textContent || 0) + 1; b.hidden = false; } }
function aiMe(text) { S.ai.push({ who: "me", text }); renderAi(); }
function answer(q) {
  const plan = S.plans[0];
  switch (q) {
    case "budget": return { text: `能。现在人均最高的是交通。三条路：1）日期挪到工作日出发，机票平均省 150 左右；2）民宿换四人间，4 晚省 240；3）上海出发的人高铁到昆明，省 400 但多 8 小时。要不要我把第 2 条做成方案给大家投？`, chips: [["做成方案", "merge"]] };
    case "train": return { text: `郭子轩不坐飞机，我给他单独排了：7/2 晚上高铁到昆明住一晚，7/3 上午动车到大理 10:40 到，比大部队早。费用 ${yuan(1030)}，比坐飞机还省 260。他付款时看到的就是这条。`, chips: [] };
    case "deadline": return { text: "截止后我按两条规则汇总：先看能来的人数，再看票数。票数接近但能来的人差 1 个以上，我会把折中方案（比如改日期）列出来让组织者定，不会自动替大家决定。", chips: [] };
    case "meet": return { text: "分队那天两队各有自己的日程，18:30 古城南门集合。集合前 30 分钟我提醒一次，谁还没在路上再单独提醒；两队都到齐，晚宴的包间才算开始计时。", chips: [] };
    case "room": return { text: `民宿换成四人间，${plan.stay.per}→${plan.stay.per - 60} 元一晚，4 晚每人省 240。不过已经有 11 人付了双人间，改的话要退了重订，7/1 前免费。要改我可以发个投票。`, chips: [] };
    case "rules": return { text: "按建团时定的出发约定：出发 7 天前退，机酒走携程退改、团里不扣钱；3–7 天退，承担自己房间的差价；3 天内退，机酒损失自己担，已付的共同费用不退。谁退出，我会自动算出影响到的人和金额，并通知室友和财务。成员页可以演示一次。", chips: [["去成员页演示", "go:members"]] };
    case "dinner": { const v = S.dinnerVote; return { text: `晚饭投票：火锅 ${v.火锅.length}、烧烤 ${v.烧烤.length}、随便 ${v.随便.length}。18:00 截止，到点我按票数订位，人数按已签到的人算。`, chips: [["去投一票", "go:itinerary"]] }; }
    case "late": { const late = going().filter((m) => !S.checkin.includes(m.id)); return { text: late.length ? `${late.map((m) => m.name).join("、")}还没签到。${late.some((m) => m.id === "m08") ? "刘宇辰 12:20 到站，已经在喜洲接站的安排里。" : ""}` : "全员都签到了。", chips: [] }; }
    case "next": return { text: "纪念册发出去以后，我会在明年同一天提醒一次「要不要再约」，到时候把这次的偏好和出发地直接带过去，不用重填。", chips: [] };
  }
  return null;
}
function freeAnswer(t) {
  if (/预算|便宜|省/.test(t)) return answer("budget");
  if (/飞机|高铁|火车/.test(t)) return answer("train");
  if (/分队|集合/.test(t)) return answer("meet");
  if (/退出|鸽|退款|约定/.test(t)) return answer("rules");
  if (/晚饭|吃/.test(t)) return answer("dinner");
  if (/截止|投票/.test(t)) return answer("deadline");
  return { text: "这个问题演示版还没准备答案，我先记下来给组织者看。你可以试试问预算、分队、退出规则或者飞机的事。", chips: [] };
}
function aiAction(a) {
  const [k, v] = a.split(":");
  if (k === "go") { location.hash = "#/crew/" + v; return; }
  if (k === "q") { const r = answer(v); if (r) aiSay(r.text, r.chips); return; }
  if (k === "stage") { setStage(v); return; }
  if (a === "nudge") { nudge(); return; }
  if (a === "merge") { mergePlan(); return; }
  if (a === "adopt") { adopt(v || "p1"); return; }
  if (k === "adopt") { adopt(v); return; }
  if (a === "remind") { remind(); return; }
  if (a === "expense") { openExpense(); return; }
  if (a === "settle") { settleAll(); return; }
}

/* ---------- actions ---------- */
function nudge() {
  const u = unfilled();
  if (!u.length) { toast("大家都填好了"); return; }
  toast(`已在群里 @${u.filter((m) => m.id !== ME).map((m) => m.name).join(" @") || "大家"}`);
  aiSay(`已经在群里提醒了 ${u.filter((m) => m.id !== ME).map((m) => m.name).join("、") || "大家"}，附上了一分钟问卷的链接。${!mem(ME).filled ? "你自己的也还没填，概览页点「去填」。" : ""}`, []);
  if (!S.nudged) {
    S.nudged = true;
    setTimeout(() => {
      const m = mem("m12");
      if (m && !m.filled) {
        Object.assign(m, { filled: true, budget: 2, dates: ["07-02", "07-03", "07-04", "07-05", "07-06", "07-07", "07-08", "07-09", "07-10"], wish: ["dali", "chongqing"], vibe: ["美食", "拍照"], hard: [] });
        toast("孙铭泽刚填了偏好");
        aiSay(`孙铭泽刚填了：7/2–7/10 都行，预算 1,500–2,500，想去大理或重庆。现在 ${goers(S.plans[0]).length} 人能去大理。${unfilled().length ? "" : "大家都填好了，可以定方案了。"}`, unfilled().length ? [] : [["去定方案", "go:plan"]]);
        render();
      }
    }, 4000);
  }
}
function mergePlan() {
  if (S.plans.find((p) => p.id === "D")) { aiSay("方案 D 已经在投票里了。", [["去看", "go:plan"]]); return; }
  aiSay(`合并方案：大理 7/4–7/8，${active().length} 人都能来，人均约 ${yuan(avgPrice(S.plans[0]) + 120)}（周末返程贵 120）。要不要加成方案 D 让大家投？`, [["加成方案 D", "addD"]]);
}
function addPlanD() {
  if (S.plans.find((p) => p.id === "D")) return;
  const d = clone(S.plans[0]);
  Object.assign(d, { id: "D", title: "大理 · 洱海慢游（晚一天）", start: "07-04", end: "07-08", dates: ["07-04", "07-05", "07-06", "07-07", "07-08"], meet: "7/4 16:30 大理站集合", aiNote: null });
  Object.values(d.routes).forEach((r) => (r.price += 120));
  S.plans.push(d); S.votes.D = [];
  toast("方案 D 已加入投票");
  aiSay("方案 D 加好了，群里已经通知大家可以改票。", [["去投票", "go:plan"]]);
  render();
}
function vote(id) {
  if (S.locked) return;
  Object.keys(S.votes).forEach((k) => (S.votes[k] = S.votes[k].filter((v) => v !== ME)));
  S.votes[id].push(ME);
  toast(`已投方案 ${id}`);
  render();
}
function lockPlan(id) {
  const p = S.plans.find((x) => x.id === id);
  const c = cant(p);
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>锁定方案 ${esc(id)}：${esc(p.title)}</h2>
    <p class="sub">${esc(DESTS[p.dest].name)} · ${esc(p.start.replace("-", "/"))}–${esc(p.end.replace("-", "/"))} · 人均约 ${yuan(avgPrice(p))}</p>
    <div class="card flat" style="margin-top:14px">
      <b>锁定后会发生什么</b>
      <ul class="dots" style="margin-top:6px;font-size:14px;display:grid;gap:4px">
        <li>· 行程草稿按 ${going().length} 人、${new Set(going().map((m) => m.city)).size} 个出发地生成</li>
        <li>· 机票和民宿拆成每个人自己的份，各付各的，没人垫钱</li>
        <li>· 投票关闭，群里发一条汇总：${voteCount(id)} 票、匹配 ${fitScore(p)}%</li>
        ${c.length ? `<li>· ${esc(c.map((m) => m.name).join("、"))}日期不合，我会给出晚到或改期的方案</li>` : ""}
      </ul>
    </div>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">再想想</button><button type="button" class="btn btn-primary" data-act="doLock" data-id="${id}">锁定并生成行程</button></div>`);
}
function doLock(id) {
  S.locked = id; S.stage = "plan";
  const p = lockedPlan();
  S.late = cant(p).find((m) => m.id === "m08") ? "m08" : null;
  closeModal(); aiReset();
  toast(`方案 ${id} 已锁定，行程草稿生成好了`);
  location.hash = "#/crew/itinerary";
}
function adopt(pid) {
  const p = S.proposals.find((x) => x.id === pid);
  if (!p || S.adopted.includes(pid)) { toast("已经采纳过了"); return; }
  S.adopted.push(pid);
  if (pid === "p1") { const it = S.itinerary[1].items[2]; it.name = "磻溪村 S 湾 看日落"; it.note = "陈雨桐提议 · 4 人赞成，已替换海舌公园"; }
  if (pid === "p2") { S.itinerary[3].items.splice(3, 0, { time: "19:30", name: "洱海夜游船", cost: 68, type: "play", note: "王浩然提议 · 已加入" }); }
  toast("已采纳，行程更新了");
  aiSay(`已经把${mem(p.by).name}的提议写进行程，群里同步了一条。`, []);
  render();
}
function like(pid) {
  const p = S.proposals.find((x) => x.id === pid);
  const i = p.likes.indexOf(ME);
  if (i >= 0) p.likes.splice(i, 1); else p.likes.push(ME);
  render();
}
function joinTeam(t) {
  Object.keys(S.teams).forEach((k) => (S.teams[k] = S.teams[k].filter((id) => id !== ME)));
  S.teams[t].push(ME);
  toast(`已加入小队 ${t}`);
  render();
}
function payMine(itemId) {
  (S.paid[itemId] = S.paid[itemId] || []).push(ME);
  toast("已通过携程支付我的那份");
  render();
}
function remind() {
  const items = payItems();
  const names = new Set();
  items.forEach((it) => it.who.filter((id) => !isPaid(it, id) && id !== ME).forEach((id) => names.add(mem(id).name)));
  if (!names.size) { toast("都付好了"); return; }
  toast(`已提醒 ${[...names].join("、")}`);
  aiSay(`已经单独提醒了 ${[...names].join("、")}，带着各自的付款链接。`, []);
  setTimeout(() => {
    items.forEach((it) => it.who.forEach((id) => { if (!isPaid(it, id) && id !== ME && id !== "m12") (S.paid[it.id] = S.paid[it.id] || []).push(id); }));
    toast("又有人付了");
    render();
  }, 3500);
}
function checkin(id) {
  if (!S.checkin.includes(id)) S.checkin.push(id);
  toast(id === ME ? "已签到" : `${mem(id).name} 已签到`);
  render();
}
function dinner(opt) {
  Object.keys(S.dinnerVote).forEach((k) => (S.dinnerVote[k] = S.dinnerVote[k].filter((v) => v !== ME)));
  S.dinnerVote[opt].push(ME); S.myDinner = opt;
  render();
}
function openExpense() {
  const names = going();
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>记一笔</h2>
    <p class="sub">谁付的、谁参与，当场记，结算时自动算</p>
    <div class="field"><label>花了什么</label><input class="input" id="exName" placeholder="比如：D4 午饭" value="D4 午饭"></div>
    <div class="field"><label>金额</label><input class="input num" id="exAmt" type="number" inputmode="decimal" value="486"></div>
    <div class="field"><label>谁垫的</label><div class="opts" id="exBy">${names.map((m) => `<button type="button" class="opt ${m.id === ME ? "on" : ""}" data-id="${m.id}">${esc(m.name)}</button>`).join("")}</div></div>
    <div class="field"><label>谁参与 <span class="hint">默认全员，点掉没参加的人</span></label><div class="opts" id="exAmong">${names.map((m) => `<button type="button" class="opt on" data-id="${m.id}">${esc(m.name)}</button>`).join("")}</div></div>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">取消</button><button type="button" class="btn btn-primary" data-act="saveExpense">记上</button></div>`);
  $("#exBy").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; $("#exBy").querySelectorAll(".opt").forEach((x) => x.classList.remove("on")); b.classList.add("on"); });
  $("#exAmong").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (b) b.classList.toggle("on"); });
}
function saveExpense() {
  const name = $("#exName").value.trim() || "一笔消费";
  const amt = Number($("#exAmt").value) || 0;
  const by = $("#exBy .opt.on")?.dataset.id || ME;
  const among = [...$("#exAmong").querySelectorAll(".opt.on")].map((b) => b.dataset.id);
  if (!amt || !among.length) { toast("金额和参与的人不能空"); return; }
  S.expenses.push({ id: "e" + Date.now(), day: S.stage === "trip" ? 4 : 5, name, amount: amt, by, among });
  closeModal(); toast(`记上了：${name} ${yuan(amt)}，${among.length} 人分`);
  render();
}
function settleAll() {
  const s = settlement();
  toast(`${s.transfers.length} 笔结清链接发出去了，每人点一下就付`);
  aiSay(`结清链接发到每个人了，每人只转一次，没人多付一分。`, [["看纪念册", "go:album"]]);
  setTimeout(() => { S.settled = s.transfers.map((t) => t.from + ">" + t.to); toast("大家两清了"); render(); }, 1600);
}
function markPaid(key) {
  if (!S.settled.includes(key)) S.settled.push(key);
  if (settlement().transfers.every((t) => S.settled.includes(t.from + ">" + t.to))) toast("大家两清了");
  render();
}
function roommate(id) {
  const pair = ROOMS.find((r) => r.includes(id));
  const mate = pair && mem(pair.find((x) => x !== id));
  return mate && !mate.dropped ? mate : null;
}
function dropModal(id) {
  const m = mem(id);
  if (!m || m.dropped) return;
  const plan = lockedPlan();
  const stayDiff = plan ? plan.stay.per * plan.nights : 600;
  const mate = roommate(id);
  const r = plan ? routeOf(plan, m) : { price: 1290, mode: "air" };
  const fee = Math.round(r.price * 0.2);
  const ticket = r.mode === "rail" ? "车票" : "机票";
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>${esc(m.name)} 退出会怎样</h2>
    <p class="sub">演示：今天 7/1，离出发还有 2 天，按出发约定第三条算</p>
    <div class="card flat" style="margin-top:14px">
      <ul class="bill-list">
        <li class="bill"><span class="ico ${r.mode === "rail" ? "rail" : ""}">${ic(r.mode === "rail" ? "train" : "plane")}</span><div><b>${ticket} · ${esc(m.city)}往返</b><small>按携程退改规则，退票费 ${yuan(fee)}，其余 ${yuan(r.price - fee)} 原路退回</small></div></li>
        <li class="bill"><span class="ico">${ic("bed")}</span><div><b>房间</b><small>${mate ? `室友${esc(mate.name)}变成一个人住，差价 ${yuan(stayDiff)} 按约定由${esc(m.name)}承担` : `空出的床位差价 ${yuan(stayDiff)} 由${esc(m.name)}承担`}</small></div></li>
        <li class="bill"><span class="ico">${ic("users")}</span><div><b>其他人</b><small>人均不变，行程不改；小队和集合名单自动更新</small></div></li>
      </ul>
    </div>
    <p class="sm muted" style="margin-top:10px">确认后通知${mate ? esc(mate.name) + "和" : ""}财务，退款原路回到${esc(m.name)}的携程账户，群里不用再解释一遍。</p>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">不退了</button><button type="button" class="btn btn-coral" data-act="doDrop" data-id="${id}">确认退出</button></div>`);
}
function doDrop(id) {
  const m = mem(id); const mate = roommate(id); m.dropped = true;
  Object.keys(S.teams).forEach((k) => (S.teams[k] = S.teams[k].filter((x) => x !== id)));
  closeModal(); toast(`${m.name} 已退出，退款和差价算好了`);
  aiSay(`${m.name}退出了。${m.city}往返票按携程规则退，房间差价 ${yuan(lockedPlan() ? lockedPlan().stay.per * lockedPlan().nights : 600)} 由${m.name}承担，${mate ? `室友${mate.name}和` : ""}财务都通知到了。现在 ${going().length} 人出发，人均不变。`, []);
  render();
}
function undrop(id) { const m = mem(id); m.dropped = false; toast(`${m.name} 回来了`); render(); }

/* ---------- stage jump for the demo ---------- */
function setStage(st) {
  const n = STAGE_NO[st];
  if (n >= 1) { S.members.forEach((m) => { if (!m.filled) Object.assign(m, m.id === "m12" ? { filled: true, budget: 2, dates: ["07-02", "07-03", "07-04", "07-05", "07-06", "07-07", "07-08", "07-09", "07-10"], wish: ["dali", "chongqing"], vibe: ["美食", "拍照"], hard: [] } : { filled: true }); }); }
  if (n >= 2) { if (!S.votes.A.includes(ME)) { Object.keys(S.votes).forEach((k) => (S.votes[k] = S.votes[k].filter((v) => v !== ME))); S.votes.A.push(ME); } S.locked = "A"; S.late = "m08"; }
  if (n >= 4) { payItems().forEach((it) => (S.paid[it.id] = [...it.who])); }
  if (n >= 4 && st === "trip") { S.checkin = going().map((m) => m.id).filter((id) => id !== "m08" && id !== "m06" && id !== ME); S.day = 2; }
  if (n >= 5) { S.checkin = going().map((m) => m.id); }
  if (n === 3) { const items = payItems(); items.forEach((it) => (S.paid[it.id] = it.who.filter((id) => id !== ME && !(it.kind === "stay" && ["m12", "m06", "m14"].includes(id)) && !(it.kind === "transit" && id === "m12")))); }
  S.stage = st; aiReset(); render(); renderAi();
}
function goStage(st) {
  if (STAGE_NO[st] < STAGE_NO[S.stage]) { fresh(); aiReset(); }
  setStage(st);
}
function stageModal() {
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>跳到某个阶段</h2>
    <p class="sub">演示用：真实使用时阶段由团的进度自动推进</p>
    <ul class="todo" style="margin-top:14px">
      ${STAGES.map((s, i) => `<li><span class="ico">${i + 1}</span><div class="grow"><b>${esc(s.name)}</b><small>${esc(["收每个人的日期、预算、想去哪", "AI 合成方案，大家投票，组织者锁定", "AI 排行程，成员提议、分队", "机票民宿拆成每人的份，各付各的", "签到、临时投票、随手记账", "每人转一次结清，生成纪念册"][i])}</small></div><button type="button" class="btn btn-sm ${S.stage === s.id ? "btn-primary" : "btn-ghost"}" data-act="stage" data-id="${s.id}">${S.stage === s.id ? "当前" : "跳到"}</button></li>`).join("")}
    </ul>
    <div class="form-foot"><button type="button" class="btn btn-soft" data-act="reset">重置整个演示</button></div>`);
}

/* ---------- preference form ---------- */
function prefForm(who = ME) {
  const m = mem(who);
  const base = m.filled ? m : { dates: ["07-03", "07-04", "07-05", "07-06", "07-07", "07-08"], maybe: [], budget: 2, wish: ["dali", "xiamen"], vibe: ["自然", "拍照"] };
  const draft = { who, dates: new Set(base.dates), maybe: new Set(base.maybe || []), budget: base.budget || 2, wish: new Set(base.wish), vibe: new Set(base.vibe), hard: new Set(m.hard) };
  const hot = new Set(dateHeat().filter((d) => d.n >= Math.max(1, filled().length - 2)).map((d) => d.key));
  const days = []; for (let d = 1; d <= 31; d++) days.push(d);
  const first = 3;
  const cls = (k) => `${draft.dates.has(k) ? "on" : draft.maybe.has(k) ? "mb" : ""} ${hot.has(k) ? "hot" : ""}`;
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>${who === ME ? "我的偏好" : esc(m.name) + "的偏好"} <small class="mute" style="font-weight:400;font-size:13px">1 分钟</small></h2>
    <p class="sub">只有 AI 领队和组织者看汇总，预算档位不显示给其他人</p>
    <div class="field"><label>7 月哪几天能出来 <span class="hint">点一下能来，再点是勉强，第三下取消</span></label>
      <div class="cal" id="pfCal">${["一", "二", "三", "四", "五", "六", "日"].map((w) => `<div class="h">${w}</div>`).join("")}${Array.from({ length: (first + 6) % 7 }, () => '<div class="dim"></div>').join("")}${days.map((d) => { const k = "07-" + String(d).padStart(2, "0"); return `<div data-k="${k}" class="${cls(k)}">${d}</div>`; }).join("")}</div>
      <div class="legend"><span><i class="y"></i>能来</span><span><i class="mb"></i>勉强</span><span><i class="dotc"></i>大家空得最多</span></div></div>
    <div class="field"><label>预算档位 <span class="hint">匿名，只选档位</span></label>
      <div class="tiers" id="pfTier">${BUDGET_TIERS.map((t) => `<button type="button" class="${draft.budget === t.tier ? "on" : ""}" data-t="${t.tier}"><b>${esc(t.label)}</b>元/人</button>`).join("")}</div></div>
    <div class="field"><label>最想去 <span class="hint">最多两个，第一个算 2 票</span></label>
      <div class="opts" id="pfWish">${Object.entries(DESTS).map(([k, d]) => `<button type="button" class="opt ${draft.wish.has(k) ? "on" : ""}" data-k="${k}">${esc(d.name)}</button>`).join("")}</div></div>
    <div class="field"><label>想怎么玩</label>
      <div class="opts" id="pfVibe">${VIBES.map((v) => `<button type="button" class="opt ${draft.vibe.has(v) ? "on" : ""}" data-k="${v}">${esc(v)}</button>`).join("")}</div></div>
    <div class="field"><label>硬约束 <span class="hint">有就勾，AI 排方案时绕开</span></label>
      <div class="opts" id="pfHard">${HARDS.map((v) => `<button type="button" class="opt coral ${draft.hard.has(v) ? "on" : ""}" data-k="${v}">${esc(v)}</button>`).join("")}</div></div>
    <div class="field"><label>出发城市</label><input class="input" value="${esc(m.city)}（自动带出，可改）" readonly></div>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">取消</button><button type="button" class="btn btn-primary" data-act="savePref">提交，第 ${filled().length + (m.filled ? 0 : 1)}/${active().length} 份</button></div>`);
  $("#pfCal").addEventListener("click", (e) => {
    const d = e.target.closest("[data-k]"); if (!d) return;
    const k = d.dataset.k;
    if (draft.dates.has(k)) { draft.dates.delete(k); draft.maybe.add(k); } else if (draft.maybe.has(k)) draft.maybe.delete(k); else draft.dates.add(k);
    d.className = cls(k);
  });
  $("#pfTier").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("#pfTier").querySelectorAll("button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draft.budget = Number(b.dataset.t); });
  $("#pfWish").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; const k = b.dataset.k; if (draft.wish.has(k)) draft.wish.delete(k); else { if (draft.wish.size >= 2) { const firstKey = [...draft.wish][0]; draft.wish.delete(firstKey); } draft.wish.add(k); } $("#pfWish").querySelectorAll(".opt").forEach((x) => x.classList.toggle("on", draft.wish.has(x.dataset.k))); });
  $("#pfVibe").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; b.classList.toggle("on"); if (b.classList.contains("on")) draft.vibe.add(b.dataset.k); else draft.vibe.delete(b.dataset.k); });
  $("#pfHard").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; b.classList.toggle("on"); if (b.classList.contains("on")) draft.hard.add(b.dataset.k); else draft.hard.delete(b.dataset.k); });
  S.draft = draft;
}
function savePref() {
  const d = S.draft, m = mem(d.who);
  if (!d.dates.size && !d.maybe.size) { toast("至少选一天"); return; }
  Object.assign(m, { filled: true, dates: [...d.dates].sort(), maybe: [...d.maybe].sort(), budget: d.budget, wish: [...d.wish], vibe: [...d.vibe], hard: [...d.hard] });
  closeModal();
  if (d.who !== ME) { S.joined = d.who; S.claim = null; }
  toast(`${d.who === ME ? "已提交" : m.name + " 加入了"}，第 ${filled().length}/${active().length} 份偏好`);
  aiReset(); render(); renderAi();
  if (d.who !== ME) $(".joined")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------- views ---------- */
function stepsHtml(cls = "") {
  const cur = STAGE_NO[S.stage];
  return `<div class="steps ${cls}">${STAGES.map((s, i) => `${i ? `<em class="${i <= cur ? "done" : ""}"></em>` : ""}<span class="${i < cur ? "done" : i === cur ? "on" : ""}"><i>${i < cur ? "✓" : i + 1}</i><u>${esc(s.short)}</u></span>`).join("")}</div>`;
}
function countdown() {
  const ms = Math.max(0, S.deadline - Date.now());
  const h = Math.floor(ms / 3.6e6), mi = Math.floor((ms % 3.6e6) / 6e4);
  return `${h} 小时 ${mi} 分`;
}
function planLine(p) { return `${DESTS[p.dest].name} · ${p.start.replace("-", "/")}–${p.end.replace("-", "/")} · ${p.nights + 1} 天 ${p.nights} 晚`; }

function crewFoot() {
  return { collect: `${filled().length}/${active().length} 人已填偏好`, vote: `投票还剩 ${countdown()}`, plan: "行程共创中", pay: "各付各的进行中", trip: "今天 D2 洱海环湖", settle: "待结清 · 纪念册已生成" }[S.stage];
}
function hello() { const h = new Date().getHours(); return h < 5 ? "夜深了" : h < 11 ? "早上好" : h < 13 ? "中午好" : h < 18 ? "下午好" : "晚上好"; }

function viewHome() {
  const cur = STAGES[STAGE_NO[S.stage]];
  const pct = Math.round(((STAGE_NO[S.stage] + 0.5) / STAGES.length) * 100);
  const where = S.locked ? planLine(lockedPlan()) : S.stage === "collect" ? "目的地待定" : "目的地投票中";
  return `
    <section class="hero">
      <img class="kv" src="img/kv-tall.jpg" alt="">
      <div class="hero-in">
        <span class="tagline"><img src="img/logo.webp" alt="">拼途 · 毕业季拼团规划</span>
        <h1>把散落的人，<br><em>拼成一次旅行。</em></h1>
        <p>人多、出发地散、预算不一，也能三天定下来。每人一分钟填偏好，AI 领队合方案，机票民宿各付各的。</p>
        <div class="row wrap">
          <button type="button" class="btn btn-primary" data-act="newCrew">${ic("plus")}建一个团</button>
          <a class="btn btn-ghost" href="#/join">有邀请码，加入</a>
        </div>
      </div>
    </section>
    <section class="sec">
      <div class="sec-h"><h2>我的团</h2></div>
      <div class="crew-list">
        <a class="card crew-card" href="#/crew/overview">
          <img class="cover" src="img/dali.jpg" alt="">
          <div>
            <div class="row"><h3 class="grow">${esc(CREW.name)}</h3><span class="pill blue">${esc(cur.name)}</span></div>
            <div class="meta">${active().length} 人 · ${esc(where)}</div>
            <div class="bar"><i style="--w:${pct}%"></i></div>
            <div class="foot"><div class="avs">${active().slice(0, 5).map((m) => av(m.id, "xs")).join("")}</div><span class="grow">${crewFoot()}</span><span class="link">进入 ›</span></div>
          </div>
        </a>
        <div class="card crew-card history">
          <img class="cover" src="img/qingdao.jpg" alt="">
          <div>
            <div class="row"><h3 class="grow">${esc(HISTORY_CREW.name)}</h3><span class="pill green">已完成</span></div>
            <div class="meta">${HISTORY_CREW.people} 人 · ${esc(HISTORY_CREW.when)}</div>
            <div class="foot" style="margin-top:14px"><span>人均 ${yuan(HISTORY_CREW.spent)} · ${esc(HISTORY_CREW.note)}</span><span class="link">纪念册 ›</span></div>
          </div>
        </div>
      </div>
    </section>
    <section class="sec">
      <div class="sec-h"><h2>三分钟走完一次毕业旅行</h2></div>
      <p class="sm muted">点哪一步，就从那一步开始演示</p>
      <div class="tour">${TOUR.map(([t, sub, href], i) => `<a class="tour-step" href="${href}"><i class="num">${i + 1}</i><b>${esc(t)}</b><small>${esc(sub)}</small></a>`).join("")}</div>
    </section>
    <section class="sec">
      <div class="sec-h"><h2>毕业季大家都在去</h2><a href="#/crew/plan">加进我们的候选 ›</a></div>
      <div class="hscroll">${INSPIRE.map((k) => { const d = DESTS[k]; return `<div class="dest" data-act="dest" data-k="${k}"><img src="${d.img}" alt="${esc(d.name)}" loading="lazy"><span class="tag pill ${k === "dali" ? "coral" : "navy"}">${k === "dali" ? "候选第 1" : esc(d.days)}</span><div class="body"><h3>${esc(d.name)}<small>${esc(d.sub)}</small></h3><div class="price">人均约 <b>${yuan(d.base)}</b> 起</div><div class="fit">${esc(d.fit)}</div></div></div>`; }).join("")}</div>
    </section>
    <section class="sec">
      <div class="sec-h"><h2>为什么这次不难组织</h2><a href="#/design">产品设计说明 ›</a></div>
      <div class="why">
        <div class="card"><img class="ico" src="img/ic-vote.webp" alt=""><div><h3>定不下来 → AI 先合方案</h3><p>日期、预算、想去哪各填一次，AI 合成 3 套方案，每套写清几人能来、人均多少、谁不行。</p></div></div>
        <div class="card"><img class="ico" src="img/ic-money.webp" alt=""><div><h3>怕垫钱 → 各付各的</h3><p>机票民宿拆成每个人的份，各自在携程下单，组织者不用先掏 2 万再一个个要。</p></div></div>
        <div class="card"><img class="ico" src="img/ic-crew.webp" alt=""><div><h3>有人退出 → 按约定算</h3><p>建团时定好退出规则，谁退出自动算退款和房间差价，通知到室友和财务，不伤感情。</p></div></div>
      </div>
    </section>`;
}

// group size unlocks group stock; before locking, count who can make the leading plan
function perksHtml() {
  const plan = lockedPlan();
  const lead = plan || S.plans[0];
  const n = plan ? going().length : goers(lead).length;
  const top = Math.max(active().length, PERKS[PERKS.length - 1].n);
  const next = PERKS.find((x) => x.n > n);
  const saved = PERKS.filter((x) => x.n <= n).reduce((a, x) => a + x.save, 0);
  return `<div class="card perks">
    <div class="card-h"><h2>人越多越省</h2><small>${plan ? `出发 ${n} 人` : `方案 ${lead.id} 能来 ${n} 人`}</small></div>
    <div class="perk-bar"><div class="bar coral"><i style="--w:${Math.min(100, (n / top) * 100)}%"></i></div>${PERKS.map((x) => `<span class="tick ${x.n <= n ? "on" : ""}" style="--x:${(x.n / top) * 100}%">${x.n}</span>`).join("")}</div>
    <ul>${PERKS.map((x) => `<li class="${x.n <= n ? "on" : ""}"><span class="ico">${ic(x.n <= n ? "check" : "lock")}</span><div class="grow"><b>${x.n} 人 · ${esc(x.name)}</b><small>${esc(x.note)}</small></div><em>${x.n <= n ? `省 ${yuan(x.save)}` : `差 ${x.n - n} 人`}</em></li>`).join("")}</ul>
    <p class="xs mute">${next ? `再来 ${next.n - n} 人就能订「${esc(next.name)}」，` : "三档团购都能订了，"}已经能订的每人省 ${yuan(saved)}。携程团体库存，人数到了才开放。</p>
  </div>`;
}

// the classmate's side of the invite link: tap your name, no signup
function viewJoin() {
  const host = mem(ME);
  const n = active().length;
  const inn = active().filter((m) => m.filled || m.role === "organizer");
  const claim = S.claim ? mem(S.claim) : null;
  const done = S.joined ? mem(S.joined) : null;
  const open = S.members.filter((m) => !m.filled && m.role !== "organizer");
  return `
  <div class="join">
    <div class="join-poster">
      <img src="img/invite.webp" alt="">
      <div class="jp-in">
        <span class="jp-from">${av(ME, "xs")}${esc(host.name)} 邀请你一起去</span>
        <h1>${esc(CREW.name)}</h1>
        <p>${esc(CREW.from)} · 4 到 5 天 · 去哪大家投</p>
      </div>
    </div>
    <div class="join-side">
      ${done ? `<div class="card joined"><img class="mascot-md" src="img/mascot.webp" alt=""><div><b>${esc(done.name)}，欢迎上车</b><small>第 ${filled().length}/${n} 份偏好交给 AI 领队了，方案出来会通知你</small></div><a class="btn btn-primary btn-block" href="#/crew/overview">回到团里（组织者视角）</a></div>` : ""}
      <div class="card guests">
        <div class="row"><div class="avs">${inn.slice(0, 7).map((m) => av(m.id, "sm")).join("")}${inn.length > 7 ? `<span class="av sm more">+${inn.length - 7}</span>` : ""}</div><b class="grow">已经有 ${inn.length} 个同学加入</b></div>
        <div class="reacts">${REACTS.map(([e, c]) => { const on = S.reacted.includes(e); return `<button type="button" class="${on ? "on" : ""}" data-act="react" data-k="${e}">${e}<b class="num">${c + (on ? 1 : 0)}</b></button>`; }).join("")}</div>
        <ul class="wall">${WALL.map((w) => `<li>${av(w.by, "sm")}<p><b>${esc(mem(w.by).name)}</b>${esc(w.text)}</p></li>`).join("")}</ul>
      </div>
      <div class="card">
        <div class="card-h"><h2>加入前，先说清三件事</h2></div>
        <ul class="three">
          <li><span class="ico">${ic("calendar")}</span><div><b>时间你来填</b><small>点能来的日子，勉强的也能标，AI 按大家的空当合方案</small></div></li>
          <li><span class="ico">${ic("lock")}</span><div><b>预算只选档位</b><small>匿名，别人只看得到全团的中位数</small></div></li>
          <li><span class="ico">${ic("card")}</span><div><b>钱各付各的</b><small>机票民宿在自己的携程账户付自己那份，没人垫钱</small></div></li>
        </ul>
      </div>
      ${perksHtml()}
      <div class="card">
        <div class="card-h"><h2>出发约定</h2><small>${esc(host.name)}建团时定的</small></div>
        <ul class="rules">${RULES.map((r) => `<li><b>${esc(r.when)}</b><span>${esc(r.what)}</span></li>`).join("")}</ul>
        <label class="agree"><input type="checkbox" id="agree" ${S.agree ? "checked" : ""}>我看过了，退出按这个算</label>
      </div>
      <div class="card">
        <div class="card-h"><h2>你是哪位同学？</h2><small>点自己的名字，不用注册</small></div>
        <div class="roster">${S.members.map((m) => { const free = !m.filled && m.role !== "organizer"; return `<button type="button" class="${free ? "free" : ""} ${S.claim === m.id ? "on" : ""}" data-act="claim" data-id="${m.id}">${av(m.id, "sm")}<span><b>${esc(m.name)}</b><small>${m.role === "organizer" ? "发起人" : m.filled ? "已填" : S.claim === m.id ? "是我" : "待认领"}</small></span></button>`; }).join("")}</div>
        <p class="xs mute" style="margin-top:8px">名单是${esc(host.name)}从班群导入的；点了名字，换手机打开会要求验证手机号。</p>
      </div>
      ${done ? "" : open.length ? `<div class="join-cta">
        <button type="button" class="btn btn-primary btn-lg btn-block" data-act="joinGo" ${claim ? "" : 'aria-disabled="true"'}>${claim ? `我是${esc(claim.name)}，填偏好 · 1 分钟` : "先在名单里点你的名字"}</button>
        <button type="button" class="decline" data-act="toast" data-msg="已告诉${esc(host.name)}这次去不了，不会再收到催填提醒">这次去不了，告诉${esc(host.name)}</button>
      </div>` : `<div class="join-cta"><a class="btn btn-ghost btn-lg btn-block" href="#/join?stage=collect">名单都认领了，从头演示一遍</a></div>`}
    </div>
  </div>`;
}

// a sketch of how everyone converges: blue legs fly, coral legs take the train
let mapN = 0;
function routeMap(plan) {
  const dest = DESTS[plan.dest].name;
  const W = 360, H = 220, px = 78, py = 30;
  const ex = (plan.exceptions || []).filter((e) => mem(e.who) && !mem(e.who).dropped);
  const cities = {};
  const tot = {};
  active().forEach((m) => { tot[m.city] = (tot[m.city] || 0) + 1; if (!ex.some((e) => e.who === m.id)) cities[m.city] = (cities[m.city] || 0) + 1; });
  const vias = new Set();
  Object.keys(cities).forEach((c) => plan.routes[c].via && vias.add(plan.routes[c].via));
  ex.forEach((e) => e.via && vias.add(e.via));
  const pts = [...Object.keys(cities), ...vias, dest];
  const lat0 = pts.reduce((a, c) => a + GEO[c][1], 0) / pts.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const raw = Object.fromEntries(pts.map((c) => [c, [GEO[c][0] * k, -GEO[c][1]]]));
  const xs = pts.map((c) => raw[c][0]), ys = pts.map((c) => raw[c][1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sc = Math.min((W - 2 * px) / Math.max(x1 - x0, 0.01), (H - 2 * py) / Math.max(y1 - y0, 0.01));
  const ox = (W - (x1 - x0) * sc) / 2, oy = (H - (y1 - y0) * sc) / 2;
  const P = (c) => [ox + (raw[c][0] - x0) * sc, oy + (raw[c][1] - y0) * sc];
  const f1 = (v) => v.toFixed(1);
  const arc = (a, b, bend, cls) => {
    const [ax, ay] = P(a), [bx, by] = P(b);
    const cx = (ax + bx) / 2 - (by - ay) * bend, cy = (ay + by) / 2 + (bx - ax) * bend;
    return { d: `M${f1(ax)} ${f1(ay)}Q${f1(cx)} ${f1(cy)} ${f1(bx)} ${f1(by)}`, mid: [(ax + 2 * cx + bx) / 4, (ay + 2 * cy + by) / 4], cls };
  };
  const legs = Object.keys(cities).map((c) => arc(c, plan.routes[c].via || dest, 0.16, plan.routes[c].mode));
  vias.forEach((v) => legs.push(arc(v, dest, 0.16, "rail")));
  const exLegs = ex.map((e) => ({ ...arc(mem(e.who).city, e.via || dest, -0.22, e.mode), who: mem(e.who).name }));
  const label = (c, name, sub, cls = "") => {
    const [x, y] = P(c); const dir = GEO[c][2];
    const dx = dir.includes("r") ? 9 : dir.includes("l") ? -9 : 0;
    const dy = dir.includes("t") ? -8 : dir.includes("b") ? 16 : 0;
    const anchor = dx > 0 ? "start" : dx < 0 ? "end" : "middle";
    const tx = f1(x + dx);
    return `<text class="${cls}" x="${tx}" y="${f1(y + dy)}" text-anchor="${anchor}"><tspan x="${tx}">${esc(name)}</tspan>${sub ? `<tspan class="sub" x="${tx}" dy="12">${esc(sub)}</tspan>` : ""}</text>`;
  };
  const id = "dots" + ++mapN;
  const meet = (plan.meet.match(/\d{1,2}:\d{2}/) || [""])[0];
  const [dx, dy] = P(dest);
  return `<svg class="route-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="${Object.keys(cities).length} 个出发地到${esc(dest)}的路线">
    <defs><pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1"/></pattern></defs>
    <rect class="bg" width="${W}" height="${H}" fill="url(#${id})"/>
    ${legs.concat(exLegs).map((l) => `<path class="leg ${l.cls}${l.who ? " ex" : ""}" d="${l.d}"/>`).join("")}
    ${Object.keys(cities).map((c) => { const [x, y] = P(c); return `<circle class="dot" cx="${f1(x)}" cy="${f1(y)}" r="4"/>`; }).join("")}
    ${[...vias].map((v) => { const [x, y] = P(v); return `<circle class="via" cx="${f1(x)}" cy="${f1(y)}" r="3.5"/>`; }).join("")}
    <circle class="pulse" cx="${f1(dx)}" cy="${f1(dy)}" r="6"/><circle class="end" cx="${f1(dx)}" cy="${f1(dy)}" r="6"/>
    ${Object.keys(cities).map((c) => label(c, c, `${tot[c]} 人`)).join("")}
    ${[...vias].map((v) => label(v, v, "转动车", "via-t")).join("")}
    ${label(dest, dest, meet ? `${meet} 集合` : "", "end-t")}
    ${exLegs.map((l) => `<text class="ex-note" x="${f1(l.mid[0])}" y="${f1(l.mid[1] + 14)}" text-anchor="middle">${esc(l.who)} · 高铁</text>`).join("")}
    <g class="lg" transform="translate(12 16)"><path class="leg air" d="M0 0h16"/><text x="21" y="3.5">飞机</text><path class="leg rail" d="M52 0h16"/><text x="73" y="3.5">高铁 / 动车</text></g>
  </svg>`;
}

function viewOverview() {
  const f = filled().length, n = active().length, u = unfilled();
  const intro = S.ai[0] || aiIntro();
  const todo = [];
  if (S.stage === "collect") {
    if (!mem(ME).filled) todo.push({ ico: "pen", b: "填我的偏好", s: "1 分钟：日期、预算档位、想去哪", act: "pref", btn: "去填" });
    const others = u.filter((m) => m.id !== ME);
    if (others.length) todo.push({ ico: "bell", b: `${others.length} 人还没填`, s: others.map((m) => m.name).join("、"), act: "nudge", btn: "一键催" });
    if (!u.length) todo.push({ ico: "vote", b: "大家都填好了", s: "去看 AI 合的 3 套方案并投票", act: "go:plan", btn: "去定方案" });
  }
  if (S.stage === "vote") {
    if (!voted().has(ME)) todo.push({ ico: "vote", b: "投我的一票", s: `截止还剩 ${countdown()}`, act: "go:plan", btn: "去投票" });
    todo.push({ ico: "lock", b: "组织者：锁定方案", s: "票数接近时看「能来的人数」再定", act: "go:plan", btn: "去看" });
  }
  if (S.stage === "plan") { todo.push({ ico: "map", b: "行程草稿已生成", s: `${S.proposals.length} 条提议待看，D3 要选小队`, act: "go:itinerary", btn: "去看行程" }); todo.push({ ico: "card", b: "开放各付各的", s: "机票民宿拆成每人的份", act: "stage:pay", btn: "开放付款" }); }
  if (S.stage === "pay") { const items = payItems(); const mine = items.filter((it) => it.who.includes(ME) && !isPaid(it, ME)); if (mine.length) todo.push({ ico: "card", b: `我还有 ${mine.length} 份没付`, s: mine.map((it) => it.name).join("；"), act: "go:money", btn: "去付" }); const unpaid = items.reduce((a, it) => a + it.who.filter((id) => !isPaid(it, id)).length, 0); todo.push({ ico: "bell", b: unpaid ? `还有 ${unpaid} 份没付` : "全员付清", s: unpaid ? "7/1 00:00 机票价格失效" : "出发前 3 天自动发集合提醒", act: unpaid ? "remind" : "stage:trip", btn: unpaid ? "提醒" : "跳到出发" }); }
  if (S.stage === "trip") { todo.push({ ico: "pin", b: "今天 D2 · 洱海环湖", s: `${S.checkin.length}/${going().length} 人已签到`, act: "go:itinerary", btn: "签到" }); todo.push({ ico: "receipt", b: "随手记账", s: `${S.expenses.length} 笔共同消费`, act: "expense", btn: "记一笔" }); }
  if (S.stage === "settle") { todo.push({ ico: "swap", b: "每人转一次就结清", s: "没人多付，没人垫着", act: "go:money", btn: "去结算" }); todo.push({ ico: "camera", b: "纪念册已生成", s: `${ALBUM.length} 张照片 · 每人一句话`, act: "go:album", btn: "去看" }); }
  const plan = lockedPlan();
  const lead = plan || S.plans[0];
  const no = STAGE_NO[S.stage];
  return `
    <div class="crew-cover">
      <img src="${CREW.cover}" alt="">
      <div class="cc-in">
        <span class="pill glass">第 ${no + 1} 步 · ${esc(STAGES[no].name)}</span>
        <h1>${esc(CREW.name)}</h1>
        <div class="meta">${n} 人 · ${new Set(active().map((m) => m.city)).size} 个出发地 · ${esc(plan ? planLine(plan) : CREW.from)}</div>
        <div class="row"><div class="avs">${active().slice(0, 8).map((m) => av(m.id, "sm" + (m.filled ? "" : " off"))).join("")}${n > 8 ? `<span class="av sm more">+${n - 8}</span>` : ""}</div><span class="grow"></span><button type="button" class="btn btn-sm btn-glass" data-act="invite">${ic("link")}邀请</button></div>
      </div>
    </div>
    <div class="card steps-card"><div class="stage-ic"><img src="img/${["ic-pref", "ic-vote", "ic-route", "ic-money", "ic-meet", "ic-album"][no]}.webp" alt=""><div><b>${esc(STAGES[no].name)}</b><small>${esc(["每人一分钟：日期、预算档位、想去哪", "AI 合了三套方案，投票到点组织者锁定", "AI 草稿排好了，提议、分队、定集合点", "机票民宿拆成每人的份，各付各的", "签到、临时投票、随手记一笔", "每人转一次结清，纪念册做好了"][no])}</small></div></div>${stepsHtml()}</div>
    <div class="cols">
      <div>
        <div class="card">
          <div class="card-h"><h2>现在要做的事</h2><small>${STAGES[no].name}</small></div>
          <ul class="todo">${todo.map((t) => `<li><span class="ico">${ic(t.ico)}</span><div class="grow"><b>${esc(t.b)}</b><small>${esc(t.s)}</small></div><button type="button" class="btn btn-sm btn-primary" data-act="${t.act}">${esc(t.btn)}</button></li>`).join("")}</ul>
        </div>
        <div class="card">
          <div class="card-h"><h2>关键数字</h2><small>${plan ? `锁定方案 ${plan.id}` : "按方案 A 算"}</small></div>
          <div class="kpis">
            <div class="kpi"><b class="num">${f}/${n}</b><small>已填偏好</small></div>
            <div class="kpi"><b class="num">${goers(lead).length}</b><small>能来的人</small></div>
            <div class="kpi"><b class="num">${yuan(avgPrice(lead))}</b><small>人均预估</small></div>
          </div>
        </div>
      </div>
      <div>
        <div class="card ai-card">
          <div class="card-h"><h2>${MASCOT}AI 领队</h2><small>看过所有偏好和订单</small></div>
          <p>${esc(intro.text)}</p>
          <div class="chips">${(intro.chips || []).map(([t, a]) => `<button type="button" class="chip purple" data-ai="${a}">${esc(t)}</button>`).join("")}<button type="button" class="chip" data-act="openAi">继续问 ›</button></div>
        </div>
        ${S.stage === "settle" ? "" : perksHtml()}
        ${S.stage === "settle" ? `<a class="album-cover" href="#/crew/album"><img src="img/memory3.jpg" alt=""><div><h2>毕业旅行纪念册</h2><p>5 天 · ${going().length} 人 · ${ALBUM.length} 张照片 · 每人一句话</p></div></a>` : `<div class="card">
          <div class="card-h"><h2>出发约定</h2><a class="link" href="#/crew/members">成员页 ›</a></div>
          <ul class="rules">${RULES.map((r) => `<li><b>${esc(r.when)}</b><span>${esc(r.what)}</span></li>`).join("")}</ul>
          <p class="xs mute" style="margin-top:8px">建团时全员确认过，退出时自动按这个算，不用在群里吵。</p>
        </div>`}
      </div>
    </div>`;
}

function viewPlan() {
  const n = active().length, f = filled();
  const heat = dateHeat();
  const max = Math.max(1, ...heat.map((d) => d.n));
  const lvl = (x) => (x === 0 ? "" : x >= max ? "l4" : x >= max * 0.75 ? "l3" : x >= max * 0.5 ? "l2" : "l1");
  const tiers = BUDGET_TIERS.map((t) => ({ ...t, n: f.filter((m) => m.budget === t.tier).length }));
  const tally = wishTally();
  const focus = lockedPlan() || S.plans[0];
  const sorted = [...S.plans].sort((a, b) => fitScore(b) - fitScore(a));
  const hasVoted = voted().has(ME);
  const vt = Object.keys(S.votes).reduce((a, k) => a + voteCount(k), 0);
  const cities = [...new Set(active().map((m) => m.city))];
  const myCity = mem(ME).city;
  const cell = (m, d) => (!m.filled ? "q" : m.dates.includes(d.key) ? "y" : (m.maybe || []).includes(d.key) ? "mb" : "no");
  return `
    <div class="card">
      <div class="card-h"><h2>${f.length}/${n} 人的偏好汇总</h2>${mem(ME).filled ? `<button type="button" class="btn btn-xs btn-soft" data-act="pref">改我的</button>` : `<button type="button" class="btn btn-sm btn-primary" data-act="pref">填我的偏好</button>`}</div>
      <div class="sm muted" style="margin-bottom:6px">7 月哪几天能出来 · 颜色越深空的人越多${S.locked ? "，红框是锁定的日期" : ""}</div>
      <div class="heat">${heat.map((d) => `<div class="${lvl(d.n)} ${S.locked && lockedPlan().dates.includes(d.key) ? "pick" : ""}" title="7/${d.d}：可以 ${d.y} 人${d.mb ? `，勉强 ${d.mb} 人` : ""}"><b>${d.d}</b>${d.n ? `<span>${d.n}</span>` : ""}</div>`).join("")}</div>
      <div class="legend"><span><i style="background:#dfe8ff"></i>少</span><span><i style="background:#86abff"></i>多</span><span><i style="background:#2f6bff"></i>最多</span><span class="grow"></span><span>数字 = 能来的人数（含勉强）</span></div>
      <details class="who"${S.whoOpen ? " open" : ""}>
        <summary>${ic("chev")}按人看：谁哪天能来<small>方案 ${focus.id} 的日期标红</small></summary>
        <div class="who-grid"><span></span>${heat.map((d) => `<span class="hd ${focus.dates.includes(d.key) ? "pick" : ""}">${d.d}</span>`).join("")}${active().map((m) => `<span class="nm">${esc(m.name)}</span>${heat.map((d) => `<i class="${cell(m, d)} ${focus.dates.includes(d.key) ? "pick" : ""}"></i>`).join("")}`).join("")}</div>
        <div class="legend"><span><i class="y"></i>可以</span><span><i class="mb"></i>勉强</span><span><i class="no"></i>方案日期里不行</span><span><i class="q"></i>没填</span></div>
      </details>
      <div class="grid2" style="margin-top:14px">
        <div>
          <div class="sm muted" style="margin-bottom:6px">预算档位（匿名）</div>
          <ul class="budget-dist">${tiers.map((t) => `<li><span>${esc(t.label)}</span><div class="bar"><i style="--w:${(t.n / Math.max(1, f.length)) * 100}%"></i></div><span>${t.n} 人</span></li>`).join("")}</ul>
        </div>
        <div>
          <div class="sm muted" style="margin-bottom:6px">想去哪 · 第一志愿 2 票</div>
          <div class="wish">${tally.slice(0, 5).map(([k, v]) => `<span>${esc(DESTS[k].name)}<b>${v}</b></span>`).join("")}</div>
          <div class="sm muted" style="margin:10px 0 6px">硬约束</div>
          <div class="pills">${f.flatMap((m) => m.hard.map((h) => `<span class="pill coral">${esc(m.name)}：${esc(h)}</span>`)).join("") || '<span class="pill">没有</span>'}</div>
        </div>
      </div>
    </div>
    <div class="sec-h" style="margin-top:22px"><h2>AI 领队合的方案</h2>${S.locked ? `<span class="pill green">已锁定 ${S.locked}</span>` : `<span class="countdown">${ic("clock")}截止还剩 ${countdown()}</span>`}</div>
    <p class="sm muted">按能来的人数、想去的票数、预算和玩法算匹配度；每套都按 ${cities.length} 个出发地分别算了价钱。${S.locked ? "" : `已投 ${vt}/${n} 人。`}</p>
    <div class="plans">${sorted.map((p, i) => {
      const g = goers(p), c = cant(p), unknown = unfilled().length, vc = voteCount(p.id), mine = (S.votes[p.id] || []).includes(ME), price = avgPrice(p);
      const over = f.filter((m) => BUDGET_TIERS[m.budget - 1].max < personPrice(p, m)).length;
      const ex = (p.exceptions || []).filter((e) => mem(e.who) && !mem(e.who).dropped);
      const rl = reluctant(p);
      const notes = [];
      const who = (ms) => ms.length > 2 ? `${ms[0].name}等 ${ms.length} 人` : ms.map((m) => m.name).join("、");
      if (c.length) notes.push(`${who(c)}日期不合`);
      if (!c.length && !unknown) notes.push("全员日期都合");
      if (rl.length) notes.push(`${who(rl)}有一天勉强`);
      if (unknown) notes.push(`${unknown} 人未填`);
      if (over) notes.push(`${over} 人超预算档`);
      if (ex.length) notes.push(`${ex.map((e) => mem(e.who).name).join("、")}单独排高铁`);
      return `<div class="card plan ${mine ? "voted" : ""} ${S.locked === p.id ? "locked" : ""}">
        <div class="cover"><img src="${p.cover}" alt="" loading="lazy"><span class="badge pill ${i === 0 ? "coral" : "navy"}">${i === 0 ? "匹配最高" : "方案 " + p.id}</span><span class="rank num">${esc(p.id)}</span><div class="lab"><b>${esc(p.title)}</b><small>${esc(p.start.replace("-", "/"))}–${esc(p.end.replace("-", "/"))} · ${p.nights + 1} 天 ${p.nights} 晚</small></div></div>
        <div class="body">
          <div class="stats">
            <div class="${g.length === n ? "good" : c.length ? "warn" : ""}"><b class="num">${g.length}/${n}</b><small>能来</small></div>
            <div><b class="num">${yuan(price)}</b><small>人均约</small></div>
            <div><b class="num">${fitScore(p)}%</b><small>匹配</small></div>
          </div>
          <div class="by-city">${cities.map((city) => { const r = p.routes[city]; const k = active().filter((m) => m.city === city && !ex.some((e) => e.who === m.id)).length; return `<span class="${r.mode} ${city === myCity ? "me" : ""}" title="${esc(city)}出发 ${k} 人"><small>${ic(r.mode === "rail" ? "train" : "plane")}${esc(city)}</small><b class="num">${yuan(r.price + p.stay.per * p.nights + p.play)}</b></span>`; }).join("")}</div>
          <div class="cant">${notes.map((t, j) => `<span>${esc(t)}${j < notes.length - 1 ? "<i>·</i>" : ""}</span>`).join(" ")}</div>
          <div class="pills" style="margin-top:8px">${p.vibes.map((v) => `<span class="pill blue">${esc(v)}</span>`).join("")}</div>
          ${p.aiNote ? `<div class="ai-note">${MASCOT}<span>${esc(p.aiNote.text)}</span></div>` : ""}
          <div class="votes"><div class="bar"><i style="--w:${(vc / Math.max(1, n)) * 100}%"></i></div><b class="num">${vc} 票</b></div>
          <div class="cta">
            <button type="button" class="btn btn-sm btn-ghost" data-act="planDetail" data-id="${p.id}">怎么去 · 怎么算</button>
            ${S.locked ? (S.locked === p.id ? '<span class="btn btn-sm btn-soft">已锁定</span>' : "") : `<button type="button" class="btn btn-sm ${mine ? "btn-soft" : "btn-primary"}" data-act="vote" data-id="${p.id}">${mine ? "已投 ✓" : "投这个"}</button>`}
          </div>
          ${!S.locked && mem(ME).role === "organizer" && hasVoted ? `<button type="button" class="btn btn-sm btn-block" style="margin-top:8px" data-act="lock" data-id="${p.id}">组织者：锁定 ${p.id}</button>` : ""}
        </div>
      </div>`; }).join("")}</div>
    <p class="xs mute" style="margin-top:12px">${S.locked ? "" : "投票到点自动汇总；票数接近时 AI 领队会把折中方案列出来，由组织者定，不替大家决定。"}每套方案下面是按出发地分开算的人均，蓝框是你的出发地。</p>`;
}

function planDetail(id) {
  const p = S.plans.find((x) => x.id === id);
  const cities = {};
  active().forEach((m) => { const ex = (p.exceptions || []).find((e) => e.who === m.id); if (ex) return; (cities[m.city] = cities[m.city] || []).push(m); });
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>方案 ${esc(id)} · ${esc(p.title)}</h2>
    <p class="sub">${esc(planLine(p))} · ${esc(p.meet)}</p>
    <div class="map-card">${routeMap(p)}</div>
    <h3 style="margin-top:14px;font-size:15px">${Object.keys(cities).length} 个出发地怎么合流</h3>
    <ul class="routes" style="margin-top:8px">
      ${Object.entries(cities).map(([c, ms]) => { const r = p.routes[c]; return `<li><div class="city">${esc(c)}<small>${ms.length} 人</small></div><div class="how"><b>${esc(r.how)}</b><small>${esc(r.note)}${r.note ? " · " : ""}到达 ${esc(r.arrive)}</small></div><div class="price"><b class="num">${yuan(r.price)}</b><small>往返/人</small></div></li>`; }).join("")}
      ${(p.exceptions || []).map((e) => { const m = mem(e.who); return m && !m.dropped ? `<li><div class="city">${esc(m.name)}<small>单独排</small></div><div class="how"><b>${esc(e.how)}</b><small>${esc(e.arrive)} · ${esc(e.note)}</small></div><div class="price"><b class="num">${yuan(e.price)}</b><small>往返</small></div></li>` : ""; }).join("")}
    </ul>
    <h3 style="margin-top:16px;font-size:15px">人均怎么算</h3>
    <ul class="routes" style="margin-top:8px">
      <li><div class="city">住</div><div class="how"><b>${esc(p.stay.name)}</b><small>${esc(p.stay.note)}</small></div><div class="price"><b class="num">${yuan(p.stay.per * p.nights)}</b><small>${p.nights} 晚</small></div></li>
      <li><div class="city">吃玩</div><div class="how"><b>门票、租车、吃饭预估</b><small>按行程草稿里的每一项加总</small></div><div class="price"><b class="num">${yuan(p.play)}</b><small>预估</small></div></li>
      <li><div class="city">合计</div><div class="how"><b>人均约 ${yuan(avgPrice(p))}</b><small>最低 ${yuan(Math.min(...active().map((m) => personPrice(p, m))))}，最高 ${yuan(Math.max(...active().map((m) => personPrice(p, m))))}，看出发地</small></div><div class="price"><b class="num">${fitScore(p)}%</b><small>匹配</small></div></li>
    </ul>
    <p class="xs mute" style="margin-top:10px">匹配度 = 能来的人数 40% + 想去的票数 30% + 每个人的价钱在不在自己的预算档 20% + 玩法 10%。价格是携程当前报价，锁定后 48 小时内有效。</p>
    ${!S.locked ? `<div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">关闭</button><button type="button" class="btn btn-primary" data-act="voteClose" data-id="${id}">投这个</button></div>` : ""}`);
}

// the draft checks itself before anyone reads it
function checks(plan) {
  const toMin = (t) => { const [h, mi] = t.split(":").map(Number); return h * 60 + mi; };
  const tier = BUDGET_TIERS[budgetMedianTier() - 1];
  const price = avgPrice(plan);
  const meet = (plan.meet.match(/\d{1,2}:\d{2}/) || ["23:59"])[0];
  const latest = [...new Set(active().map((m) => m.city))].map((c) => plan.routes[c].arrive).sort((a, b) => toMin(b) - toMin(a))[0];
  const most = Math.max(...S.itinerary.map((d) => d.items.filter((i) => i.type === "play").length));
  return [
    [price <= tier.max, price <= tier.max ? `人均 ${yuan(price)}，在中位预算 ${tier.label} 以内` : `人均 ${yuan(price)}，超出中位预算 ${tier.label}`],
    [toMin(latest) < toMin(meet), `最晚 ${latest} 到站，${meet} 集合${toMin(latest) < toMin(meet) ? "来得及" : "赶不上"}`],
    [most <= 3, `每天最多 ${most} 个景点，留了自由活动`],
    [true, "开放时间、门票都按携程数据核过"],
  ];
}

function viewItinerary() {
  if (!S.locked) return `<div class="card"><div class="empty"><img src="img/ic-route.webp" alt=""><b>方案还没锁定</b>投票结束、组织者锁定后，AI 领队会按人数和出发地生成行程草稿，大家再一起改。</div><div class="row" style="justify-content:center"><a class="btn btn-primary" href="#/crew/plan">去定方案</a></div></div>`;
  const plan = lockedPlan();
  if (plan.dest !== "dali") return `<div class="card"><div class="empty"><img src="img/ic-route.webp" alt=""><b>${esc(DESTS[plan.dest].name)}的行程草稿还在排</b>演示只准备了大理这一套完整行程。真实使用时，锁定哪套就按哪套的人数和出发地生成。</div><div class="map-card">${routeMap(plan)}</div><div class="row" style="justify-content:center;margin-top:12px"><button type="button" class="btn btn-primary" data-act="relockA">换成方案 A 看完整演示</button></div></div>`;
  const day = S.itinerary[S.day - 1];
  const base = S.itinerary.reduce((a, d) => a + d.items.filter((i) => i.type !== "team").reduce((b, i) => b + i.cost, 0), 0);
  const myTeam = Object.keys(S.teams).find((k) => S.teams[k].includes(ME));
  return `
    ${S.stage === "trip" ? `<div class="card today">
      <div class="card-h"><h2>今天 · D2 洱海环湖</h2><small>7/4 · 阵雨 26°</small></div>
      <div class="row"><div class="grow"><b>09:00 民宿门口集合，租电动车</b><div class="muted sm">${S.checkin.length}/${going().length} 人已签到 · 刘宇辰 12:20 到站，喜洲汇合</div></div>${S.checkin.includes(ME) ? '<span class="pill green">已签到</span>' : '<button type="button" class="btn btn-sm" data-act="checkin" data-id="' + ME + '">我到了</button>'}</div>
      <div class="checkin">${going().map((m) => av(m.id, S.checkin.includes(m.id) ? "" : "late")).join("")}</div>
      <div class="row" style="margin-top:12px;flex-wrap:wrap"><b class="grow">晚饭吃什么 · 18:00 截止</b>${Object.entries(S.dinnerVote).map(([k, v]) => `<button type="button" class="btn btn-xs ${S.myDinner === k ? "btn-primary" : ""}" data-act="dinner" data-id="${k}">${esc(k)} ${v.length}</button>`).join("")}</div>
      <div class="row" style="margin-top:10px"><button type="button" class="btn btn-sm btn-block" data-act="expense">记一笔</button></div>
    </div>` : ""}
    <div class="card">
      <div class="card-h"><h2>${esc(plan.title)}</h2><small>${esc(planLine(plan))}</small></div>
      <div class="row wrap"><span class="pill blue">${going().length} 人</span><span class="pill">${new Set(going().map((m) => m.city)).size} 个出发地</span><span class="pill">吃玩预估 ${yuan(base + 60)}–${yuan(base + 180)}/人</span><span class="pill purple">AI 草稿 · 可改</span></div>
      <ul class="checks"><b>AI 草稿自查</b>${checks(plan).map(([ok, t]) => `<li class="${ok ? "" : "no"}">${ic(ok ? "check" : "clock")}<span>${esc(t)}</span></li>`).join("")}</ul>
      <div class="daytabs">${S.itinerary.map((d) => `<button type="button" class="${d.day === S.day ? "on" : ""}" data-act="day" data-id="${d.day}"><b>D${d.day}</b><small>7/${Number(d.date.slice(3))} ${d.split ? "分队" : ""}</small></button>`).join("")}</div>
      ${S.day === 1 ? `<div class="map-card">${routeMap(plan)}</div>` : ""}
      <h3 style="margin:10px 0 6px;font-size:16px;color:var(--navy)">${esc(day.title)}</h3>
      <ul class="tl">${day.items.map((it) => `<li class="${it.type}">
        <div class="t num">${esc(it.time)}</div>
        <div class="n"><b>${esc(it.name)}</b>${it.cost ? `<span class="cost">${yuan(it.cost)}/人</span>` : it.type === "transit" || it.type === "stay" ? "" : '<span class="cost free">免费</span>'}</div>
        ${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}
        ${it.type === "team" ? `<div class="team-box"><div class="avs">${S.teams[it.team].slice(0, 8).map((id) => av(id, "sm")).join("")}</div><small class="muted">${S.teams[it.team].length} 人</small>${myTeam === String(it.team) ? '<span class="pill green">我在这队</span>' : `<button type="button" class="btn btn-xs btn-soft" data-act="team" data-id="${it.team}">加入这队</button>`}</div>` : ""}
      </li>`).join("")}</ul>
      ${day.split ? `<p class="xs mute" style="margin-top:8px">分队日各队自己的日程，集合前 30 分钟 AI 领队提醒；没选队的人默认跟小队 2。</p>` : ""}
    </div>
    <div class="card">
      <div class="card-h"><h2>大家的提议</h2><button type="button" class="btn btn-xs btn-soft" data-act="propose">我也提一个</button></div>
      ${S.proposals.map((p) => `<div class="proposal">${av(p.by)}<div class="grow"><p>${esc(p.text)}</p><small>${esc(mem(p.by).name)} · D${p.day}${S.adopted.includes(p.id) ? " · 已采纳" : ""}</small></div>${S.adopted.includes(p.id) ? '<span class="pill green">已采纳</span>' : `<button type="button" class="like ${p.likes.includes(ME) ? "on" : ""}" data-act="like" data-id="${p.id}">👍 ${p.likes.length}</button>${mem(ME).role === "organizer" && p.likes.length >= 3 ? `<button type="button" class="btn btn-xs btn-primary" data-act="adopt" data-id="${p.id}">采纳</button>` : ""}`}</div>`).join("")}
      <p class="xs mute" style="margin-top:8px">赞到 3 个组织者就能一键采纳，改动会同步进每个人的行程和携程订单。</p>
    </div>
    <div class="row" style="margin-top:12px;gap:8px"><button type="button" class="btn btn-ghost grow" data-act="toast" data-msg="已导出到携程行程，地图上能看每天的路线">导出到携程行程</button><button type="button" class="btn btn-ghost grow" data-act="toast" data-msg="已生成可分享的行程卡片">分享行程卡</button></div>`;
}

// what one person's share of the shared bills comes to
function shareOf(id) {
  return S.expenses.reduce((a, e) => { const among = e.among === "all" ? going().map((m) => m.id) : e.among.filter((x) => mem(x) && !mem(x).dropped); return a + (among.includes(id) ? e.amount / among.length : 0); }, 0);
}
function settleHtml() {
  const s = settlement();
  const hub = mem(s.hub);
  const mine = s.net[ME] || 0;
  const key = (t) => t.from + ">" + t.to;
  const left = s.transfers.filter((t) => !S.settled.includes(key(t)));
  const max = Math.max(1, ...Object.values(s.net).map(Math.abs));
  const pairs = new Set();
  S.expenses.forEach((e) => { const among = e.among === "all" ? going().map((m) => m.id) : e.among.filter((x) => mem(x) && !mem(x).dropped); among.forEach((x) => x !== e.by && pairs.add(x + ">" + e.by)); });
  return `
    <div class="card me-settle">
      <small>我的结算</small>
      <b class="num">${mine > 0.5 ? "应收 " + yuan(mine) : mine < -0.5 ? "应付 " + yuan(-mine) : "不用转"}</b>
      <p>${ME === s.hub ? "你是财务，收齐后转给垫过钱的人" : mine > 0.5 ? `${esc(hub.name)}会转给你，${left.some((t) => t.to === ME) ? "还没到账" : "已经到账"}` : mine < -0.5 ? `转给财务${esc(hub.name)}一次就结清` : "你垫的和你花的刚好相抵"}</p>
    </div>
    <div class="card">
      <div class="card-h"><h2>每人只转一次</h2><small>财务${esc(hub.name)}做中枢</small></div>
      <p class="sm muted">${S.expenses.length} 笔共同消费，按笔各还各的要转 ${pairs.size} 次；先算每个人的净额，再统一过财务，只要 ${s.transfers.length} 次。</p>
      <ul class="bal">${going().map((m) => { const v = s.net[m.id] || 0; return `<li class="${v > 0.5 ? "pos" : v < -0.5 ? "neg" : ""}"><span class="nm">${av(m.id, "xs")}${esc(m.name)}</span><span class="track"><i style="--w:${(Math.abs(v) / max) * 50}%"></i></span><b class="num">${v > 0.5 ? "+" : v < -0.5 ? "−" : ""}${Math.round(Math.abs(v))}</b></li>`; }).join("")}</ul>
      <div class="legend"><span><i class="neg"></i>要转出</span><span><i class="pos"></i>要收回</span></div>
      <ul class="settle">${s.transfers.map((t) => { const ok = S.settled.includes(key(t)); return `<li class="${ok ? "done" : ""}">${av(t.from, "sm")}<span class="arrow"><em>${esc(mem(t.from).name)}</em> 转给 <em>${esc(mem(t.to).name)}</em></span><b>${yuan(t.amt)}</b>${ok ? '<span class="pill green">已转</span>' : `<button type="button" class="btn btn-xs btn-soft" data-act="paid" data-id="${key(t)}">标记已转</button>`}</li>`; }).join("")}</ul>
      ${left.length ? `<div class="row" style="margin-top:12px"><button type="button" class="btn btn-primary btn-block" data-act="settle">一键发结清链接（支付宝 / 微信）</button></div>` : `<div class="square">${MASCOT}<div><b>大家两清了</b><small>${s.transfers.length} 笔都转完了，没人多付，没人垫着</small></div></div>`}
      <p class="xs mute" style="margin-top:8px">每笔按参与的人分，算出每个人的净额；欠钱的转给财务，财务再转给垫过钱的人。明细可导出核对。</p>
    </div>`;
}

function viewMoney() {
  const plan = lockedPlan();
  const tier = BUDGET_TIERS[budgetMedianTier() - 1];
  const price = plan ? avgPrice(plan) : avgPrice(S.plans[0]);
  const items = payItems();
  const total = S.expenses.reduce((a, e) => a + e.amount, 0);
  const paidMine = items.filter((it) => it.who.includes(ME) && isPaid(it, ME)).reduce((a, it) => a + it.per, 0);
  return `
    ${S.stage === "settle" ? settleHtml() : ""}
    <div class="money-top">
      <div class="card"><div class="kpi"><small>预算中位（匿名档）</small><b class="num">${esc(tier.label)}</b></div><div class="sp"></div><div class="bar green"><i style="--w:${Math.min(100, (price / tier.max) * 100)}%"></i></div><small class="muted">${plan ? "锁定方案" : "方案 A"}人均约 ${yuan(price)}${price <= tier.max ? "，在档内" : "，超出中位档"}</small></div>
      <div class="card"><div class="kpi"><small>我已付</small><b class="num">${yuan(paidMine)}</b></div><div class="sp"></div><small class="muted">${plan ? `还需付 ${yuan(items.filter((it) => it.who.includes(ME) && !isPaid(it, ME)).reduce((a, it) => a + it.per, 0))} · 行中共同消费另记` : "锁定方案后开放各付各的"}</small></div>
    </div>
    <div class="card">
      <div class="card-h"><h2>各付各的</h2><small>${plan ? "携程订单拆成每人的份" : "锁定方案后开放"}</small></div>
      ${plan ? items.map((it) => { const paid = it.who.filter((id) => isPaid(it, id)).length; const mine = it.who.includes(ME); const rail = it.mode === "rail"; return `<div class="bill"><span class="ico ${rail ? "rail" : ""}">${ic(it.kind === "stay" ? "bed" : rail ? "train" : "plane")}</span><div class="grow"><b>${esc(it.name)}</b><small>${esc(it.note)} · ${it.who.length} 人</small><div class="paid-row"><div class="bar ${paid === it.who.length ? "green" : ""}"><i style="--w:${(paid / it.who.length) * 100}%"></i></div><small>${paid}/${it.who.length} 已付</small></div></div><div class="amt"><b class="num">${yuan(it.per)}</b><small>/人</small>${mine ? (isPaid(it, ME) ? '<div><span class="pill green">我已付</span></div>' : `<div><button type="button" class="btn btn-xs btn-primary" data-act="pay" data-id="${it.id}">付我的</button></div>`) : ""}</div></div>`; }).join("") + `<div class="row" style="margin-top:10px"><button type="button" class="btn btn-sm btn-soft grow" data-act="remind">提醒没付的人</button></div><p class="lock-note">${ic("clock")}价格保留到 7/1 00:00，过时重新报价</p>` : `<div class="empty"><img src="img/ic-money.webp" alt="">方案锁定后，机票和民宿按人拆单：每个人在自己的携程账户付自己那份，组织者只看谁付了。</div>`}
    </div>
    <div class="card">
      <div class="card-h"><h2>行中记账</h2>${S.stage === "trip" || S.stage === "settle" ? `<button type="button" class="btn btn-xs btn-primary" data-act="expense">记一笔</button>` : `<small>出行中打开</small>`}</div>
      ${S.stage === "trip" || S.stage === "settle" ? S.expenses.map((e) => { const amongN = e.among === "all" ? going().length : e.among.filter((id) => mem(id) && !mem(id).dropped).length; return `<div class="bill">${av(e.by)}<div class="grow"><b>${esc(e.name)}</b><small>${esc(mem(e.by).name)} 垫付 · D${e.day} · ${amongN} 人分</small></div><div class="amt"><b class="num">${yuan(e.amount)}</b><small>${yuan(e.amount / amongN)}/人</small></div></div>`; }).join("") + `<div class="row" style="margin-top:8px"><small class="muted grow">${S.expenses.length} 笔 · 共 ${yuan(total)}</small></div>` : `<div class="empty"><img src="img/ic-meet.webp" alt="">出发后谁垫了钱当场记一笔：谁付的、谁参与、按份或按比例。结束时自动算净额，每人只转一次。</div>`}
    </div>
    <div class="card">
      <div class="card-h"><h2>出发约定</h2><small>建团时全员确认</small></div>
      <ul class="rules">${RULES.map((r) => `<li><b>${esc(r.when)}</b><span>${esc(r.what)}</span></li>`).join("")}</ul>
    </div>`;
}

function viewMembers() {
  const plan = lockedPlan();
  const items = payItems();
  return `
    <div class="card">
      <div class="card-h"><h2>${active().length} 人 · ${S.members.filter((m) => m.dropped).length ? `${S.members.filter((m) => m.dropped).length} 人退出` : "没人退出"}</h2><button type="button" class="btn btn-xs btn-soft" data-act="invite">邀请链接</button></div>
      ${S.members.map((m) => { const st = m.dropped ? '<span class="pill red">已退出</span>' : S.stage === "collect" ? (m.filled ? '<span class="pill green">已填</span>' : '<span class="pill sun">没填</span>') : S.stage === "vote" ? (voted().has(m.id) ? '<span class="pill green">已投</span>' : '<span class="pill sun">没投</span>') : S.stage === "pay" ? (items.every((it) => !it.who.includes(m.id) || isPaid(it, m.id)) ? '<span class="pill green">已付清</span>' : '<span class="pill sun">有未付</span>') : S.stage === "trip" ? (S.checkin.includes(m.id) ? '<span class="pill green">已签到</span>' : '<span class="pill sun">未到</span>') : plan && !canGo(m, plan) ? '<span class="pill blue">7/4 加入</span>' : '<span class="pill green">去</span>';
        return `<div class="member">${av(m.id, m.dropped ? "off" : "")}<div><b>${esc(m.name)}${m.id === ME ? "（我）" : ""}</b><small>${esc(m.city)}出发${m.role === "organizer" ? " · 组织者" : m.role === "finance" ? " · 财务" : ""}${m.hard.length ? " · " + esc(m.hard.join("、")) : ""}${S.locked && !m.dropped && roommate(m.id) ? " · 室友" + esc(roommate(m.id).name) : ""}</small></div><div class="st row">${st}${!m.dropped && m.id !== ME && STAGE_NO[S.stage] >= 2 && STAGE_NO[S.stage] <= 3 ? `<button type="button" class="btn btn-xs btn-ghost" data-act="drop" data-id="${m.id}">退出</button>` : ""}${m.dropped ? `<button type="button" class="btn btn-xs btn-ghost" data-act="undrop" data-id="${m.id}">撤销</button>` : ""}</div></div>`; }).join("")}
      <p class="xs mute" style="margin-top:10px">角色：组织者定方案、采纳提议；财务看账；其他人填偏好、投票、付自己的。${STAGE_NO[S.stage] >= 2 && STAGE_NO[S.stage] <= 3 ? "点「退出」可以演示有人退出时怎么算。" : "锁定方案后可以演示有人退出。"}</p>
    </div>
    <div class="card">
      <div class="card-h"><h2>出发约定</h2><small>建团时全员确认</small></div>
      <ul class="rules">${RULES.map((r) => `<li><b>${esc(r.when)}</b><span>${esc(r.what)}</span></li>`).join("")}</ul>
      <p class="xs mute" style="margin-top:8px">谁退出，系统按这个自动算退款、房间差价和受影响的人，通知室友和财务。</p>
    </div>`;
}

function viewAlbum() {
  if (S.stage !== "settle") return `<div class="card"><div class="empty"><img src="img/ic-album.webp" alt=""><b>旅行结束后生成</b>照片按时间轴排，每人一句话，一键做成纪念册分享到携程社区或小红书。</div><div class="row" style="justify-content:center"><button type="button" class="btn btn-primary" data-act="stage" data-id="settle">演示：看旅行结束后的样子</button></div></div>`;
  const plan = lockedPlan();
  const g = going();
  const spent = g.reduce((a, m) => a + personPrice(plan, m) - plan.play + shareOf(m.id), 0) / g.length;
  return `
    <div class="album-cover"><img src="img/hero.jpg" alt=""><div><h2>${esc(CREW.name)}</h2><p>${esc(DESTS[plan.dest].name)} · ${plan.start.replace("-", "/")}–${plan.end.replace("-", "/")} · ${g.length} 人 · ${new Set(g.map((m) => m.city)).size} 个出发地</p></div></div>
    <div class="card"><div class="kpis k4"><div class="kpi"><b class="num">${plan.nights + 1}</b><small>天</small></div><div class="kpi"><b class="num">${g.length}</b><small>人 · ${new Set(g.map((m) => m.city)).size} 城</small></div><div class="kpi"><b class="num">${yuan(spent)}</b><small>人均实际花费</small></div><div class="kpi"><b class="num">0</b><small>笔糊涂账</small></div></div><div class="sp"></div><small class="muted">人均含往返交通、住宿和行中共同消费；机票民宿各付各的，共同消费每人和财务转一次就结清。</small></div>
    <div class="card"><div class="card-h"><h2>我们的路线</h2><small>${new Set(g.map((m) => m.city)).size} 个出发地，${esc(DESTS[plan.dest].name)}会合</small></div><div class="map-card">${routeMap(plan)}</div></div>
    <div class="sec-h" style="margin-top:18px"><h2>照片 · 按时间轴</h2><button type="button" class="btn btn-xs btn-soft" data-act="toast" data-msg="已从 14 个人的相册里挑了 24 张，重复的合并了">AI 挑图</button></div>
    <div class="album">${ALBUM.map((a) => `<figure><img src="${a.img}" alt="" loading="lazy"><figcaption>${esc(a.cap)} · ${esc(mem(a.by).name)}</figcaption></figure>`).join("")}</div>
    <div class="sec-h" style="margin-top:18px"><h2>每人一句话</h2><small class="mute">${QUOTES.length}/${g.length}</small></div>
    <div class="stack">${QUOTES.map((q) => `<div class="quote">${av(q.by, "sm")}<p>${esc(q.text)} <small>· ${esc(mem(q.by).name)}</small></p></div>`).join("")}<button type="button" class="btn btn-ghost" data-act="toast" data-msg="已提醒还没写的人">催还没写的人</button></div>
    <div class="row" style="margin-top:14px;gap:8px"><button type="button" class="btn btn-primary grow" data-act="toast" data-msg="纪念册已生成，链接发到群里了">生成纪念册</button><button type="button" class="btn btn-ghost grow" data-act="toast" data-msg="已按携程社区格式整理成一篇游记草稿">发到携程社区</button></div>
    <p class="xs mute" style="margin-top:10px">明年同一天，AI 领队会问一句「要不要再约」，把这次的偏好直接带过去。</p>`;
}

function viewMe() {
  return `
    <div class="me-head">${av(ME, "lg")}<div><h1>${esc(mem(ME).name)}</h1><div class="muted sm">上海出发 · 组织者 · 信管 2026 届</div></div></div>
    <div class="card"><ul class="me-list">
      <li>出发城市<small>上海（自动）</small></li>
      <li>证件信息<small>已在携程登记，拼单直接用</small></li>
      <li>支付方式<small>携程 · 支付宝</small></li>
      <li>我的偏好<small>${mem(ME).filled ? "已填" : "未填"}</small></li>
      <li>历史团<small>2 个</small></li>
    </ul></div>
    <div class="card"><div class="card-h"><h2>演示</h2></div><div class="row wrap" style="gap:8px"><button type="button" class="btn btn-sm btn-soft" data-act="stages">跳到某个阶段</button><button type="button" class="btn btn-sm btn-ghost" data-act="reset">重置演示</button><a class="btn btn-sm btn-ghost" href="#/design">产品设计说明</a></div></div>`;
}

function newCrew() {
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>建一个团</h2>
    <p class="sub">一分钟建好，把链接丢进班群就行</p>
    <div class="field"><label>团的名字</label><input class="input" value="信管 2026 届 · 毕业旅行"></div>
    <div class="field"><label>大概什么时候走</label><div class="opts"><button type="button" class="opt on">毕业典礼后两周内</button><button type="button" class="opt">7 月中</button><button type="button" class="opt">8 月</button><button type="button" class="opt">还没定</button></div><div class="hint">不用定死日期，每个人填自己能出来的日子</div></div>
    <div class="field"><label>大概几个人</label><div class="opts"><button type="button" class="opt">5 人以内</button><button type="button" class="opt on">6–15 人</button><button type="button" class="opt">15 人以上</button></div></div>
    <div class="field"><label>出发约定 <span class="hint">全员加入时确认，退出按这个算</span></label><ul class="rules" style="margin-top:4px">${RULES.map((r) => `<li><b>${esc(r.when)}</b><span>${esc(r.what)}</span></li>`).join("")}</ul><button type="button" class="btn btn-xs btn-soft" style="margin-top:6px;justify-self:start" data-act="toast" data-msg="演示版用默认约定">改一改</button></div>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">取消</button><button type="button" class="btn btn-primary" data-act="invite">生成邀请链接</button></div>`);
}
function invite() {
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>邀请同学</h2>
    <p class="sub">链接丢进班群，点开就能填偏好，不用下载新 App</p>
    <div class="card flat" style="margin-top:14px;text-align:center;padding:22px">
      <img class="logo-big" src="img/logo-3d.webp" alt="" style="margin:0 auto 10px">
      <b style="font-size:17px;color:var(--navy)">${esc(CREW.name)}</b>
      <p class="sm muted" style="margin-top:4px">${active().length} 人已加入 · 组织者 ${esc(mem(ME).name)}</p>
      <p class="num" style="margin-top:12px;font-size:22px;letter-spacing:.12em;color:var(--blue);font-weight:700">PT-2026-XG</p>
      <small class="mute">携程 App 或小程序里输邀请码也能进</small>
    </div>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="toast" data-msg="已复制链接">复制链接</button><button type="button" class="btn btn-primary" data-act="toast" data-msg="已打开微信分享">发到微信群</button></div>
    <a class="link preview-link" href="#/join">${ic("link")}看看同学点开链接是什么样</a>`);
}
function destSheet(k) {
  const d = DESTS[k];
  const inPlan = S.plans.find((p) => p.dest === k);
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <img src="${d.img}" alt="" style="border-radius:14px;height:170px;width:100%;object-fit:cover;margin-top:6px">
    <h2 style="margin-top:12px">${esc(d.name)} <small class="mute" style="font-size:13px;font-weight:400">${esc(d.sub)}</small></h2>
    <p class="sub">${esc(d.days)} · 人均约 ${yuan(d.base)} 起 · ${esc(d.tag)}</p>
    <p style="margin-top:10px;font-size:14px">${esc(d.fit)}。加进候选后，AI 领队会按每个人的日期、出发地和预算单独算一套方案。</p>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">关闭</button>${inPlan ? `<a class="btn btn-primary" href="#/crew/plan" data-act="close">已在候选，去投票</a>` : `<button type="button" class="btn btn-primary" data-act="toast" data-msg="已加入候选，AI 领队会按大家的日期和预算算一套方案">加进我们的候选</button>`}</div>`);
}

/* ---------- shell ---------- */
const NAV = [
  ["overview", "概览", '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'],
  ["plan", "定方案", '<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/>'],
  ["itinerary", "行程", '<path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>'],
  ["money", "费用", '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>'],
  ["members", "成员", '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 13.5c2.8 0 5 1.8 5.5 5.5"/>'],
];
function route() {
  const h = location.hash.replace(/^#\/?/, "").split("?")[0] || "home";
  const [a, b] = h.split("/");
  return a === "crew" ? { page: b || "overview", crew: true } : { page: a, crew: false };
}
let lastRoute = "";
function render() {
  const r = route();
  const main = $("#main"), top = $("#top"), tab = $("#tabbar");
  const views = { home: viewHome, overview: viewOverview, plan: viewPlan, itinerary: viewItinerary, money: viewMoney, members: viewMembers, album: viewAlbum, design: () => DESIGN_DOC(), me: viewMe, join: viewJoin };
  const titles = { overview: "概览", plan: "定方案", itinerary: "行程", money: "费用", members: "成员", album: "纪念册", design: "产品设计说明", me: "我的", join: "邀请函" };
  const page = views[r.page] ? r.page : "home";
  main.innerHTML = views[page]();
  main.className = "main" + (page === "design" ? " doc" : "");
  document.body.dataset.page = page;
  if (page === "home") {
    top.className = "top plain";
    top.innerHTML = `<a class="brand only-phone" href="#/home" style="padding-left:8px"><img class="logo" src="img/logo.webp" alt=""><span><b>拼途</b><small>毕业旅行拼团规划 · 携程</small></span></a><div class="hello only-wide">${av(ME, "")}<span><b>${hello()}，${esc(mem(ME).name)}</b><small>${esc(CREW.name)} · ${STAGES[STAGE_NO[S.stage]].name}</small></span></div><span class="grow"></span><div class="act"><a class="btn btn-sm btn-ghost" href="#/design">设计说明</a></div>`;
    tab.innerHTML = "";
  } else {
    top.className = "top";
    const sub = r.crew ? `${esc(CREW.name)} · ${STAGES[STAGE_NO[S.stage]].name}` : page === "design" ? "为什么这样设计" : page === "join" ? "同学点开邀请链接看到的页面" : "";
    top.innerHTML = `<a class="back" href="${r.crew && page !== "overview" ? "#/crew/overview" : "#/home"}" aria-label="返回"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></a><div class="ttl"><b>${esc(titles[page] || "")}</b>${sub ? `<small>${sub}</small>` : ""}</div>${r.crew ? stepsHtml() + `<div class="act"><button type="button" class="btn btn-sm btn-soft" data-act="stages" title="演示：跳到某个阶段">演示 ▾</button></div>` : ""}`;
    tab.innerHTML = r.crew || page === "me" ? NAV.map(([k, n, svg]) => `<a href="#/crew/${k}" class="${page === k ? "on" : ""}"><svg viewBox="0 0 24 24">${svg}</svg>${n}</a>`).join("") : "";
  }
  $("#sideNav").innerHTML = NAV.concat([["album", "纪念册", '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>']]).map(([k, n, svg]) => `<a href="#/crew/${k}" class="${r.crew && page === k ? "on" : ""}"><svg viewBox="0 0 24 24">${svg}</svg>${n}${k === "overview" && S.stage === "collect" && unfilled().length ? `<span class="pill sun">${unfilled().length}</span>` : ""}</a>`).join("");
  $("#crewSwitch").innerHTML = `<button type="button" class="${r.crew ? "on" : ""}" data-go="#/crew/overview"><img src="img/dali.jpg" alt=""><span><b>${esc(CREW.name)}</b><small>${STAGES[STAGE_NO[S.stage]].name} · ${active().length} 人</small></span></button><button type="button" data-go="#/home"><img src="img/qingdao.jpg" alt=""><span><b>${esc(HISTORY_CREW.name)}</b><small>已完成</small></span></button><a class="new" href="#/home" data-act="newCrew"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>建一个团</a>`;
  document.querySelectorAll(".side-link").forEach((a) => a.classList.toggle("on", a.dataset.nav === page));
  $("#aiFab").hidden = page === "design" || page === "join";
  document.body.classList.toggle("no-tabs", !tab.innerHTML);
  // keep the scroll position when the same page re-renders after a tap
  const at = location.hash.split("?")[0] || "#/home";
  if (at !== lastRoute) { lastRoute = at; document.querySelector(".stage").scrollTop = 0; window.scrollTo(0, 0); }
}
function renderAi() {
  const body = $("#aiBody");
  const intro = `<div class="ai-hello"><img class="mascot-md" src="img/mascot.webp" alt=""><div><b>我是 AI 领队</b><p>看得到这个团的偏好、方案和订单。我只出主意、算账、提醒；锁定方案、采纳提议、确认退出，都由你们来点。</p></div></div>`;
  const tries = S.ai.length < 3 ? `<div class="ai-try"><small>可以这样问</small><div class="chips">${TRY.map(([t, a]) => `<button type="button" class="chip purple" data-ai="${a}">${esc(t)}</button>`).join("")}</div></div>` : "";
  body.innerHTML = intro + S.ai.map((m) => `<div class="msg ${m.who}">${esc(m.text)}${m.chips && m.chips.length ? `<div class="chips">${m.chips.map(([t, a]) => `<button type="button" class="chip purple" data-ai="${a}">${esc(t)}</button>`).join("")}</div>` : ""}</div>`).join("") + tries;
  body.scrollTop = body.scrollHeight;
  if ($("#aiPanel").classList.contains("open")) { $("#aiBadge").hidden = true; $("#aiBadge").textContent = ""; }
}
function openAi(force) {
  const p = $("#aiPanel");
  if (window.matchMedia("(min-width: 1180px)").matches) return;
  if (force === false) p.classList.remove("open"); else p.classList.toggle("open", force === true ? true : !p.classList.contains("open"));
  if (p.classList.contains("open")) { $("#aiBadge").hidden = true; $("#aiBadge").textContent = ""; const b = $("#aiBody"); b.scrollTop = b.scrollHeight; }
}
function modal(html) { openAi(false); const m = $("#modal"); $("#modalCard").innerHTML = html; m.hidden = false; $("#modalCard").scrollTop = 0; document.body.style.overflow = "hidden"; document.body.classList.add("modal-on"); }
function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; document.body.classList.remove("modal-on"); }
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600); }

document.addEventListener("click", (e) => {
  const ai = e.target.closest("[data-ai]");
  if (ai) { const a = ai.dataset.ai; if (!ai.closest("#aiPanel")) openAi(true); aiMe(ai.textContent.trim()); if (a === "addD") addPlanD(); else aiAction(a); return; }
  const go = e.target.closest("[data-go]");
  if (go) { location.hash = go.dataset.go; return; }
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const act = el.dataset.act, id = el.dataset.id;
  if (el.tagName === "A" && act === "close") { closeModal(); return; }
  e.preventDefault();
  const acts = {
    close: closeModal, newCrew, invite, join: () => (location.hash = "#/join"), pref: () => prefForm(), savePref, nudge, vote: () => vote(id), voteClose: () => { closeModal(); vote(id); }, lock: () => lockPlan(id), doLock: () => doLock(id), planDetail: () => planDetail(id),
    day: () => { S.day = Number(id); render(); }, team: () => joinTeam(id), like: () => like(id), adopt: () => adopt(id), propose: () => { S.proposals.push({ id: "p" + Date.now(), by: ME, day: S.day, text: "D" + S.day + " 加一个人民路的夜市小吃，人均约 30", likes: [] }); toast("提议已发出，等大家点赞"); render(); },
    pay: () => payMine(id), remind, checkin: () => checkin(id), dinner: () => dinner(id), expense: openExpense, saveExpense, settle: settleAll, drop: () => dropModal(id), doDrop: () => doDrop(id), undrop: () => undrop(id),
    stages: stageModal, stage: () => { closeModal(); goStage(id); if (id === "settle") location.hash = "#/crew/album"; },
    claim: () => { const m = mem(id); if (m.role === "organizer") { toast(`${m.name}是发起人`); return; } if (m.filled) { toast(`${m.name}已经填过了；是本人的话，换手机打开会要求验证手机号`); return; } S.claim = S.claim === id ? null : id; render(); },
    joinGo: () => { if (!S.claim) { toast("先在名单里点你的名字"); $(".roster")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; } if (!S.agree) { toast("先勾一下出发约定"); $(".agree")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; } prefForm(S.claim); },
    react: () => { const k = el.dataset.k; const on = S.reacted.includes(k); S.reacted = on ? S.reacted.filter((x) => x !== k) : S.reacted.concat(k); el.classList.toggle("on", !on); el.querySelector("b").textContent = REACTS.find(([e]) => e === k)[1] + (on ? 0 : 1); },
    paid: () => markPaid(id), relockA: () => { S.locked = "A"; S.late = "m08"; aiReset(); render(); renderAi(); }, reset: () => { fresh(); aiReset(); closeModal(); toast("演示已重置"); location.hash = "#/home"; render(); renderAi(); },
    dest: () => destSheet(el.dataset.k), openAi: () => openAi(true), toast: () => toast(el.dataset.msg || "好"),
    "go:plan": () => (location.hash = "#/crew/plan"), "go:itinerary": () => (location.hash = "#/crew/itinerary"), "go:money": () => (location.hash = "#/crew/money"), "go:members": () => (location.hash = "#/crew/members"), "go:album": () => (location.hash = "#/crew/album"), "stage:pay": () => setStage("pay"), "stage:trip": () => setStage("trip"),
  };
  if (acts[act]) acts[act]();
});
$("#modalMask").addEventListener("click", closeModal);
$("#aiFab").addEventListener("click", () => openAi());
$("#aiClose").addEventListener("click", () => openAi(false));
$("#aiAsk").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#aiInput").value.trim(); if (!v) return; $("#aiInput").value = ""; aiMe(v); const r = freeAnswer(v); setTimeout(() => aiSay(r.text, r.chips), 400); });
document.addEventListener("change", (e) => { if (e.target.id === "agree") S.agree = e.target.checked; });
document.addEventListener("toggle", (e) => { if (e.target.classList && e.target.classList.contains("who")) S.whoOpen = e.target.open; }, true);
window.addEventListener("hashchange", () => { closeModal(); openAi(false); if (!applyLink()) render(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); openAi(false); } });
setInterval(() => { if (S.stage === "vote" && route().crew) document.querySelectorAll(".countdown").forEach((el) => (el.innerHTML = el.innerHTML.replace(/截止还剩 .*$/, "截止还剩 " + countdown()))); }, 30000);

// a link can open the demo at a given moment, e.g. #/crew/money?stage=settle or #/crew/members?stage=pay&show=drop
function applyLink() {
  const [path, q] = location.hash.split("?");
  const qs = q || location.search.slice(1);
  if (!qs) return false;
  const p = new URLSearchParams(qs);
  history.replaceState(null, "", location.pathname + path);
  const st = p.get("stage");
  if (st && STAGE_NO[st] !== undefined) { fresh(); aiReset(); setStage(st); }
  if (p.get("day")) S.day = Number(p.get("day"));
  lastRoute = "";
  render(); renderAi();
  const show = p.get("show");
  if (show === "pref") prefForm();
  if (show === "drop") dropModal("m13");
  if (show === "lock" && !S.locked) lockPlan("A");
  if (show === "detail") planDetail("A");
  return true;
}
aiReset();
if (!applyLink()) { render(); renderAi(); }

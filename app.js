const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const yuan = (n) => "¥" + Math.round(n).toLocaleString("zh-CN");
const clone = (o) => JSON.parse(JSON.stringify(o));
const COLORS = ["#2f6bff", "#ff6b4a", "#16b36a", "#6c4cf1", "#ffb400", "#0ea5e9", "#ec4899", "#14b8a6", "#f97316", "#8b5cf6", "#22c55e", "#e11d48", "#3b82f6", "#a16207"];
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
  };
}
fresh();

const mem = (id) => S.members.find((m) => m.id === id);
const color = (id) => COLORS[S.members.findIndex((m) => m.id === id) % COLORS.length];
const who = (m) => (m.id === ME ? "你" : m.name);
const av = (id, cls = "") => { const m = mem(id); return `<span class="av ${cls}" style="--c:${color(id)}" title="${esc(m.name)}">${esc(m.name[0])}</span>`; };
const active = () => S.members.filter((m) => !m.dropped);
const filled = () => active().filter((m) => m.filled);
const unfilled = () => active().filter((m) => !m.filled);
const canGo = (m, plan) => m.filled && plan.dates.every((d) => m.dates.includes(d));
const goers = (plan) => active().filter((m) => canGo(m, plan));
const cant = (plan) => active().filter((m) => m.filled && !canGo(m, plan));

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
  const price = avgPrice(plan);
  const budget = f.filter((m) => BUDGET_TIERS[m.budget - 1].max >= price).length / f.length;
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
    days.push({ key, d, n: filled().filter((m) => m.dates.includes(key)).length });
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
    (groups[key] = groups[key] || { key, ms: [], how: ex ? ex.how : plan.routes[m.city].how, price: ex ? ex.price : plan.routes[m.city].price, city: ex ? m.name : m.city }).ms.push(m.id);
  });
  Object.values(groups).forEach((g) => items.push({ id: "r-" + g.key, name: `${g.city} · ${g.how}`, per: g.price, who: g.ms, kind: "transit", note: "往返 · 携程订单，各付各的" }));
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
  toast(`${s.transfers.length} 笔转账已发给每个人，支付宝一键付`);
  aiSay(`结清链接发到每个人了，每人只转一次，没人多付一分。`, [["看纪念册", "go:album"]]);
}
function dropModal(id) {
  const m = mem(id);
  if (!m || m.dropped) return;
  const plan = lockedPlan();
  const stayDiff = plan ? plan.stay.per * plan.nights : 600;
  const mate = going().find((x) => x.id !== id && x.city === m.city) || going().find((x) => x.id !== id);
  const fee = plan ? Math.round(plan.routes[m.city].price * 0.2) : 300;
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>${esc(m.name)} 退出会怎样</h2>
    <p class="sub">演示：今天 7/1，出发前 2 天，按建团时定的出发约定（3 天内）</p>
    <div class="card flat" style="margin-top:14px">
      <ul class="bill-list">
        <li class="bill"><span class="ico">✈️</span><div><b>机票 ${esc(m.city)}往返</b><small>携程退改：退票费 ${yuan(fee)}，其余 ${yuan((plan ? plan.routes[m.city].price : 1290) - fee)} 原路退回</small></div></li>
        <li class="bill"><span class="ico">🛏️</span><div><b>房间</b><small>室友 ${esc(mate ? mate.name : "")} 变单人，差价 ${yuan(stayDiff)}，按约定由 ${esc(m.name)} 承担</small></div></li>
        <li class="bill"><span class="ico">👥</span><div><b>其他人</b><small>人均不变，行程不改；小队和集合名单自动更新</small></div></li>
      </ul>
    </div>
    <p class="sm muted" style="margin-top:10px">确认后：通知 ${esc(mate ? mate.name : "室友")}和财务，退款走携程原路，群里不用再解释一遍。</p>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">不退了</button><button type="button" class="btn btn-coral" data-act="doDrop" data-id="${id}">确认退出</button></div>`);
}
function doDrop(id) {
  const m = mem(id); m.dropped = true;
  Object.keys(S.teams).forEach((k) => (S.teams[k] = S.teams[k].filter((x) => x !== id)));
  closeModal(); toast(`${m.name} 已退出，退款和差价算好了`);
  aiSay(`${m.name} 退出了。机票退票费按携程规则扣，房间差价 ${yuan(lockedPlan() ? lockedPlan().stay.per * lockedPlan().nights : 600)} 由他承担，室友和财务都通知到了。现在 ${going().length} 人出发，人均不变。`, []);
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
function prefForm() {
  const m = mem(ME);
  const draft = { dates: new Set(m.filled ? m.dates : ["07-03", "07-04", "07-05", "07-06", "07-07", "07-08"]), budget: m.filled ? m.budget : 2, wish: new Set(m.filled ? m.wish : ["dali", "xiamen"]), vibe: new Set(m.filled ? m.vibe : ["自然", "拍照"]), hard: new Set(m.hard) };
  const hot = new Set(dateHeat().filter((d) => d.n >= Math.max(1, filled().length - 2)).map((d) => d.key));
  const days = []; for (let d = 1; d <= 31; d++) days.push(d);
  const first = 3;
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>我的偏好 <small class="mute" style="font-weight:400;font-size:13px">1 分钟</small></h2>
    <p class="sub">只有 AI 领队和组织者看汇总，预算档位不显示给其他人</p>
    <div class="field"><label>7 月哪几天能出来 <span class="hint">红点是大家空得最多的日子</span></label>
      <div class="cal" id="pfCal">${["一", "二", "三", "四", "五", "六", "日"].map((w) => `<div class="h">${w}</div>`).join("")}${Array.from({ length: (first + 6) % 7 }, () => '<div class="dim"></div>').join("")}${days.map((d) => { const k = "07-" + String(d).padStart(2, "0"); return `<div data-k="${k}" class="${draft.dates.has(k) ? "on" : ""} ${hot.has(k) ? "hot" : ""}">${d}</div>`; }).join("")}</div></div>
    <div class="field"><label>预算档位（匿名）</label>
      <div class="tiers" id="pfTier">${BUDGET_TIERS.map((t) => `<button type="button" class="${draft.budget === t.tier ? "on" : ""}" data-t="${t.tier}"><b>${esc(t.label)}</b>元</button>`).join("")}</div></div>
    <div class="field"><label>最想去 <span class="hint">最多两个，第一个算 2 票</span></label>
      <div class="opts" id="pfWish">${Object.entries(DESTS).map(([k, d]) => `<button type="button" class="opt ${draft.wish.has(k) ? "on" : ""}" data-k="${k}">${esc(d.name)}</button>`).join("")}</div></div>
    <div class="field"><label>想怎么玩</label>
      <div class="opts" id="pfVibe">${VIBES.map((v) => `<button type="button" class="opt ${draft.vibe.has(v) ? "on" : ""}" data-k="${v}">${esc(v)}</button>`).join("")}</div></div>
    <div class="field"><label>硬约束 <span class="hint">有就勾，AI 排方案时绕开</span></label>
      <div class="opts" id="pfHard">${HARDS.map((v) => `<button type="button" class="opt coral ${draft.hard.has(v) ? "on" : ""}" data-k="${v}">${esc(v)}</button>`).join("")}</div></div>
    <div class="field"><label>出发城市</label><input class="input" value="上海（自动，可改）" readonly></div>
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">取消</button><button type="button" class="btn btn-primary" data-act="savePref">提交，第 ${filled().length + (m.filled ? 0 : 1)}/${active().length} 份</button></div>`);
  $("#pfCal").addEventListener("click", (e) => { const d = e.target.closest("[data-k]"); if (!d) return; d.classList.toggle("on"); if (d.classList.contains("on")) draft.dates.add(d.dataset.k); else draft.dates.delete(d.dataset.k); });
  $("#pfTier").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("#pfTier").querySelectorAll("button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); draft.budget = Number(b.dataset.t); });
  $("#pfWish").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; const k = b.dataset.k; if (draft.wish.has(k)) draft.wish.delete(k); else { if (draft.wish.size >= 2) { const firstKey = [...draft.wish][0]; draft.wish.delete(firstKey); } draft.wish.add(k); } $("#pfWish").querySelectorAll(".opt").forEach((x) => x.classList.toggle("on", draft.wish.has(x.dataset.k))); });
  $("#pfVibe").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; b.classList.toggle("on"); if (b.classList.contains("on")) draft.vibe.add(b.dataset.k); else draft.vibe.delete(b.dataset.k); });
  $("#pfHard").addEventListener("click", (e) => { const b = e.target.closest(".opt"); if (!b) return; b.classList.toggle("on"); if (b.classList.contains("on")) draft.hard.add(b.dataset.k); else draft.hard.delete(b.dataset.k); });
  S.draft = draft;
}
function savePref() {
  const d = S.draft, m = mem(ME);
  if (!d.dates.size) { toast("至少选一天"); return; }
  Object.assign(m, { filled: true, dates: [...d.dates].sort(), budget: d.budget, wish: [...d.wish], vibe: [...d.vibe], hard: [...d.hard] });
  closeModal(); toast(`已提交，第 ${filled().length}/${active().length} 份`);
  aiReset(); render(); renderAi();
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

function viewHome() {
  const cur = STAGES[STAGE_NO[S.stage]];
  const pct = Math.round(((STAGE_NO[S.stage] + 0.5) / STAGES.length) * 100);
  return `
    <section class="hero">
      <img class="kv" src="img/kv-tall.jpg" alt="">
      <div class="hero-in">
        <span class="tagline"><img src="img/logo.webp" alt="">拼途 · 毕业季拼团规划</span>
        <h1>把散落的人，<br><em>拼成一次旅行。</em></h1>
        <p>一个班 14 个人、3 个出发地、预算不一样，也能 3 天定下来：AI 领队合方案，大家投票，机票民宿各付各的，没人垫钱。</p>
        <div class="row wrap">
          <button type="button" class="btn btn-primary" data-act="newCrew"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>建一个团</button>
          <button type="button" class="btn btn-ghost" data-act="join">有邀请码，加入</button>
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
            <div class="meta">${active().length} 人 · ${CREW.window} · ${S.locked ? planLine(lockedPlan()) : "目的地投票中"}</div>
            <div class="bar"><i style="--w:${pct}%"></i></div>
            <div class="foot"><span>${S.stage === "collect" ? `${filled().length}/${active().length} 人已填偏好` : S.stage === "vote" ? `投票还剩 ${countdown()}` : S.stage === "pay" ? "各付各的进行中" : S.stage === "trip" ? "今天 D2 洱海环湖" : S.stage === "settle" ? "待结清 · 纪念册已生成" : "行程共创中"}</span><span class="link">进入 ›</span></div>
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

function viewOverview() {
  const f = filled().length, n = active().length, u = unfilled();
  const intro = S.ai[0] || aiIntro();
  const todo = [];
  if (S.stage === "collect") {
    if (!mem(ME).filled) todo.push({ ico: "📝", b: "填我的偏好", s: "1 分钟：日期、预算档位、想去哪", act: "pref", btn: "去填" });
    const others = u.filter((m) => m.id !== ME);
    if (others.length) todo.push({ ico: "📣", b: `${others.length} 人还没填`, s: others.map((m) => m.name).join("、"), act: "nudge", btn: "一键催" });
    if (!u.length) todo.push({ ico: "🗳️", b: "大家都填好了", s: "去看 AI 合的 3 套方案并投票", act: "go:plan", btn: "去定方案" });
  }
  if (S.stage === "vote") {
    if (!voted().has(ME)) todo.push({ ico: "🗳️", b: "投我的一票", s: `截止还剩 ${countdown()}`, act: "go:plan", btn: "去投票" });
    todo.push({ ico: "🔒", b: "组织者：锁定方案", s: "票数接近时看「能来的人数」再定", act: "go:plan", btn: "去看" });
  }
  if (S.stage === "plan") { todo.push({ ico: "🗺️", b: "行程草稿已生成", s: `${S.proposals.length} 条提议待看，D3 要选小队`, act: "go:itinerary", btn: "去看行程" }); todo.push({ ico: "💳", b: "开放各付各的", s: "机票民宿拆成每人的份", act: "stage:pay", btn: "开放付款" }); }
  if (S.stage === "pay") { const items = payItems(); const mine = items.filter((it) => it.who.includes(ME) && !isPaid(it, ME)); if (mine.length) todo.push({ ico: "💳", b: `我还有 ${mine.length} 份没付`, s: mine.map((it) => it.name).join("；"), act: "go:money", btn: "去付" }); const unpaid = items.reduce((a, it) => a + it.who.filter((id) => !isPaid(it, id)).length, 0); todo.push({ ico: "📣", b: unpaid ? `还有 ${unpaid} 份没付` : "全员付清", s: unpaid ? "7/1 00:00 机票价格失效" : "出发前 3 天自动发集合提醒", act: unpaid ? "remind" : "stage:trip", btn: unpaid ? "提醒" : "跳到出发" }); }
  if (S.stage === "trip") { todo.push({ ico: "📍", b: "今天 D2 · 洱海环湖", s: `${S.checkin.length}/${going().length} 人已签到`, act: "go:itinerary", btn: "签到" }); todo.push({ ico: "🧾", b: "随手记账", s: `${S.expenses.length} 笔共同消费`, act: "expense", btn: "记一笔" }); }
  if (S.stage === "settle") { todo.push({ ico: "💸", b: "每人转一次就结清", s: "没人多付，没人垫着", act: "go:money", btn: "去结算" }); todo.push({ ico: "📸", b: "纪念册已生成", s: `${ALBUM.length} 张照片 · 每人一句话`, act: "go:album", btn: "去看" }); }
  const plan = lockedPlan();
  return `
    <div class="crew-head">
      <img class="cover" src="img/dali.jpg" alt="">
      <div class="grow"><h1>${esc(CREW.name)}</h1><div class="meta">${n} 人 · ${new Set(active().map((m) => m.city)).size} 个出发地 · ${esc(CREW.from)}</div></div>
      <button type="button" class="btn btn-sm btn-ghost" data-act="invite">邀请</button>
    </div>
    <div class="card steps-card"><div class="stage-ic"><img src="img/${["ic-pref","ic-vote","ic-route","ic-money","ic-meet","ic-album"][STAGE_NO[S.stage]]}.webp" alt=""><div><b>${esc(STAGES[STAGE_NO[S.stage]].name)}</b><small>${esc(["每人一分钟：日期、预算档位、想去哪", "AI 合了三套方案，投票到点组织者锁定", "AI 草稿排好了，提议、分队、定集合点", "机票民宿拆成每人的份，各付各的", "签到、临时投票、随手记一笔", "每人转一次结清，纪念册做好了"][STAGE_NO[S.stage]])}</small></div></div>${stepsHtml()}</div>
    <div class="cols">
      <div>
        <div class="card">
          <div class="card-h"><h2>现在要做的事</h2><small>${STAGES[STAGE_NO[S.stage]].name}</small></div>
          <ul class="todo">${todo.map((t) => `<li><span class="ico">${t.ico}</span><div class="grow"><b>${esc(t.b)}</b><small>${esc(t.s)}</small></div><button type="button" class="btn btn-sm btn-primary" data-act="${t.act}">${esc(t.btn)}</button></li>`).join("")}</ul>
        </div>
        <div class="card">
          <div class="card-h"><h2>团里的数</h2></div>
          <div class="kpis">
            <div class="kpi"><b class="num">${f}/${n}</b><small>已填偏好</small></div>
            <div class="kpi"><b class="num">${plan ? goers(plan).length : goers(S.plans[0]).length}</b><small>${plan ? "能来的人" : "最多方案能来"}</small></div>
            <div class="kpi"><b class="num">${yuan(plan ? avgPrice(plan) : avgPrice(S.plans[0]))}</b><small>${plan ? "人均预估" : "方案 A 人均"}</small></div>
          </div>
          <div class="sp"></div>
          <div class="row wrap"><div class="avs">${active().slice(0, 9).map((m) => av(m.id, "sm" + (m.filled ? "" : " off"))).join("")}${n > 9 ? `<span class="av sm more">+${n - 9}</span>` : ""}</div><small class="muted">半透明的还没填</small></div>
        </div>
      </div>
      <div>
        <div class="card ai-card">
          <div class="card-h"><h2><span class="ai-dot"></span>AI 领队</h2><small>看过所有偏好和订单</small></div>
          <p>${esc(intro.text)}</p>
          <div class="chips">${(intro.chips || []).map(([t, a]) => `<button type="button" class="chip purple" data-ai="${a}">${esc(t)}</button>`).join("")}<button type="button" class="chip" data-act="openAi">继续问 ›</button></div>
        </div>
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
  const first = S.plans.find((p) => p.id === "A");
  const sorted = [...S.plans].sort((a, b) => fitScore(b) - fitScore(a));
  const hasVoted = voted().has(ME);
  const vt = Object.keys(S.votes).reduce((a, k) => a + voteCount(k), 0);
  return `
    <div class="card">
      <div class="card-h"><h2>${f.length}/${n} 人的偏好汇总</h2>${mem(ME).filled ? `<button type="button" class="btn btn-xs btn-soft" data-act="pref">改我的</button>` : `<button type="button" class="btn btn-sm btn-primary" data-act="pref">填我的偏好</button>`}</div>
      <div class="sm muted" style="margin-bottom:6px">7 月哪几天能出来 · 颜色越深空的人越多${S.locked ? "，红框是锁定的日期" : ""}</div>
      <div class="heat">${heat.map((d) => `<div class="${lvl(d.n)} ${S.locked && lockedPlan().dates.includes(d.key) ? "pick" : ""}" title="7/${d.d}：${d.n} 人"><b>${d.d}</b>${d.n ? `<span>${d.n}</span>` : ""}</div>`).join("")}</div>
      <div class="legend"><span><i style="background:#dfe8ff"></i>少</span><span><i style="background:#86abff"></i>多</span><span><i style="background:#2f6bff"></i>最多</span><span class="grow"></span><span>数字 = 能来的人数</span></div>
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
    <div class="sec-h" style="margin-top:22px"><h2>AI 领队合的方案</h2>${S.locked ? `<span class="pill green">已锁定 ${S.locked}</span>` : `<span class="countdown"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>截止还剩 ${countdown()}</span>`}</div>
    <p class="sm muted">按能来的人数、想去的票数、预算和玩法算匹配度；每套都按 ${new Set(active().map((m) => m.city)).size} 个出发地分别算了交通。${S.locked ? "" : `已投 ${vt}/${n} 人。`}</p>
    <div class="plans">${sorted.map((p, i) => {
      const g = goers(p), c = cant(p), unknown = unfilled().length, vc = voteCount(p.id), mine = (S.votes[p.id] || []).includes(ME), price = avgPrice(p);
      const over = f.filter((m) => BUDGET_TIERS[m.budget - 1].max < price).length;
      return `<div class="card plan ${mine ? "voted" : ""} ${S.locked === p.id ? "locked" : ""}">
        <div class="cover"><img src="${p.cover}" alt="" loading="lazy"><span class="badge pill ${i === 0 ? "coral" : "navy"}">${i === 0 ? "匹配最高" : "方案 " + p.id}</span><span class="rank num">${esc(p.id)}</span><div class="lab"><b>${esc(p.title)}</b><small>${esc(p.start.replace("-", "/"))}–${esc(p.end.replace("-", "/"))} · ${p.nights + 1} 天 ${p.nights} 晚</small></div></div>
        <div class="body">
          <div class="stats">
            <div class="${g.length === n ? "good" : c.length ? "warn" : ""}"><b class="num">${g.length}/${n}</b><small>能来</small></div>
            <div><b class="num">${yuan(price)}</b><small>人均约</small></div>
            <div><b class="num">${fitScore(p)}%</b><small>匹配</small></div>
          </div>
          ${c.length || unknown ? `<div class="cant">${c.length ? `<span>${esc(c.map((m) => m.name).join("、"))} 日期不合</span>` : ""}${unknown ? `<span>· ${unknown} 人未填</span>` : ""}${over ? `<span>· ${over} 人超预算档</span>` : ""}</div>` : `<div class="cant"><span>全员日期都合${over ? `，${over} 人超预算档` : ""}</span></div>`}
          <div class="pills" style="margin-top:8px">${p.vibes.map((v) => `<span class="pill blue">${esc(v)}</span>`).join("")}<span class="pill">${p.flight ? "要坐飞机" : "高铁为主"}</span></div>
          ${p.aiNote ? `<div class="ai-note"><span class="ai-dot"></span><span>${esc(p.aiNote.text)}</span></div>` : ""}
          <div class="votes"><div class="bar"><i style="--w:${(vc / Math.max(1, n)) * 100}%"></i></div><b class="num">${vc} 票</b></div>
          <div class="cta">
            <button type="button" class="btn btn-sm btn-ghost" data-act="planDetail" data-id="${p.id}">怎么去 · 怎么算</button>
            ${S.locked ? (S.locked === p.id ? '<span class="btn btn-sm btn-soft">已锁定</span>' : "") : `<button type="button" class="btn btn-sm ${mine ? "btn-soft" : "btn-primary"}" data-act="vote" data-id="${p.id}">${mine ? "已投 ✓" : "投这个"}</button>`}
          </div>
          ${!S.locked && mem(ME).role === "organizer" && hasVoted ? `<button type="button" class="btn btn-sm btn-block" style="margin-top:8px" data-act="lock" data-id="${p.id}">组织者：锁定 ${p.id}</button>` : ""}
        </div>
      </div>`; }).join("")}</div>
    ${!S.locked ? `<p class="xs mute" style="margin-top:12px">投票到点自动汇总；票数接近时 AI 领队会把折中方案列出来，由组织者定，不替大家决定。</p>` : ""}`;
}

function planDetail(id) {
  const p = S.plans.find((x) => x.id === id);
  const cities = {};
  active().forEach((m) => { const ex = (p.exceptions || []).find((e) => e.who === m.id); if (ex) return; (cities[m.city] = cities[m.city] || []).push(m); });
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <h2>方案 ${esc(id)} · ${esc(p.title)}</h2>
    <p class="sub">${esc(planLine(p))} · ${esc(p.meet)}</p>
    <h3 style="margin-top:16px;font-size:15px">三个出发地怎么合流</h3>
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
    <p class="xs mute" style="margin-top:10px">匹配度 = 能来的人数 40% + 想去的票数 30% + 预算合不合 20% + 玩法 10%。价格是携程当前报价，锁定后 48 小时内有效。</p>
    ${!S.locked ? `<div class="form-foot"><button type="button" class="btn btn-ghost" data-act="close">关闭</button><button type="button" class="btn btn-primary" data-act="voteClose" data-id="${id}">投这个</button></div>` : ""}`);
}

function viewItinerary() {
  if (!S.locked) return `<div class="card"><div class="empty"><img src="img/ic-route.webp" alt=""><b>方案还没锁定</b>投票结束、组织者锁定后，AI 领队会按人数和出发地生成行程草稿，大家再一起改。</div><div class="row" style="justify-content:center"><a class="btn btn-primary" href="#/crew/plan">去定方案</a></div></div>`;
  const plan = lockedPlan();
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
      <div class="row wrap"><span class="pill blue">${going().length} 人</span><span class="pill">3 个出发地</span><span class="pill">吃玩预估 ${yuan(base + 60)}–${yuan(base + 180)}/人</span><span class="pill purple">AI 草稿 · 可改</span></div>
      <div class="daytabs">${S.itinerary.map((d) => `<button type="button" class="${d.day === S.day ? "on" : ""}" data-act="day" data-id="${d.day}"><b>D${d.day}</b><small>7/${Number(d.date.slice(3))} ${d.split ? "分队" : ""}</small></button>`).join("")}</div>
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

function viewMoney() {
  const plan = lockedPlan();
  const tier = BUDGET_TIERS[budgetMedianTier() - 1];
  const price = plan ? avgPrice(plan) : avgPrice(S.plans[0]);
  const items = payItems();
  const s = settlement();
  const total = S.expenses.reduce((a, e) => a + e.amount, 0);
  const paidMine = items.filter((it) => it.who.includes(ME) && isPaid(it, ME)).reduce((a, it) => a + it.per, 0);
  return `
    <div class="money-top">
      <div class="card"><div class="kpi"><small>预算中位（匿名档）</small><b class="num">${esc(tier.label)}</b></div><div class="sp"></div><div class="bar green"><i style="--w:${Math.min(100, (price / tier.max) * 100)}%"></i></div><small class="muted">${plan ? "锁定方案" : "方案 A"}人均约 ${yuan(price)}${price <= tier.max ? "，在档内" : "，超出中位档"}</small></div>
      <div class="card"><div class="kpi"><small>我已付</small><b class="num">${yuan(paidMine)}</b></div><div class="sp"></div><small class="muted">${plan ? `还需付 ${yuan(items.filter((it) => it.who.includes(ME) && !isPaid(it, ME)).reduce((a, it) => a + it.per, 0))} · 行中共同消费另记` : "锁定方案后开放各付各的"}</small></div>
    </div>
    <div class="card">
      <div class="card-h"><h2>各付各的</h2><small>${plan ? "携程订单拆成每人的份" : "锁定方案后开放"}</small></div>
      ${plan ? items.map((it) => { const paid = it.who.filter((id) => isPaid(it, id)).length; const mine = it.who.includes(ME); return `<div class="bill"><span class="ico">${it.kind === "stay" ? "🛏️" : "✈️"}</span><div class="grow"><b>${esc(it.name)}</b><small>${esc(it.note)} · ${it.who.length} 人</small><div class="paid-row"><div class="bar ${paid === it.who.length ? "green" : ""}"><i style="--w:${(paid / it.who.length) * 100}%"></i></div><small>${paid}/${it.who.length} 已付</small></div></div><div class="amt"><b class="num">${yuan(it.per)}</b><small>/人</small>${mine ? (isPaid(it, ME) ? '<div><span class="pill green">我已付</span></div>' : `<div><button type="button" class="btn btn-xs btn-primary" data-act="pay" data-id="${it.id}">付我的</button></div>`) : ""}</div></div>`; }).join("") + `<div class="row" style="margin-top:10px;gap:8px"><button type="button" class="btn btn-sm btn-soft grow" data-act="remind">提醒没付的人</button><button type="button" class="btn btn-sm btn-ghost grow" data-act="toast" data-msg="价格锁定到 7/1 00:00，过时重新报价">价格锁定 7/1 00:00</button></div>` : `<div class="empty"><img src="img/ic-money.webp" alt="">方案锁定后，机票和民宿按人拆单：每个人在自己的携程账户付自己那份，组织者只看谁付了。</div>`}
    </div>
    <div class="card">
      <div class="card-h"><h2>行中记账</h2>${S.stage === "trip" || S.stage === "settle" ? `<button type="button" class="btn btn-xs btn-primary" data-act="expense">记一笔</button>` : `<small>出行中打开</small>`}</div>
      ${S.stage === "trip" || S.stage === "settle" ? S.expenses.map((e) => { const amongN = e.among === "all" ? going().length : e.among.filter((id) => mem(id) && !mem(id).dropped).length; return `<div class="bill">${av(e.by)}<div class="grow"><b>${esc(e.name)}</b><small>${esc(mem(e.by).name)} 垫付 · D${e.day} · ${amongN} 人分</small></div><div class="amt"><b class="num">${yuan(e.amount)}</b><small>${yuan(e.amount / amongN)}/人</small></div></div>`; }).join("") + `<div class="row" style="margin-top:8px"><small class="muted grow">${S.expenses.length} 笔 · 共 ${yuan(total)}</small></div>` : `<div class="empty"><img src="img/ic-meet.webp" alt="">出发后谁垫了钱当场记一笔：谁付的、谁参与、按份或按比例。结束时自动算净额，每人只转一次。</div>`}
    </div>
    ${S.stage === "settle" ? `<div class="card">
      <div class="card-h"><h2>结算 · 每人只转一次</h2><small>${s.transfers.length} 笔 · 财务${esc(mem(s.hub).name)}做中枢</small></div>
      <ul class="net">${going().map((m) => { const v = s.net[m.id]; return `<li class="${v > 0.5 ? "pos" : v < -0.5 ? "neg" : ""}">${av(m.id, "sm")}<span>${esc(m.name)}</span><b>${v > 0.5 ? "+" : ""}${Math.round(v)}</b></li>`; }).join("")}</ul>
      <ul class="settle">${s.transfers.map((t) => `<li>${av(t.from, "sm")}<span class="arrow">${esc(mem(t.from).name)} → ${esc(mem(t.to).name)}</span><b>${yuan(t.amt)}</b></li>`).join("")}</ul>
      <div class="row" style="margin-top:12px"><button type="button" class="btn btn-primary btn-block" data-act="settle">一键结清（支付宝/微信）</button></div>
      <p class="xs mute" style="margin-top:8px">算法：先按每笔的参与人算出每个人的净额，欠钱的转给财务，财务再转给垫过钱的人；每个人只和一个人转一次，明细可导出核对。</p>
    </div>` : ""}
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
        return `<div class="member">${av(m.id, m.dropped ? "off" : "")}<div><b>${esc(m.name)}${m.id === ME ? "（我）" : ""}</b><small>${esc(m.city)} 出发${m.role === "organizer" ? " · 组织者" : m.role === "finance" ? " · 财务" : ""}${m.hard.length ? " · " + esc(m.hard.join("、")) : ""}</small></div><div class="st row">${st}${!m.dropped && m.id !== ME && STAGE_NO[S.stage] >= 2 && STAGE_NO[S.stage] <= 3 ? `<button type="button" class="btn btn-xs btn-ghost" data-act="drop" data-id="${m.id}">退出</button>` : ""}${m.dropped ? `<button type="button" class="btn btn-xs btn-ghost" data-act="undrop" data-id="${m.id}">撤销</button>` : ""}</div></div>`; }).join("")}
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
  const total = S.expenses.reduce((a, e) => a + e.amount, 0);
  return `
    <div class="album-cover"><img src="img/hero.jpg" alt=""><div><h2>${esc(CREW.name)}</h2><p>大理 · 7/3–7/7 · ${going().length} 人 · 3 个出发地</p></div></div>
    <div class="card"><div class="kpis"><div class="kpi"><b class="num">5</b><small>天</small></div><div class="kpi"><b class="num">${S.expenses.length}</b><small>笔共同消费</small></div><div class="kpi"><b class="num">0</b><small>笔糊涂账</small></div></div><div class="sp"></div><small class="muted">共同消费 ${yuan(total)}，每人和财务转一次就结清；机票民宿各付各的，没人垫过钱。</small></div>
    <div class="sec-h" style="margin-top:18px"><h2>照片 · 按时间轴</h2><button type="button" class="btn btn-xs btn-soft" data-act="toast" data-msg="已从 14 个人的相册里挑了 24 张，重复的合并了">AI 挑图</button></div>
    <div class="album">${ALBUM.map((a) => `<figure><img src="${a.img}" alt="" loading="lazy"><figcaption>${esc(a.cap)} · ${esc(mem(a.by).name)}</figcaption></figure>`).join("")}</div>
    <div class="sec-h" style="margin-top:18px"><h2>每人一句话</h2><small class="mute">${QUOTES.length}/${going().length}</small></div>
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
    <div class="form-foot"><button type="button" class="btn btn-ghost" data-act="toast" data-msg="已复制链接">复制链接</button><button type="button" class="btn btn-primary" data-act="toast" data-msg="已打开微信分享">发到微信群</button></div>`);
}
function destSheet(k) {
  const d = DESTS[k];
  const inPlan = S.plans.find((p) => p.dest === k);
  modal(`
    <button type="button" class="x" data-act="close">×</button>
    <img src="${d.img}" alt="" style="border-radius:14px;height:170px;width:100%;object-fit:cover;margin-top:6px">
    <h2 style="margin-top:12px">${esc(d.name)} <small class="mute" style="font-size:13px;font-weight:400">${esc(d.sub)}</small></h2>
    <p class="sub">${esc(d.days)} · 人均约 ${yuan(d.base)} 起 · ${esc(d.tag)}</p>
    <p style="margin-top:10px;font-size:14px">${esc(d.fit)}。携程毕业季数据：多人出行订单里这里排前列，7 月初民宿还有整栋可订。</p>
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
  const h = location.hash.replace(/^#\/?/, "") || "home";
  const [a, b] = h.split("/");
  return a === "crew" ? { page: b || "overview", crew: true } : { page: a, crew: false };
}
function render() {
  const r = route();
  const main = $("#main"), top = $("#top"), tab = $("#tabbar");
  const views = { home: viewHome, overview: viewOverview, plan: viewPlan, itinerary: viewItinerary, money: viewMoney, members: viewMembers, album: viewAlbum, design: () => DESIGN_DOC(), me: viewMe };
  const titles = { overview: "概览", plan: "定方案", itinerary: "行程", money: "费用", members: "成员", album: "纪念册", design: "产品设计说明", me: "我的" };
  const fn = views[r.page] || viewHome;
  main.innerHTML = fn();
  main.className = "main" + (r.page === "design" ? " doc" : "");
  if (r.page === "home") {
    top.className = "top plain";
    top.innerHTML = `<a class="brand" href="#/home" style="padding-left:8px"><img class="logo" src="img/logo.webp" alt=""><span><b>拼途</b><small>毕业旅行拼团规划 · 携程</small></span></a><span class="grow"></span><div class="act"><a class="btn btn-sm btn-ghost" href="#/design">设计说明</a></div>`;
    tab.innerHTML = "";
  } else {
    top.className = "top";
    const sub = r.crew ? `${esc(CREW.name)} · ${STAGES[STAGE_NO[S.stage]].name}` : r.page === "design" ? "给看这份作品的人" : "";
    top.innerHTML = `<a class="back" href="${r.crew && r.page !== "overview" ? "#/crew/overview" : "#/home"}" aria-label="返回"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></a><div class="ttl"><b>${esc(titles[r.page] || "")}</b>${sub ? `<small>${sub}</small>` : ""}</div>${r.crew ? stepsHtml() + `<div class="act"><button type="button" class="btn btn-sm btn-soft" data-act="stages" title="演示：跳到某个阶段">演示 ▾</button></div>` : ""}`;
    tab.innerHTML = r.crew || r.page === "me" ? NAV.map(([k, n, ic]) => `<a href="#/crew/${k}" class="${r.page === k ? "on" : ""}"><svg viewBox="0 0 24 24">${ic}</svg>${n}</a>`).join("") : "";
  }
  $("#sideNav").innerHTML = NAV.concat([["album", "纪念册", '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 8"/>']]).map(([k, n, ic]) => `<a href="#/crew/${k}" class="${r.crew && r.page === k ? "on" : ""}"><svg viewBox="0 0 24 24">${ic}</svg>${n}${k === "overview" && S.stage === "collect" && unfilled().length ? `<span class="pill sun">${unfilled().length}</span>` : ""}</a>`).join("");
  $("#crewSwitch").innerHTML = `<button type="button" class="${r.crew ? "on" : ""}" data-go="#/crew/overview"><img src="img/dali.jpg" alt=""><span><b>${esc(CREW.name)}</b><small>${STAGES[STAGE_NO[S.stage]].name} · ${active().length} 人</small></span></button><button type="button" data-go="#/home"><img src="img/qingdao.jpg" alt=""><span><b>${esc(HISTORY_CREW.name)}</b><small>已完成</small></span></button><a class="new" href="#/home" data-act="newCrew"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>建一个团</a>`;
  document.querySelectorAll(".side-link").forEach((a) => a.classList.toggle("on", a.dataset.nav === r.page));
  $("#aiFab").hidden = r.page === "design";
  $("#stage") && null;
  document.body.classList.toggle("no-tabs", !tab.innerHTML);
  document.querySelector(".stage").scrollTop = 0;
  window.scrollTo(0, 0);
}
function renderAi() {
  const body = $("#aiBody");
  body.innerHTML = S.ai.map((m) => `<div class="msg ${m.who}">${esc(m.text)}${m.chips && m.chips.length ? `<div class="chips">${m.chips.map(([t, a]) => `<button type="button" class="chip purple" data-ai="${a}">${esc(t)}</button>`).join("")}</div>` : ""}</div>`).join("");
  body.scrollTop = body.scrollHeight;
  if ($("#aiPanel").classList.contains("open")) { $("#aiBadge").hidden = true; $("#aiBadge").textContent = ""; }
}
function openAi(force) {
  const p = $("#aiPanel");
  if (window.matchMedia("(min-width: 1180px)").matches) return;
  if (force === false) p.classList.remove("open"); else p.classList.toggle("open", force === true ? true : !p.classList.contains("open"));
  if (p.classList.contains("open")) { $("#aiBadge").hidden = true; $("#aiBadge").textContent = ""; const b = $("#aiBody"); b.scrollTop = b.scrollHeight; }
}
function modal(html) { const m = $("#modal"); $("#modalCard").innerHTML = html; m.hidden = false; document.body.style.overflow = "hidden"; }
function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; }
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
    close: closeModal, newCrew, invite, join: () => { toast("输邀请码就能进，演示版直接进了这个团"); location.hash = "#/crew/overview"; }, pref: prefForm, savePref, nudge, vote: () => vote(id), voteClose: () => { closeModal(); vote(id); }, lock: () => lockPlan(id), doLock: () => doLock(id), planDetail: () => planDetail(id),
    day: () => { S.day = Number(id); render(); }, team: () => joinTeam(id), like: () => like(id), adopt: () => adopt(id), propose: () => { S.proposals.push({ id: "p" + Date.now(), by: ME, day: S.day, text: "D" + S.day + " 加一个人民路的夜市小吃，人均约 30", likes: [] }); toast("提议已发出，等大家点赞"); render(); },
    pay: () => payMine(id), remind, checkin: () => checkin(id), dinner: () => dinner(id), expense: openExpense, saveExpense, settle: settleAll, drop: () => dropModal(id), doDrop: () => doDrop(id), undrop: () => undrop(id),
    stages: stageModal, stage: () => { closeModal(); setStage(id); if (id === "settle") location.hash = "#/crew/album"; }, reset: () => { fresh(); aiReset(); closeModal(); toast("演示已重置"); location.hash = "#/home"; render(); renderAi(); },
    dest: () => destSheet(el.dataset.k), openAi: () => openAi(true), toast: () => toast(el.dataset.msg || "好"),
    "go:plan": () => (location.hash = "#/crew/plan"), "go:itinerary": () => (location.hash = "#/crew/itinerary"), "go:money": () => (location.hash = "#/crew/money"), "go:members": () => (location.hash = "#/crew/members"), "go:album": () => (location.hash = "#/crew/album"), "stage:pay": () => setStage("pay"), "stage:trip": () => setStage("trip"),
  };
  if (acts[act]) acts[act]();
});
$("#modalMask").addEventListener("click", closeModal);
$("#aiFab").addEventListener("click", () => openAi());
$("#aiClose").addEventListener("click", () => openAi(false));
$("#aiAsk").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#aiInput").value.trim(); if (!v) return; $("#aiInput").value = ""; aiMe(v); const r = freeAnswer(v); setTimeout(() => aiSay(r.text, r.chips), 400); });
window.addEventListener("hashchange", () => { closeModal(); openAi(false); render(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); openAi(false); } });
setInterval(() => { if (S.stage === "vote" && route().crew) document.querySelectorAll(".countdown").forEach((el) => (el.innerHTML = el.innerHTML.replace(/截止还剩 .*$/, "截止还剩 " + countdown()))); }, 30000);

aiReset();
render();
renderAi();

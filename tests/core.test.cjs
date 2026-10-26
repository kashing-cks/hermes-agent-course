const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../assets/core.js");

test("timestampSeconds and formatSeconds bidirectional integrity", () => {
  assert.equal(Core.timestampSeconds("0:00"), 0);
  assert.equal(Core.timestampSeconds("2:44"), 164);
  assert.equal(Core.timestampSeconds("1:20:26"), 4826);
  assert.equal(Core.timestampSeconds("3:01:06"), 10866);
  assert.equal(Core.formatSeconds(164), "2:44");
  assert.equal(Core.formatSeconds(4826), "1:20:26");
});

test("embedUrl generates valid privacy-enhanced YouTube URL", () => {
  const url = Core.embedUrl(164);
  assert.match(url, /^https:\/\/www\.youtube-nocookie\.com\/embed\/8yE6G1Lup1s\?start=164/);
});

test("filterChapters supports status, bookmarks and text queries", () => {
  const sample = [
    { id: "ch-1", title: "Introduction", group: "Foundations", tags: ["intro", "overview"] },
    { id: "ch-2", title: "Setup", group: "Setup", tags: ["install", "vps"] },
    { id: "ch-3", title: "Honcho Memory", group: "Memory", tags: ["memory", "graph"] }
  ];
  const completed = new Set(["ch-1"]);
  const bookmarked = new Set(["ch-3"]);

  assert.equal(Core.filterChapters(sample, "", "status:done", completed, bookmarked).length, 1);
  assert.equal(Core.filterChapters(sample, "", "status:todo", completed, bookmarked).length, 2);
  assert.equal(Core.filterChapters(sample, "", "status:bookmarked", completed, bookmarked).length, 1);
  assert.equal(Core.filterChapters(sample, "Honcho", "all", completed, bookmarked).length, 1);
});

test("calculateOffer supports multi-currency and gross profit margins", () => {
  const input = {
    clients: 3,
    setup: 2000,
    retainer: 500,
    monthlyCost: 100,
    deliveryHours: 10,
    hourlyCost: 40,
    savedHours: 20,
    clientHourlyValue: 50
  };

  const resUSD = Core.calculateOffer(input, "USD");
  assert.equal(resUSD.annualRevenue, 24000);
  assert.equal(resUSD.yearOneGrossProfit, 19200);
  assert.equal(resUSD.grossMarginPct, 80);

  const resHKD = Core.calculateOffer(input, "HKD");
  assert.ok(resHKD.annualRevenue > 180000);
  assert.equal(resHKD.currency.code, "HKD");
});

test("generateOfferProposal produces structured markdown", () => {
  const input = { clients: 2, setup: 2000, retainer: 500, savedHours: 20 };
  const res = Core.calculateOffer(input, "USD");
  const proposal = Core.generateOfferProposal(input, res);
  assert.match(proposal, /# AI 數位員工服務方案建議書/);
  assert.match(proposal, /Setup Fee/);
  assert.match(proposal, /Client ROI/);
});

test("exportNotesMarkdown compiles complete study log", () => {
  const sample = [
    { id: "ch-1", title: "Intro", time: "0:00", group: "Intro", summary: "Overview", points: ["P1"], steps: ["S1"] }
  ];
  const notes = { "ch-1": "My personal takeaway." };
  const md = Core.exportNotesMarkdown(sample, notes, new Set(["ch-1"]), new Set(["ch-1"]));
  assert.match(md, /# Hermes Agent 3-Hour Masterclass/);
  assert.match(md, /My personal takeaway/);
  assert.match(md, /⭐/);
});

test("gradeQuiz evaluates questions accurately", () => {
  const questions = [
    { id: "q1", answer: 1, explanation: "Exp 1" },
    { id: "q2", answer: 0, explanation: "Exp 2" }
  ];
  const res = Core.gradeQuiz(questions, { q1: 1, q2: 0 });
  assert.equal(res.score, 2);
  assert.equal(res.pct, 100);

  const resFail = Core.gradeQuiz(questions, { q1: 0, q2: 0 });
  assert.equal(resFail.score, 1);
  assert.equal(resFail.pct, 50);
});

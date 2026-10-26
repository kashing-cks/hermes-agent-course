(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.CourseCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var CURRENCIES = {
    USD: { code: "USD", symbol: "$", rate: 1.0, label: "美元 USD ($)" },
    HKD: { code: "HKD", symbol: "HK$", rate: 7.82, label: "港幣 HKD (HK$)" },
    TWD: { code: "TWD", symbol: "NT$", rate: 32.2, label: "新台幣 TWD (NT$)" },
    CNY: { code: "CNY", symbol: "¥", rate: 7.24, label: "人民幣 CNY (¥)" }
  };

  function timestampSeconds(str) {
    if (!str || typeof str !== "string") return 0;
    var parts = str.trim().split(":").map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return parts[0] || 0;
  }

  function formatSeconds(secs) {
    var s = Math.max(0, Math.floor(Number(secs) || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var rem = s % 60;
    var mm = m < 10 && h > 0 ? "0" + m : m;
    var ss = rem < 10 ? "0" + rem : rem;
    if (h > 0) {
      return h + ":" + (m < 10 ? "0" + m : m) + ":" + ss;
    }
    return m + ":" + ss;
  }

  function embedUrl(seconds) {
    var s = Math.max(0, Math.floor(Number(seconds) || 0));
    return "https://www.youtube-nocookie.com/embed/8yE6G1Lup1s?start=" + s + "&autoplay=1";
  }

  function filterChapters(chapters, query, filterValue, completedSet, bookmarkedSet) {
    if (!Array.isArray(chapters)) return [];
    var q = (query || "").trim().toLowerCase();
    var f = (filterValue || "all").trim();

    return chapters.filter(function (ch) {
      // Status filter
      if (f === "status:done" && (!completedSet || !completedSet.has(ch.id))) return false;
      if (f === "status:todo" && completedSet && completedSet.has(ch.id)) return false;
      if (f === "status:bookmarked" && (!bookmarkedSet || !bookmarkedSet.has(ch.id))) return false;

      // Group or Tag filter
      if (f && f !== "all" && !f.startsWith("status:")) {
        if (ch.group !== f && !(ch.tags && ch.tags.indexOf(f) >= 0)) {
          return false;
        }
      }

      if (!q) return true;
      var haystack = [
        ch.title || "",
        ch.summary || "",
        (ch.points || []).join(" "),
        (ch.steps || []).join(" "),
        (ch.tags || []).join(" "),
        ch.time || ""
      ].join(" ").toLowerCase();
      return haystack.indexOf(q) >= 0;
    });
  }

  function calculateOffer(input, currencyCode) {
    var curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
    var rate = curr.rate || 1.0;

    var clients = Math.max(0, Number(input.clients) || 0);
    var setupUSD = Math.max(0, Number(input.setup) || 0);
    var retainerUSD = Math.max(0, Number(input.retainer) || 0);
    var monthlyCostUSD = Math.max(0, Number(input.monthlyCost) || 0);
    var deliveryHours = Math.max(0, Number(input.deliveryHours) || 0);
    var hourlyCostUSD = Math.max(0, Number(input.hourlyCost) || 0);
    var savedHours = Math.max(0, Number(input.savedHours) || 0);
    var clientHourlyValueUSD = Math.max(0, Number(input.clientHourlyValue) || 0);

    var upfrontRevenue = clients * setupUSD * rate;
    var monthlyRevenue = clients * retainerUSD * rate;
    var annualRevenue = upfrontRevenue + monthlyRevenue * 12;

    var upfrontDeliveryCost = clients * deliveryHours * hourlyCostUSD * rate;
    var monthlyDirectCost = clients * monthlyCostUSD * rate;
    var annualDirectCost = monthlyDirectCost * 12;
    var totalYearOneCost = upfrontDeliveryCost + annualDirectCost;

    var yearOneGrossProfit = annualRevenue - totalYearOneCost;
    var grossMarginPct = annualRevenue > 0 ? (yearOneGrossProfit / annualRevenue) * 100 : 0;

    var clientMonthlyGrossValue = savedHours * clientHourlyValueUSD * rate;
    var clientMonthlyNetValue = clientMonthlyGrossValue - (retainerUSD * rate);
    var clientAnnualNetValue = clientMonthlyNetValue * 12;

    return {
      currency: curr,
      upfrontRevenue: Math.round(upfrontRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      annualRevenue: Math.round(annualRevenue),
      upfrontDeliveryCost: Math.round(upfrontDeliveryCost),
      monthlyDirectCost: Math.round(monthlyDirectCost),
      annualDirectCost: Math.round(annualDirectCost),
      totalYearOneCost: Math.round(totalYearOneCost),
      yearOneGrossProfit: Math.round(yearOneGrossProfit),
      grossMarginPct: Math.round(grossMarginPct * 10) / 10,
      clientMonthlyGrossValue: Math.round(clientMonthlyGrossValue),
      clientMonthlyNetValue: Math.round(clientMonthlyNetValue),
      clientAnnualNetValue: Math.round(clientAnnualNetValue)
    };
  }

  function generateOfferProposal(input, res) {
    var c = res.currency.symbol;
    return [
      "# AI 數位員工服務方案建議書 (Hermes Agent Deployment Proposal)",
      "",
      "## 1. 專案概述",
      "本方案為企業量身打造 24/7 自主運行的 Hermes Agent 數位員工系統，包含環境部署、持久記憶架構配置、通訊閘道（Telegram/Slack）對接與專屬工作流程自動化。",
      "",
      "## 2. 商業投資與服務費用 (" + res.currency.code + ")",
      "- **前期建置與客製設定費 (Setup Fee)**：" + c + res.upfrontRevenue.toLocaleString() + " (" + input.clients + " 位客戶/席位，單席 " + c + Math.round(input.setup * res.currency.rate).toLocaleString() + ")",
      "- **月度維運與服務保證費 (Monthly Retainer)**：" + c + res.monthlyRevenue.toLocaleString() + " / 月",
      "- **首年總合約價值 (Total Year 1 Value)**：" + c + res.annualRevenue.toLocaleString(),
      "",
      "## 3. 客戶投資回報率評估 (Client ROI)",
      "- **預估每月為客戶節省工時**：" + (input.savedHours * input.clients) + " 小時",
      "- **客戶每月毛價值收益**：" + c + res.clientMonthlyGrossValue.toLocaleString(),
      "- **扣除月費後客戶淨利潤回報**：" + c + res.clientMonthlyNetValue.toLocaleString() + " / 月 (首年累計淨回報 " + c + res.clientAnnualNetValue.toLocaleString() + ")",
      "",
      "## 4. 交付與維運範圍",
      "1. 專屬獨立主機或雲端 VPS 環境配置與安全性加固 (防爆 Token 預算管理)",
      "2. 企業專屬 soul.md / user.md 角色與記憶設定檔撰寫",
      "3. 整合多通道閘道與無人值守 Cronjob 自動化排程",
      "4. 每月模型性能評估、記憶剪枝優化 (Curator) 與即時排障支援",
      "",
      "---",
      "*Generated by Hermes Agent Learning Workspace*"
    ].join("\n");
  }

  function exportNotesMarkdown(chapters, notes, completedSet, bookmarkedSet) {
    var lines = [
      "# Hermes Agent 3-Hour Masterclass — 個人實作筆記",
      "> 學習者：Danny · 導出時間：" + new Date().toLocaleString("zh-TW"),
      "",
      "---",
      ""
    ];

    if (!Array.isArray(chapters)) return lines.join("\n");

    chapters.forEach(function (ch) {
      var note = (notes && notes[ch.id]) ? notes[ch.id].trim() : "";
      var isDone = completedSet && completedSet.has(ch.id);
      var isFav = bookmarkedSet && bookmarkedSet.has(ch.id);

      lines.push("## " + (isDone ? "✅ " : "⭕ ") + (isFav ? "⭐ " : "") + ch.title + " (`" + ch.time + "`)");
      lines.push("**單元主題**：" + (ch.group || "未分類") + " ｜ **標籤**：" + (ch.tags ? ch.tags.join(", ") : ""));
      lines.push("");
      lines.push("**章節摘要**：");
      lines.push(ch.summary || "無");
      lines.push("");

      if (ch.points && ch.points.length > 0) {
        lines.push("**核心要點**：");
        ch.points.forEach(function (p) { lines.push("- " + p); });
        lines.push("");
      }

      if (ch.steps && ch.steps.length > 0) {
        lines.push("**實作步驟**：");
        ch.steps.forEach(function (s, idx) { lines.push((idx + 1) + ". " + s); });
        lines.push("");
      }

      if (ch.takeaway) {
        lines.push("> **💡 核心金句**：" + ch.takeaway);
        lines.push("");
      }

      lines.push("### 📝 我的實作心得與筆記");
      if (note) {
        lines.push(note);
      } else {
        lines.push("*（本章尚未留下心得筆記）*");
      }
      lines.push("");
      lines.push("---");
      lines.push("");
    });

    return lines.join("\n");
  }

  function loadProgress(raw, validIds) {
    var set = new Set();
    if (!raw) return set;
    try {
      var arr = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(arr)) {
        arr.forEach(function (id) {
          if (!validIds || validIds.has(id)) {
            set.add(id);
          }
        });
      }
    } catch (e) {
      // ignore corrupt storage
    }
    return set;
  }

  function gradeQuiz(questions, answers) {
    if (!Array.isArray(questions)) return { score: 0, total: 0, details: [] };
    var total = questions.length;
    var correct = 0;
    var details = questions.map(function (q) {
      var userAns = answers && answers[q.id] !== undefined ? Number(answers[q.id]) : -1;
      var isCorrect = userAns === q.answer;
      if (isCorrect) correct++;
      return {
        id: q.id,
        userAnswer: userAns,
        correctAnswer: q.answer,
        isCorrect: isCorrect,
        explanation: q.explanation || ""
      };
    });
    return {
      score: correct,
      total: total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      details: details
    };
  }

  return {
    CURRENCIES: CURRENCIES,
    timestampSeconds: timestampSeconds,
    formatSeconds: formatSeconds,
    embedUrl: embedUrl,
    filterChapters: filterChapters,
    calculateOffer: calculateOffer,
    generateOfferProposal: generateOfferProposal,
    exportNotesMarkdown: exportNotesMarkdown,
    loadProgress: loadProgress,
    gradeQuiz: gradeQuiz
  };
});

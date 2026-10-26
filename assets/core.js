(function (root, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    root.CourseCore = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

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

  function filterChapters(chapters, query, topic) {
    if (!Array.isArray(chapters)) return [];
    var q = (query || "").trim().toLowerCase();
    var t = (topic || "").trim();
    return chapters.filter(function (ch) {
      if (t && t !== "all" && ch.group !== t && !(ch.tags && ch.tags.indexOf(t) >= 0)) {
        return false;
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

  function calculateOffer(input) {
    var clients = Math.max(0, Number(input.clients) || 0);
    var setup = Math.max(0, Number(input.setup) || 0);
    var retainer = Math.max(0, Number(input.retainer) || 0);
    var monthlyCost = Math.max(0, Number(input.monthlyCost) || 0);
    var deliveryHours = Math.max(0, Number(input.deliveryHours) || 0);
    var hourlyCost = Math.max(0, Number(input.hourlyCost) || 0);
    var savedHours = Math.max(0, Number(input.savedHours) || 0);
    var clientHourlyValue = Math.max(0, Number(input.clientHourlyValue) || 0);

    var upfrontRevenue = clients * setup;
    var monthlyRevenue = clients * retainer;
    var annualRevenue = upfrontRevenue + monthlyRevenue * 12;

    var upfrontDeliveryCost = clients * deliveryHours * hourlyCost;
    var monthlyDirectCost = clients * monthlyCost;
    var annualDirectCost = monthlyDirectCost * 12;
    var totalYearOneCost = upfrontDeliveryCost + annualDirectCost;

    var yearOneGrossProfit = annualRevenue - totalYearOneCost;
    var grossMarginPct = annualRevenue > 0 ? (yearOneGrossProfit / annualRevenue) * 100 : 0;

    var clientMonthlyGrossValue = savedHours * clientHourlyValue;
    var clientMonthlyNetValue = clientMonthlyGrossValue - retainer;
    var clientAnnualNetValue = clientMonthlyNetValue * 12;

    return {
      upfrontRevenue: upfrontRevenue,
      monthlyRevenue: monthlyRevenue,
      annualRevenue: annualRevenue,
      upfrontDeliveryCost: upfrontDeliveryCost,
      monthlyDirectCost: monthlyDirectCost,
      annualDirectCost: annualDirectCost,
      totalYearOneCost: totalYearOneCost,
      yearOneGrossProfit: yearOneGrossProfit,
      grossMarginPct: Math.round(grossMarginPct * 10) / 10,
      clientMonthlyGrossValue: clientMonthlyGrossValue,
      clientMonthlyNetValue: clientMonthlyNetValue,
      clientAnnualNetValue: clientAnnualNetValue
    };
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
    var details = questions.map(function (q, idx) {
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
    timestampSeconds: timestampSeconds,
    formatSeconds: formatSeconds,
    embedUrl: embedUrl,
    filterChapters: filterChapters,
    calculateOffer: calculateOffer,
    loadProgress: loadProgress,
    gradeQuiz: gradeQuiz
  };
});

(function () {
  "use strict";

  var COURSE = window.COURSE || { chapters: [], architecture: [], templates: [], quiz: [], sources: [] };
  var Core = window.CourseCore;
  if (!Core) {
    console.error("CourseCore not found");
    return;
  }

  // State
  var currentChapterId = null;
  var validIds = new Set(COURSE.chapters.map(function (c) { return c.id; }));
  var completedChapters = Core.loadProgress(localStorage.getItem("hermes_completed"), validIds);
  var bookmarkedChapters = Core.loadProgress(localStorage.getItem("hermes_bookmarked"), validIds);
  var userNotes = {};
  try {
    userNotes = JSON.parse(localStorage.getItem("hermes_notes") || "{}");
  } catch (e) {
    userNotes = {};
  }

  // Elements
  var chapterList = document.getElementById("chapter-list");
  var chapterCount = document.getElementById("chapter-count");
  var topicFilter = document.getElementById("topic-filter");
  var searchInput = document.getElementById("search");
  var progressBar = document.getElementById("progress-bar");
  var progressLabel = document.getElementById("progress-label");
  var resetProgressBtn = document.getElementById("reset-progress");
  var menuToggle = document.getElementById("menu-toggle");
  var sidebar = document.getElementById("sidebar");
  var themeToggle = document.getElementById("theme-toggle");

  var videoFrame = document.getElementById("video-frame");
  var videoStatus = document.getElementById("video-status");
  var loadVideoBtn = document.getElementById("load-video");
  var timestampInput = document.getElementById("timestamp-input");
  var timestampJumpBtn = document.getElementById("timestamp-jump");
  var videoLink = document.getElementById("video-link");

  var chapterMeta = document.getElementById("chapter-meta");
  var chapterTitle = document.getElementById("chapter-title");
  var chapterSummary = document.getElementById("chapter-summary");
  var chapterContent = document.getElementById("chapter-content");
  var completeBtn = document.getElementById("complete-btn");
  var bookmarkBtn = document.getElementById("bookmark-btn");
  var prevBtn = document.getElementById("prev-btn");
  var nextBtn = document.getElementById("next-btn");

  var notesArea = document.getElementById("notes");
  var notesStatus = document.getElementById("notes-status");
  var exportNotesBtn = document.getElementById("export-notes-btn");
  var headerExportNotes = document.getElementById("header-export-notes");
  var backupBtn = document.getElementById("backup-btn");
  var restoreBtn = document.getElementById("restore-btn");
  var restoreInput = document.getElementById("restore-input");

  var shortcutsBtn = document.getElementById("shortcuts-btn");
  var shortcutsModal = document.getElementById("shortcuts-modal");
  var closeModalBtn = document.getElementById("close-modal-btn");
  var closeModalFooterBtn = document.getElementById("close-modal-footer-btn");

  var toast = document.getElementById("toast");

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(function () {
      toast.classList.remove("show");
    }, 2500);
  }

  function downloadFile(filename, text, mimeType) {
    var blob = new Blob([text], { type: mimeType || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Views Switching
  var tabButtons = document.querySelectorAll(".view-tabs button");
  var panels = {
    course: document.getElementById("view-course"),
    architecture: document.getElementById("view-architecture"),
    templates: document.getElementById("view-templates"),
    calculator: document.getElementById("view-calculator"),
    quiz: document.getElementById("view-quiz")
  };

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var view = btn.getAttribute("data-view");
      tabButtons.forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
        b.setAttribute("tabindex", "-1");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      btn.removeAttribute("tabindex");

      Object.keys(panels).forEach(function (key) {
        if (panels[key]) {
          if (key === view) {
            panels[key].removeAttribute("hidden");
          } else {
            panels[key].setAttribute("hidden", "hidden");
          }
        }
      });
    });
  });

  // Populate Filter (Topics + Status)
  var topics = new Set();
  COURSE.chapters.forEach(function (ch) {
    if (ch.group) topics.add(ch.group);
  });
  if (topics.size > 0) {
    var optGroup = document.createElement("optgroup");
    optGroup.label = "主題分類 / Topics";
    topics.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      optGroup.appendChild(opt);
    });
    topicFilter.appendChild(optGroup);
  }

  // Render Chapters
  function renderChapterList() {
    var q = searchInput.value;
    var filterVal = topicFilter.value;
    var filtered = Core.filterChapters(COURSE.chapters, q, filterVal, completedChapters, bookmarkedChapters);
    chapterList.innerHTML = "";
    chapterCount.textContent = filtered.length + " / " + COURSE.chapters.length + " 章";

    if (filtered.length === 0) {
      chapterList.innerHTML = '<p class="empty">找不到符合條件的章節</p>';
      return;
    }

    filtered.forEach(function (ch) {
      var item = document.createElement("div");
      item.className = "chapter-item" + (ch.id === currentChapterId ? " active" : "") + (completedChapters.has(ch.id) ? " done" : "") + (bookmarkedChapters.has(ch.id) ? " bookmarked" : "");
      item.setAttribute("data-id", ch.id);

      var titleDiv = document.createElement("div");
      titleDiv.className = "ch-title-wrap";
      var tSpan = document.createElement("span");
      tSpan.className = "ch-title";
      tSpan.textContent = ch.title;
      titleDiv.appendChild(tSpan);

      var timeSpan = document.createElement("span");
      timeSpan.className = "ch-time mono";
      timeSpan.textContent = ch.time;
      titleDiv.appendChild(timeSpan);

      var metaDiv = document.createElement("div");
      metaDiv.className = "ch-meta-wrap";

      var starBtn = document.createElement("button");
      starBtn.type = "button";
      starBtn.className = "star-btn";
      starBtn.setAttribute("aria-label", "收藏章節");
      starBtn.textContent = bookmarkedChapters.has(ch.id) ? "⭐" : "☆";
      starBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleBookmark(ch.id);
      });
      metaDiv.appendChild(starBtn);

      item.appendChild(titleDiv);
      item.appendChild(metaDiv);

      item.addEventListener("click", function () {
        selectChapter(ch.id);
        if (window.innerWidth < 1024 && sidebar) {
          sidebar.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
      chapterList.appendChild(item);
    });
  }

  function updateProgress() {
    var total = COURSE.chapters.length;
    var done = completedChapters.size;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    progressBar.value = pct;
    progressBar.textContent = pct + "%";
    progressLabel.textContent = "已完成 " + done + " / " + total + " 章 (" + pct + "%)";
    localStorage.setItem("hermes_completed", JSON.stringify(Array.from(completedChapters)));
    localStorage.setItem("hermes_bookmarked", JSON.stringify(Array.from(bookmarkedChapters)));
  }

  function toggleBookmark(id) {
    if (!id) return;
    if (bookmarkedChapters.has(id)) {
      bookmarkedChapters.delete(id);
      showToast("已取消收藏");
    } else {
      bookmarkedChapters.add(id);
      showToast("已加入收藏！可在篩選中檢視");
    }
    updateProgress();
    if (currentChapterId === id) updateBookmarkBtn();
    renderChapterList();
  }

  function updateBookmarkBtn() {
    if (!bookmarkBtn || !currentChapterId) return;
    if (bookmarkedChapters.has(currentChapterId)) {
      bookmarkBtn.classList.add("active");
      bookmarkBtn.textContent = "⭐ 已收藏 (點擊取消)";
    } else {
      bookmarkBtn.classList.remove("active");
      bookmarkBtn.textContent = "☆ 收藏本章 / Bookmark";
    }
  }

  function selectChapter(id) {
    var ch = COURSE.chapters.find(function (c) { return c.id === id; });
    if (!ch) return;
    currentChapterId = id;

    // Update Header Meta
    chapterMeta.textContent = (ch.group || "單元") + " · " + ch.time;
    chapterTitle.textContent = ch.title;
    chapterSummary.textContent = ch.summary;

    // Build Content blocks
    chapterContent.innerHTML = "";

    // Key points
    if (ch.points && ch.points.length > 0) {
      var b1 = document.createElement("div");
      b1.className = "lesson-block";
      b1.innerHTML = "<h3>核心要點 / Key Points</h3>";
      var ul = document.createElement("ul");
      ul.className = "points";
      ch.points.forEach(function (p) {
        var li = document.createElement("li");
        li.textContent = p;
        ul.appendChild(li);
      });
      b1.appendChild(ul);
      chapterContent.appendChild(b1);
    }

    // Hands-on Steps
    if (ch.steps && ch.steps.length > 0) {
      var b2 = document.createElement("div");
      b2.className = "lesson-block";
      b2.innerHTML = "<h3>實作建議 / Action Steps</h3>";
      var ol = document.createElement("ol");
      ol.className = "steps";
      ch.steps.forEach(function (s) {
        var li = document.createElement("li");
        li.textContent = s;
        ol.appendChild(li);
      });
      b2.appendChild(ol);
      chapterContent.appendChild(b2);
    }

    // Takeaway & Caution
    if (ch.takeaway || ch.caution) {
      var b3 = document.createElement("div");
      b3.className = "lesson-block takeaway-block";
      if (ch.takeaway) {
        var pTake = document.createElement("p");
        pTake.className = "takeaway-text";
        pTake.innerHTML = "<strong>💡 核心金句：</strong>" + ch.takeaway;
        b3.appendChild(pTake);
      }
      if (ch.caution) {
        var pCaut = document.createElement("p");
        pCaut.className = "caution-text muted small";
        pCaut.innerHTML = "<strong>⚠️ 風險提示：</strong>" + ch.caution;
        b3.appendChild(pCaut);
      }
      chapterContent.appendChild(b3);
    }

    // Update Complete Button
    if (completedChapters.has(id)) {
      completeBtn.classList.add("done");
      completeBtn.textContent = "✓ 已完成本章 (點擊取消)";
    } else {
      completeBtn.classList.remove("done");
      completeBtn.textContent = "○ 標記為已完成 / Mark Done";
    }

    // Update Bookmark Button
    updateBookmarkBtn();

    // Pagination
    var idx = COURSE.chapters.findIndex(function (c) { return c.id === id; });
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= COURSE.chapters.length - 1;

    // Update Timestamp Input & link
    timestampInput.value = ch.time;
    videoLink.href = "https://www.youtube.com/watch?v=8yE6G1Lup1s&t=" + ch.seconds + "s";

    // Auto-update video iframe if already loaded
    if (videoFrame.getAttribute("src") !== "about:blank") {
      videoFrame.src = Core.embedUrl(ch.seconds);
      videoStatus.textContent = "播放中 · " + ch.time + " (" + ch.title + ")";
    }

    // Load Notes
    notesArea.value = userNotes[id] || "";
    notesStatus.textContent = userNotes[id] ? "已自動儲存 (" + userNotes[id].length + " 字)" : "尚未填寫筆記";

    renderChapterList();
  }

  // Complete Button
  completeBtn.addEventListener("click", function () {
    if (!currentChapterId) return;
    if (completedChapters.has(currentChapterId)) {
      completedChapters.delete(currentChapterId);
      showToast("已取消完成標記");
    } else {
      completedChapters.add(currentChapterId);
      showToast("本章已完成！進度已更新");
    }
    updateProgress();
    selectChapter(currentChapterId);
  });

  // Bookmark Button in lesson-actions
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener("click", function () {
      if (currentChapterId) toggleBookmark(currentChapterId);
    });
  }

  // Prev / Next
  prevBtn.addEventListener("click", function () {
    var idx = COURSE.chapters.findIndex(function (c) { return c.id === currentChapterId; });
    if (idx > 0) selectChapter(COURSE.chapters[idx - 1].id);
  });
  nextBtn.addEventListener("click", function () {
    var idx = COURSE.chapters.findIndex(function (c) { return c.id === currentChapterId; });
    if (idx >= 0 && idx < COURSE.chapters.length - 1) selectChapter(COURSE.chapters[idx + 1].id);
  });

  // Video Load & Jumps
  loadVideoBtn.addEventListener("click", function () {
    var sec = currentChapterId ? (COURSE.chapters.find(function (c) { return c.id === currentChapterId; }) || {}).seconds || 0 : 0;
    videoFrame.src = Core.embedUrl(sec);
    videoStatus.textContent = "影片已載入播放器";
    showToast("YouTube 影片已就緒");
  });

  timestampJumpBtn.addEventListener("click", function () {
    var sec = Core.timestampSeconds(timestampInput.value);
    videoFrame.src = Core.embedUrl(sec);
    videoStatus.textContent = "跳轉至 " + Core.formatSeconds(sec);
  });

  // Notes Auto-save
  notesArea.addEventListener("input", function () {
    if (!currentChapterId) return;
    userNotes[currentChapterId] = notesArea.value;
    localStorage.setItem("hermes_notes", JSON.stringify(userNotes));
    notesStatus.textContent = "已自動儲存 (" + userNotes[currentChapterId].length + " 字)";
  });

  // Export Notes to Markdown
  function handleExportNotes() {
    var md = Core.exportNotesMarkdown(COURSE.chapters, userNotes, completedChapters, bookmarkedChapters);
    downloadFile("Hermes_Masterclass_Study_Notes.md", md, "text/markdown;charset=utf-8");
    showToast("已匯出個人實作筆記為 Markdown 檔");
  }
  if (exportNotesBtn) exportNotesBtn.addEventListener("click", handleExportNotes);
  if (headerExportNotes) headerExportNotes.addEventListener("click", handleExportNotes);

  // Backup Data (JSON)
  if (backupBtn) {
    backupBtn.addEventListener("click", function () {
      var payload = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        completed: Array.from(completedChapters),
        bookmarked: Array.from(bookmarkedChapters),
        notes: userNotes
      };
      downloadFile("hermes_learning_backup.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
      showToast("學習進度與筆記已成功備份為 JSON 檔");
    });
  }

  // Restore Data (JSON)
  if (restoreBtn && restoreInput) {
    restoreBtn.addEventListener("click", function () {
      restoreInput.click();
    });
    restoreInput.addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var data = JSON.parse(ev.target.result);
          if (data.completed && Array.isArray(data.completed)) {
            completedChapters = Core.loadProgress(data.completed, validIds);
          }
          if (data.bookmarked && Array.isArray(data.bookmarked)) {
            bookmarkedChapters = Core.loadProgress(data.bookmarked, validIds);
          }
          if (data.notes && typeof data.notes === "object") {
            userNotes = data.notes;
            localStorage.setItem("hermes_notes", JSON.stringify(userNotes));
          }
          updateProgress();
          if (currentChapterId) selectChapter(currentChapterId);
          showToast("備份資料已成功匯入！");
        } catch (err) {
          alert("備份檔格式不正確，無法匯入。");
        }
      };
      reader.readAsText(file);
      restoreInput.value = "";
    });
  }

  // Search & Filter
  searchInput.addEventListener("input", renderChapterList);
  topicFilter.addEventListener("change", renderChapterList);

  // Reset Progress
  resetProgressBtn.addEventListener("click", function () {
    if (confirm("確定要重設所有章節的學習進度嗎？（筆記與收藏仍會保留）")) {
      completedChapters.clear();
      updateProgress();
      if (currentChapterId) selectChapter(currentChapterId);
      showToast("進度已重設");
    }
  });

  // Mobile Menu Toggle
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Dark/Light Theme Toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isDark = document.body.classList.toggle("light-theme");
      themeToggle.textContent = isDark ? "☼" : "◐";
      localStorage.setItem("hermes_theme", isDark ? "light" : "dark");
    });
    if (localStorage.getItem("hermes_theme") === "light") {
      document.body.classList.add("light-theme");
      themeToggle.textContent = "☼";
    }
  }

  // Shortcuts Modal Dialog
  function openShortcuts() {
    if (shortcutsModal) {
      if (typeof shortcutsModal.showModal === "function") {
        shortcutsModal.showModal();
      } else {
        shortcutsModal.setAttribute("open", "true");
      }
    }
  }
  function closeShortcuts() {
    if (shortcutsModal) {
      if (typeof shortcutsModal.close === "function") {
        shortcutsModal.close();
      } else {
        shortcutsModal.removeAttribute("open");
      }
    }
  }

  if (shortcutsBtn) shortcutsBtn.addEventListener("click", openShortcuts);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeShortcuts);
  if (closeModalFooterBtn) closeModalFooterBtn.addEventListener("click", closeShortcuts);

  // Global Keyboard Shortcuts
  window.addEventListener("keydown", function (e) {
    // If inside text fields, ignore most keys except Esc
    var inInput = ["INPUT", "TEXTAREA", "SELECT"].indexOf(e.target.tagName) >= 0;
    if (e.key === "Escape") {
      closeShortcuts();
      return;
    }
    if (inInput) return;

    if (e.key === "j" || e.key === "J" || e.key === "]") {
      nextBtn.click();
    } else if (e.key === "k" || e.key === "K" || e.key === "[") {
      prevBtn.click();
    } else if (e.key === "m" || e.key === "M") {
      completeBtn.click();
    } else if (e.key === "s" || e.key === "S") {
      if (currentChapterId) toggleBookmark(currentChapterId);
    } else if (e.key === "/") {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === "t" || e.key === "T") {
      themeToggle.click();
    } else if (e.key === "?") {
      openShortcuts();
    } else if (e.key >= "1" && e.key <= "5") {
      var tabIdx = parseInt(e.key, 10) - 1;
      if (tabButtons[tabIdx]) tabButtons[tabIdx].click();
    }
  });

  // --- Populate Architecture View ---
  var archNodes = document.getElementById("architecture-nodes");
  var archDetail = document.getElementById("architecture-detail");
  if (archNodes && archDetail && COURSE.architecture) {
    COURSE.architecture.forEach(function (node, idx) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "arch-node-card" + (idx === 0 ? " active" : "");
      card.innerHTML = '<span class="eyebrow">' + (node.label || "架構") + '</span><h3>' + node.title + '</h3>';
      card.addEventListener("click", function () {
        document.querySelectorAll(".arch-node-card").forEach(function (c) { c.classList.remove("active"); });
        card.classList.add("active");
        renderArchDetail(node);
      });
      archNodes.appendChild(card);
    });
    if (COURSE.architecture.length > 0) {
      renderArchDetail(COURSE.architecture[0]);
    }
  }

  function renderArchDetail(node) {
    var html = '<h2>' + node.title + '</h2>';
    html += '<p class="lead-text">' + node.body + '</p>';
    if (node.points && node.points.length > 0) {
      html += '<h3>設計重點</h3><ul class="points">';
      node.points.forEach(function (p) {
        html += '<li>' + p + '</li>';
      });
      html += '</ul>';
    }
    archDetail.innerHTML = html;
  }

  // --- Populate Templates View ---
  var templateList = document.getElementById("template-list");
  if (templateList && COURSE.templates) {
    COURSE.templates.forEach(function (tmpl) {
      var item = document.createElement("div");
      item.className = "template-card";
      item.innerHTML = '<div class="row-between"><div><h3>' + tmpl.title + '</h3><p class="small muted">' + tmpl.description + '</p></div><button type="button" class="copy-btn quiet-button">複製代碼 / Copy</button></div><pre><code>' + escapeHtml(tmpl.code) + '</code></pre>';
      var copyBtn = item.querySelector(".copy-btn");
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(tmpl.code).then(function () {
            showToast("已複製 " + tmpl.filename + " 至剪貼簿");
          }).catch(function () {
            downloadFile(tmpl.filename, tmpl.code, "text/markdown;charset=utf-8");
            showToast("已下載 " + tmpl.filename);
          });
        } else {
          downloadFile(tmpl.filename, tmpl.code, "text/markdown;charset=utf-8");
          showToast("已下載 " + tmpl.filename);
        }
      });
      templateList.appendChild(item);
    });
  }

  // --- Populate Calculator View ---
  var offerForm = document.getElementById("offer-form");
  var offerTier = document.getElementById("offer-tier");
  var offerCurrency = document.getElementById("offer-currency");
  var calcResults = document.getElementById("calculator-results");
  var copyProposalBtn = document.getElementById("copy-proposal-btn");
  var downloadProposalBtn = document.getElementById("download-proposal-btn");

  var tierPresets = {
    install: { clients: 5, setup: 1000, retainer: 300, cost: 50, hours: 6, hourly: 40, saved: 15, val: 40 },
    functional: { clients: 3, setup: 2500, retainer: 600, cost: 120, hours: 12, hourly: 50, saved: 30, val: 50 },
    workforce: { clients: 2, setup: 6000, retainer: 1500, cost: 300, hours: 25, hourly: 60, saved: 60, val: 60 }
  };

  if (offerTier) {
    offerTier.addEventListener("change", function () {
      var p = tierPresets[offerTier.value];
      if (p) {
        document.getElementById("clients").value = p.clients;
        document.getElementById("setup").value = p.setup;
        document.getElementById("retainer").value = p.retainer;
        document.getElementById("monthly-cost").value = p.cost;
        document.getElementById("delivery-hours").value = p.hours;
        document.getElementById("hourly-cost").value = p.hourly;
        document.getElementById("saved-hours").value = p.saved;
        document.getElementById("client-hourly-value").value = p.val;
        updateCalculator();
      }
    });
  }

  if (offerCurrency) {
    offerCurrency.addEventListener("change", updateCalculator);
  }

  function getCalculatorInputs() {
    return {
      clients: Number(document.getElementById("clients").value) || 0,
      setup: Number(document.getElementById("setup").value) || 0,
      retainer: Number(document.getElementById("retainer").value) || 0,
      monthlyCost: Number(document.getElementById("monthly-cost").value) || 0,
      deliveryHours: Number(document.getElementById("delivery-hours").value) || 0,
      hourlyCost: Number(document.getElementById("hourly-cost").value) || 0,
      savedHours: Number(document.getElementById("saved-hours").value) || 0,
      clientHourlyValue: Number(document.getElementById("client-hourly-value").value) || 0
    };
  }

  function updateCalculator() {
    if (!offerForm || !calcResults) return;
    var inp = getCalculatorInputs();
    var curCode = offerCurrency ? offerCurrency.value : "USD";
    var res = Core.calculateOffer(inp, curCode);
    var sym = res.currency.symbol;

    calcResults.innerHTML = [
      '<div class="calc-metric-grid">',
      '  <div class="metric-card"><span class="eyebrow">YEAR 1 ANNUAL REVENUE</span><div class="val accent">' + sym + res.annualRevenue.toLocaleString() + '</div><span class="small muted">預收 ' + sym + res.upfrontRevenue.toLocaleString() + ' + 月費總計</span></div>',
      '  <div class="metric-card"><span class="eyebrow">YEAR 1 GROSS PROFIT</span><div class="val">' + sym + res.yearOneGrossProfit.toLocaleString() + '</div><span class="small muted">毛利率 ' + res.grossMarginPct + '%</span></div>',
      '  <div class="metric-card"><span class="eyebrow">CLIENT MONTHLY NET ROI</span><div class="val">' + sym + res.clientMonthlyNetValue.toLocaleString() + '</div><span class="small muted">每位客戶月省 ' + sym + res.clientMonthlyGrossValue.toLocaleString() + ' - 月費</span></div>',
      '  <div class="metric-card"><span class="eyebrow">MONTHLY RECURRING (MRR)</span><div class="val">' + sym + res.monthlyRevenue.toLocaleString() + '</div><span class="small muted">' + inp.clients + ' 位客戶每月穩定現金流</span></div>',
      '</div>'
    ].join("");
  }

  if (offerForm) {
    offerForm.addEventListener("input", updateCalculator);
    updateCalculator();
  }

  if (copyProposalBtn) {
    copyProposalBtn.addEventListener("click", function () {
      var inp = getCalculatorInputs();
      var curCode = offerCurrency ? offerCurrency.value : "USD";
      var res = Core.calculateOffer(inp, curCode);
      var text = Core.generateOfferProposal(inp, res);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast("已複製商業提案建議書至剪貼簿！");
        }).catch(function () {
          downloadFile("Hermes_Agent_Deployment_Proposal.md", text, "text/markdown;charset=utf-8");
          showToast("已下載商業提案建議書檔案！");
        });
      } else {
        downloadFile("Hermes_Agent_Deployment_Proposal.md", text, "text/markdown;charset=utf-8");
        showToast("已下載商業提案建議書檔案！");
      }
    });
  }

  if (downloadProposalBtn) {
    downloadProposalBtn.addEventListener("click", function () {
      var inp = getCalculatorInputs();
      var curCode = offerCurrency ? offerCurrency.value : "USD";
      var res = Core.calculateOffer(inp, curCode);
      var text = Core.generateOfferProposal(inp, res);
      downloadFile("Hermes_Agent_Deployment_Proposal.md", text, "text/markdown;charset=utf-8");
      showToast("已下載商業提案建議書！");
    });
  }

  // --- Populate Quiz View ---
  var quizList = document.getElementById("quiz-list");
  var quizGradeBtn = document.getElementById("quiz-grade");
  var quizResetBtn = document.getElementById("quiz-reset");
  var quizResult = document.getElementById("quiz-result");

  if (quizList && COURSE.quiz) {
    renderQuiz();
  }

  function renderQuiz() {
    quizList.innerHTML = "";
    COURSE.quiz.forEach(function (q, qIdx) {
      var item = document.createElement("div");
      item.className = "quiz-card";
      item.id = "quiz-" + q.id;

      var qTitle = document.createElement("h3");
      qTitle.textContent = (qIdx + 1) + ". " + q.question;
      item.appendChild(qTitle);

      var optsDiv = document.createElement("div");
      optsDiv.className = "quiz-options";
      q.options.forEach(function (opt, oIdx) {
        var label = document.createElement("label");
        label.className = "quiz-option";
        var radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "quiz_ans_" + q.id;
        radio.value = oIdx;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(" " + opt));
        optsDiv.appendChild(label);
      });
      item.appendChild(optsDiv);

      var expDiv = document.createElement("div");
      expDiv.className = "quiz-explanation";
      expDiv.setAttribute("hidden", "hidden");
      item.appendChild(expDiv);

      quizList.appendChild(item);
    });
  }

  if (quizGradeBtn) {
    quizGradeBtn.addEventListener("click", function () {
      var answers = {};
      COURSE.quiz.forEach(function (q) {
        var sel = document.querySelector('input[name="quiz_ans_' + q.id + '"]:checked');
        if (sel) answers[q.id] = sel.value;
      });

      var res = Core.gradeQuiz(COURSE.quiz, answers);
      quizResult.innerHTML = '<div class="notice"><h3>檢核成績：' + res.score + ' / ' + res.total + ' (' + res.pct + '%)</h3><p>' + (res.pct >= 80 ? "太棒了！你已經掌握了 Hermes Agent 的核心哲學與商業思維。" : "建議回顧答錯的章節，再次確認核心概念。") + '</p></div>';

      res.details.forEach(function (d) {
        var card = document.getElementById("quiz-" + d.id);
        if (!card) return;
        var exp = card.querySelector(".quiz-explanation");
        exp.removeAttribute("hidden");
        if (d.isCorrect) {
          card.classList.remove("incorrect");
          card.classList.add("correct");
          exp.innerHTML = '<span class="status-badge green">✓ 正確</span> ' + d.explanation;
        } else {
          card.classList.remove("correct");
          card.classList.add("incorrect");
          exp.innerHTML = '<span class="status-badge red">✗ 錯誤</span> ' + d.explanation;
        }
      });
      showToast("評分完成");
    });
  }

  if (quizResetBtn) {
    quizResetBtn.addEventListener("click", function () {
      renderQuiz();
      quizResult.innerHTML = "";
      showToast("測驗已重設");
    });
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Initial Load
  updateProgress();
  if (COURSE.chapters.length > 0) {
    selectChapter(COURSE.chapters[0].id);
  }
})();

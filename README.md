# Hermes Agent Masterclass Learning Workspace

> 專為 Danny 打造的 **Hermes Agent 3 小時全方位精通與商業化（Build & Sell 2026）** 互動學習工作台。

線上體驗與實作導覽：**[https://kashing-cks.github.io/hermes-agent-course/](https://kashing-cks.github.io/hermes-agent-course/)**

---

## 學習資源目錄與核心特色

1. **章節時間戳導航（Chapter Navigator & Player）**
   - 完整收錄 Samin Yasar 3 小時課程的 64 個出版章節，點擊時間戳即可無縫跳轉至 YouTube 對應精準位置。
   - 繁體中文結構化整理：核心要點、實作建議、金句提煉與風險警示。

2. **系統架構圖譜（System Architecture Map）**
   - **車輛模型（Engine vs. Harness）**：深度理解大模型（思考推理）與外骨骼載具（終端、檔案、記憶、閘道）的職責分工。
   - **自愈自進化閉環（Self-Improvement Loop）**：理解任務執行、Skill 自動提煉與 Curator 管家記憶代謝機制。
   - **多角色戰隊協同（Squads Architecture）**：探索 CEO、SA、Coder、Designer 的 Profile 分工與本地總線協同。

3. **實戰範本庫（Copyable Templates）**
   - `soul.md`：數位員工靈魂人設範本。
   - `user.md`：使用者長效事實與偏好設定檔範本。
   - `5-Step Agentic Workflow Recipe`：晨間早報與無人值守自動化通用食譜。

4. **商業化試算工作台（Offer & ROI Calculator）**
   - 模擬 Mark Cuban 所倡導的「AI 系統整合商（AI Integrator）」商務模式。
   - 預設三級選單（基礎安裝、專屬業務 Agent、企業級 AI 團隊），即時試算前期建置費、月度維護 Retainer、毛利率與客戶端 ROI。

5. **自我檢核評測（Knowledge Quiz）**
   - 內建自我檢核考卷與即時評分、解析，鞏固觀念。

---

## 本地運行與測試

本專案採用純靜態架構（HTML5 / CSS / Vanilla JavaScript），零外部運行時依賴，可直接以任何靜態伺服器運行：

```bash
# 本地啟動預覽
python3 -m http.server 8000
# 瀏覽器開啟 http://localhost:8000
```

### 執行單元測試
```bash
node -e 'require("./assets/core.js")'
```

---

## 來源聲明
- 原課程影片版權歸 **Samin Yasar** 所有（[YouTube 原影片](https://youtu.be/8yE6G1Lup1s)）。
- Hermes Agent 框架由 **Nous Research** 研發（[官方文檔](https://hermes-agent.nousresearch.com/docs/)）。
- 本專案由 Coder Agent 協助建置，純粹用於技術學習與架構研究。

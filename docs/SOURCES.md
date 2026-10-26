# 來源、內容範圍與查核限制

查閱日期：2026-10-26（Asia/Taipei）。本專案是原創繁體中文學習伴讀，不是逐字稿翻譯。[1]

## 證據層級

- **精確章節**：瀏覽器開啟發布者 YouTube 頁面並展開說明欄，從 `Chapters` 區段提取；去除頁面重複 UI 後共 64 章。全部保留原始時間與英文章節名，起點 `0:00`，最後 `3:01:06`。[1]
- **現行產品行為**：直接擷取 Hermes 官方頁面；這些檔案優先於課程中的舊畫面或措辭。記憶、人格、profiles、Honcho、cron、Telegram、Slack、Photon、MCP 等皆查過對應頁面。[2][3][4]
- **補充官方查核**：profiles 的 home 與 OAuth 行為、Telegram 設定與路由、技能與 delegation、安裝方式及 Google Workspace 授權另有對應頁面；它們列在下方完整來源表供回查。[5][7][12]
- **其他流程來源**：短期委派、平臺安裝與 Workspace 的具體前提應依對應檔案確認，不從影片畫面推測指令。[13][14][17]
- **原創練習**：每章 summary、points、steps、takeaway、caution，以及五步配方、三渠道建議與 Jarvis 五部分皆由本學習站撰寫；不是講者逐字引言，不聲稱確認了每一段示範操作。
- **使用者需求提供**：三層 USD 示意為 install **$500–1500**；功能型 **$1500–3500 setup + $300–1000/月**；workforce **$5000+**。未獨立驗證市場行情、成交率、收入或 ROI。維護額度、人工、工具、稅費與變更應另列。

## 必須保留的澄清

1. 課程小寫 `soul.md` / `user.md` 保留在原始章節名；現行實際檔案是 `$HERMES_HOME/SOUL.md` 與 `$HERMES_HOME/memories/USER.md`。`MEMORY.md` 記代理學到的事實，`AGENTS.md` 記專案規則。系統提示使用會話開始的快照，須在新會話驗證更新。[15]
2. Honcho 現行為 catalog memory provider plugin；官方有 plugin 安裝、memory setup、API key 或自架認證流程。影片 `Connecting Honcho via OAuth` 僅保留為章節名稱，沒有聲稱重現該授權畫面。[4]
3. Multica 是課程中的外部 app，不是 Hermes 內建 SQLite kanban 的別名；未核實外部 app 的最新功能與費率。`/goal` 是單會話目標，不自動建立看板卡。[11][16]
4. 原始 `News Portal` 標籤照錄；現行官方服務名稱為 Nous Portal。`GPT 5.5` 保留為課程章節標籤，不聲稱所有帳號可用，也未核實其價格或效能。[1][6]
5. Slack 現行使用 Socket Mode。Photon 是代管 iMessage 服務與 Node sidecar，不需自建 Mac relay；平臺 token、配對與授權仍需安全治理。[8][9]
6. MCP 是工具介面，不是安全認證；第三方 Composio、Higgsfield、Firecrawl、here.now、Blotato、Skool bot、AgentMail、Coinvest、QuiverQuant 等只作課程例子，未聲稱測試當前 API、商業方案或績效。[1][10]
7. OpenClaw/Cursor 的「bloat／臃腫」比較屬講者主觀評價，沒有獨立控制條件的基準測量。Mark Cuban 歸因僅出現於發布者章節，未獨立找到並核對原始發言；不作已證實名言或背書。[1]
8. 三條獲客建議與五步／五部分配方明確標為原創練習，不假裝還原逐字稿。公開聯絡資料不等於行銷同意；不提供無限制爬取與群發指令。
9. 交易僅唯讀、回測與 paper trading，不連真實下單、不保證收益。健康僅整理紀錄與就診問題，不診斷、不調藥、不承諾療效；敏感資料最小化。
10. YouTube 播放顯示 bot confirmation，故**未觀看／審閱完整影片或逐字稿**。來源只支援其證據層級；完整操作驗證與第三方價格均不在本內容任務範圍。

## 完整發布者章節（原樣時間，不估算）

- `0:00` Intro
- `0:49` How to Watch This Course
- `2:44` What Hermes Agent Actually Is
- `3:25` Hermes vs OpenClaw: Self-Improvement & Memory Curation
- `5:26` Model vs Agentic Harness (The Car Analogy)
- `7:06` The Good, the Bad & the Ugly
- `8:36` FULL SETUP FROM SCRATCH: Hosting & Cost Decisions
- `10:51` The Buddy System: Codex as Your Repair Doctor
- `12:43` Installing the Hermes Agent Desktop App
- `14:02` Connecting GPT 5.5 as Your Primary Model
- `15:01` News Portal: Your Backup Brain
- `17:18` Enabling Computer Use
- `19:07` Tour of Samin's Real Telegram Setup
- `21:22` Channels: Telegram · Slack · iMessage
- `23:00` Connecting Telegram via BotFather
- `28:14` Telegram Topics: Multi-Thread Workflows
- `32:26` Setting Up Slack as an AI Teammate
- `38:34` iMessage via Photon — Hermes Configures Itself
- `41:53` Identity Files: soul.md Personality
- `45:57` The user.md Memory File
- `47:08` Honcho Shared Memory: Why It's Hard
- `50:34` Introducing Honcho: One Shared Brain
- `54:49` Why Hermes + Honcho Beats Standalone Agents
- `56:24` Connecting Honcho via OAuth
- `56:50` Multica: Chat Plus a Project Board
- `1:01:26` Installing Multica
- `1:03:30` Making Hermes Your AI Project Manager
- `1:06:58` Profiles: One Hermes, Many AI Employees
- `1:10:34` Squads: Building an Agent Team
- `1:14:52` Connectors: MCPs vs CLIs vs APIs
- `1:15:58` Composio: The MCP Gateway to Hundreds of Apps
- `1:18:11` Installing the Google Workspace CLI
- `1:19:01` Cron Jobs: Autonomous Autopilot Use Cases
- `1:20:26` BUILD: Morning-Briefing Autopilot
- `1:26:36` Packaging the Briefing Into a Reusable Skill
- `1:28:21` Agentic Workflows & the 5-Step Recipe
- `1:32:37` BUILD #2: Animated Website (/goal Command)
- `1:34:11` Installing Higgsfield, Firecrawl & here.now
- `1:40:44` Touring the One-Shot Animated Website
- `1:43:31` BUILD #3: Property Marketing Kit
- `1:47:30` Building the Kit With the Skill
- `1:50:01` Autopilot Leads: Scraped Realtor Contacts
- `1:52:33` How to Get Clients (3 Channels)
- `1:55:50` BUILD #4: Instagram Thread Carousels
- `1:58:10` BUILD: Designed Pixel-Style Carousels
- `2:01:50` Auto-Posting: Blotato & the Content Calendar
- `2:04:07` Content Repurpose Octopus
- `2:09:40` Filming the Raw Short-Form Clip
- `2:10:53` Two-Pass AI Video Editing (Cut + B-Roll)
- `2:16:16` BUILD #5: E-Com Ad Factory
- `2:19:59` Community Manager + AI Inbox (Skool Bot)
- `2:24:17` Giving Your Agent Its Own Email (AgentMail)
- `2:26:20` BUILD: Self-Improving Trading Bot (Coinvest)
- `2:30:07` Strategy: Copy-Trading Congress (QuiverQuant)
- `2:34:02` Build: Copy-Trading Bot Following Tim Moore (Coinvest)
- `2:36:40` Health & Longevity Coach
- `2:41:24` Jarvis: One Command Center for All Agents
- `2:45:06` How I Built Jarvis: The Five-Part Recipe
- `2:48:29` Selling & Pricing Your Builds
- `2:48:51` Mark Cuban on the AI Integrator Opportunity
- `2:53:36` Offer Menu: Install → Executive Assistant → Websites
- `2:56:37` Offer Menu: Property Kits → Content → Ads → Community
- `2:59:58` Pricing Principles: Outcome, Retainer, Risk Reversal
- `3:01:06` What to Do Next

## Sources

[1] https://www.youtube.com/watch?v=8yE6G1Lup1s
[2] https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
[3] https://hermes-agent.nousresearch.com/docs/user-guide/features/personality
[4] https://hermes-agent.nousresearch.com/docs/user-guide/features/honcho
[5] https://hermes-agent.nousresearch.com/docs/user-guide/profiles
[6] https://hermes-agent.nousresearch.com/docs/user-guide/features/cron
[7] https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram
[8] https://hermes-agent.nousresearch.com/docs/user-guide/messaging/slack
[9] https://hermes-agent.nousresearch.com/docs/user-guide/messaging/photon
[10] https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp
[11] https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban
[12] https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
[13] https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation
[14] https://hermes-agent.nousresearch.com/docs/getting-started/installation
[15] https://hermes-agent.nousresearch.com/docs/user-guide/which-file-does-what
[16] https://hermes-agent.nousresearch.com/docs/user-guide/features/goals
[17] https://hermes-agent.nousresearch.com/docs/user-guide/skills/google-workspace

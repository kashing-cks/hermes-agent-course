# Hermes Course Learning Hub — Implementation Plan

## Goal
Build and publish a Traditional Chinese learning companion for Danny for Samin Yasar's three-hour Hermes course. Static HTML/CSS/JS, no runtime package dependencies or backend. Video itself remains on YouTube; the site does not execute agents, trades, outreach or payments.

## Verified context
- Workspace /opt/data/hermes-agent-course was absent and is now created.
- gh auth status: authenticated as kashing-cks with repo/workflow scopes.
- gh repo view: target repo does not yet exist.
- Node v26.5.1 available for built-in test runner.
- YouTube publisher description exposes actual chapters from 0:00 through 3:01:06. Playback is bot-gated on this host. Do not invent timestamps or imply transcript review.
- Official Hermes documentation index retrieved. Current docs use SOUL.md / USER.md (course labels soul.md / user.md retained as course terminology).
- gh repo edit has no --enable-pages / --pages-branch flags. Use documented GitHub Pages REST endpoint through gh api instead, specifying main and root explicitly.

## Approach / file contract
Learn surface: dark charcoal and warm lime, left navigation, large video/workbench, distinct recipe/library/calculator/quiz views. No external fonts or CSS frameworks. Responsive and keyboard accessible, with local-only progress and notes.

index.html: semantic app shell
assets/style.css: responsive visual system
assets/content.js: window.COURSE={chapters,architecture,templates,quiz,sources}
assets/core.js: UMD window.CourseCore/CommonJS pure logic
assets/app.js: DOM interactions
assets/favicon.svg: local identity
 tests/core.test.cjs: node:test coverage
 tests/browser.cjs: real Playwright interaction and responsive tests (dev only)
README.md: run, test, deployment, provenance and limitations
.nojekyll: static serving

Content schema: chapters[{id,title,time,seconds,group,tags,summary,points[],steps[],takeaway,caution,source}], architecture[{id,title,label,body,points[]}], templates[{id,title,filename,description,code}], quiz[{id,question,options[],answer:number,explanation}], sources[{title,url,note}]. CourseCore.filterChapters(chapters,query,tag); calculateOffer({clients,setup,retainer,monthlyCost,deliveryHours,hourlyCost,savedHours,clientHourlyValue}); timestampSeconds(string); embedUrl(seconds); loadProgress(raw,validIds); gradeQuiz(questions,answers).

## Phases / verification
1. Save source chapters and curate original study notes against official docs; clearly separate course statements, current docs and suggested exercises. Exact publisher chapter data is the timestamp authority.
2. Implement pure logic in vertical RED→GREEN cycles: tests/core.test.cjs then assets/core.js. Run node --test tests/core.test.cjs after every slice.
3. Build shell/style and wire navigation, timestamp jumps, search/tag filtering, architecture inspector, copy/download templates, quiz feedback, editable calculator, notes and progress persistence. Browser smoke test plus desktop/mobile viewport overflow checks.
4. Check all code syntax, content coverage/counts, accessibility and calculator edge cases; inspect screenshot. Record actual verification in docs/VERIFICATION.md.
5. git init -b main; commit; gh repo create kashing-cks/hermes-agent-course --public --source=. --remote=origin --push. Enable Pages via gh api POST repos/kashing-cks/hermes-agent-course/pages with build_type=legacy and source branch=main,path=/.
6. Read exact repo, remote main SHA and Pages config/build status back; HTTP GET production URL and exercise production browser interactions before final report.

## Risks / decisions
Playback can be blocked by YouTube host/network restrictions; provide external timestamped link and manual timestamp input. Transcript not verified, so summaries are original explanations based on supplied brief and verified chapter titles, not purported quotes. Monetization tiers are illustrative brief-provided USD ranges, not validated market rates. Financial and medical examples must be paper-trade / educational, never autonomous real-money or clinical advice. localStorage can be unavailable: gracefully degrade and warn. No secrets in published source. No production gateway/config changes. Dev test dependencies belong only to the project/scratch, not Hermes runtime.

## Definition of done
All requested study features run in a real browser at desktop/mobile sizes; Node tests pass; every verified chapter is navigable; repository is public and remote main matches local commit; Pages serves this app at the requested URL with main/root source, confirmed by readback and HTTP/browser verification. Any external playback restrictions are disclosed.

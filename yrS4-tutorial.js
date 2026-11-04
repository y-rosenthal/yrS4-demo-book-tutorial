// yrS4-tutorial.js: the interactive tutorial of subjexts, this book's own feature (docs/PLANNING-v001.qmd).
//
// It drives the subjexts page script from outside, through the object it exposes as window.__yrS4 (its state,
// marks, placed marks and UI host), and the elements it draws on the page (classes yrS4-legend, yrS4-bar,
// yrS4-box, yrS4-menu, yrS4-editbox, yrS4-card). It never calls the platform and stores nothing but the
// reader's place in the tour (localStorage "yrS4-tutorial"). If the page script is absent, the start button
// says so and nothing else happens.
(function () {
  'use strict'
  const KEY = 'yrS4-tutorial'
  const SECTION = 'demo-101'
  const JOIN = 'yrs4-demo'
  const TOC_PAGE = 'subjexts-labels-v001.html'
  const o = () => window.__yrS4
  const st = () => (o() && o().state) || null
  const q = (sel) => document.querySelector(sel)
  const here = () => (location.pathname.split('/').pop() || 'index.html')
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null') } catch { return null } }
  const save = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY) } catch { /* ignore */ } }
  const panelEl = () => (o() && o().ui && o().ui.panel) || null
  const fabEl = () => (o() && o().ui && o().ui.fab) || null
  const countMarks = (pred) => (o() && o().marks ? o().marks.filter(pred).length : 0)

  // --- the steps ----------------------------------------------------------------------------------------------
  // target(): the element to spotlight (null = none). done(): true when the reader did it, false while waiting,
  // undefined when there is nothing to wait for (Next goes on). page: the file the step happens on.
  const steps = [
    { id: 'welcome', title: 'Welcome to subjexts', page: 'tutorial.html',
      html: '<p>subjexts is a layer on top of a published book: labels and comments in the margin, notes for the author, questions from students, and an AI tutor, all without changing the book\'s files.</p><p>This tour points at each part and waits for you to try it. You can close it any time and continue later from the tutorial page.</p>',
      done: () => undefined },
    { id: 'fab', title: 'The subjexts button',
      html: '<p>Every page has this button at the bottom right. It names the course section you are viewing (the tour set it to <b>yrS4 Demo (sec 101)</b>).</p><p><b>Click it</b> to open the panel.</p>',
      target: fabEl, done: () => !!(o() && o().ui.isOpen()) },
    { id: 'signin', title: 'Sign in',
      html: '<p>The panel is where you sign in, switch modes and read lists. <b>Sign in with GitHub</b> if you want to do more than look; otherwise press Next and the tour shows what every visitor sees.</p>',
      target: panelEl, done: () => (st() && st().signedIn ? true : false), optional: true },
    { id: 'join', title: 'Join the demo section (as a student)',
      html: '<p>Students join a section with a code from their instructor, in the panel\'s <b>gear</b> tab: enter <kbd>' + JOIN + '</kbd> and press Join. That lets you message the instructor, react and highlight.</p><p>Already staff of the section, or not signed in? Press Next.</p>',
      target: panelEl, done: () => (st() && (st().canTeach || !st().signedIn) ? undefined : false), optional: true },
    { id: 'lines', title: 'Marks are lines in the margin', page: '01-bits-and-bytes.html',
      html: '<p>The thin colored lines to the left of the text are the instructor\'s marks: what was covered in class, what to read on your own, key ideas. The text itself is never colored.</p><p>The <b>legend</b> under the title lists the labels on this page; "hide legend" hides it on every page.</p>',
      target: () => q('.yrS4-legend'), done: () => undefined },
    { id: 'hover', title: 'Hover a line', page: '01-bits-and-bytes.html',
      html: '<p><b>Move the mouse over a margin line</b> to see its label, who made it and when. Staff see buttons to remove it there too. A mark an AI made for you with the <code>yrS4 teach</code> command says "from the command line" (only you see that).</p>',
      target: () => q('.yrS4-bar'), done: () => (q('.yrS4-card') ? true : false) },
    { id: 'toc', title: 'The table of contents by label', page: TOC_PAGE,
      html: '<p>This page is drawn by subjexts: every labeled place in the book, under its label, with a link. Open a page (▸) to see the places on it, use the chips to jump by label, or print it as a study list.</p>',
      target: () => q('#yrS4-toc'), done: () => undefined },
    { id: 'student-tools', title: 'Select text: the reader\'s tools', page: '02-text.html',
      html: '<p><b>Select a few words</b> of the text, or right-click a paragraph. The menu offers a highlight, a private note, <b>Ask my instructor</b> (a message the section\'s staff answer in the panel), two reactions (😕 and 👍, which reach the instructor only as counts) and <b>✦ Ask</b> the tutor when the section has it on.</p><p>Try one, or press Next.</p>',
      target: () => q('.yrS4-menu:not([hidden])') || q('#sec-unicode'), done: () => (q('.yrS4-menu:not([hidden])') ? true : false), optional: true },
    // --- teaching ---
    { id: 'teach', title: 'Teach mode', page: '02-text.html', teach: true,
      html: '<p>Staff of a section have a <b>Teach</b> switch at the top of the panel\'s Page tab. <b>Turn it on.</b> Boxes appear beside every heading and block, and the Teach bar shows the sections and the class date the next mark counts for.</p>',
      target: panelEl, done: () => (st() && st().teach ? true : false) },
    { id: 'label', title: 'Label a block', page: '02-text.html', teach: true,
      html: '<p><b>Click the box</b> beside a paragraph (round) or a heading (square: the whole section). The menu opens beside it: click a label to apply it, or <b>Label this …</b> to find or make one. <kbd>Shift</kbd>+click or <kbd>Ctrl</kbd>+click several boxes to pick them, then one label row labels them all. <kbd>L</kbd> applies the current label to the block under the mouse. The same menu opens on a <b>right-click</b> or when you select text: the pills at the top say what the rows act on (this paragraph, the section, the page) and a faint tint shows it; the labels at hand come first (the ones you pinned, then your 7 most recently used; the number and the pins are set in the Labels tab, which the menu\'s last row opens), the rest of your labels follow in a list that scrolls, and ↑ ↓ Enter work on the open menu.</p>',
      target: () => q('.yrS4-box'), done: () => (q('.yrS4-menu:not([hidden])') ? true : false) },
    { id: 'hidden', title: 'Hide a passage from everyone', page: '04-files.html', teach: true,
      html: '<p>A label can <b>hide the passages it is applied to from students and visitors</b>, signed in or not, whatever the switches say. The demo\'s label <b>Hidden for everyone</b> hides the paragraph about binary files on this page: the section\'s teachers see it under a gray hatch with the tag "hidden from students and visitors"; <b>View as student</b> (Teach bar) shows the page without it.</p><p>Make such a label in the Labels tab (edit a label → "Hides its passages from students and visitors") or in the menu\'s <b>Label this …</b> → New label, then apply it like any label. The text stays in the book\'s files; the overlay only removes it from the page.</p>',
      target: () => q('.yrS4-hide-tag') || q('#sec-text-and-binary'), done: () => undefined },
    { id: 'comment', title: 'A comment for students', page: '02-text.html', teach: true,
      html: '<p><b>Select text</b>, or right-click a paragraph, and choose <b>Comment for students on this …</b> in the menu; the pills at the top of the menu widen it to the section or the page. The comment shows as an orange line; students read it on hover.</p>',
      target: () => q('.yrS4-menu:not([hidden])') || q('#sec-utf-8'), done: () => (q('.yrS4-menu:not([hidden])') ? true : false), optional: true },
    { id: 'note', title: 'An editorial note', page: '03-numbers.html', teach: true,
      html: '<p>An <b>🔒 Editorial note</b> is private: a note to yourself (or to the author) that something should change in the book\'s source. <b>Select text</b>, or <b>right-click</b> a block or a heading, and choose <b>Editorial note on this …</b> in the menu; give it a category and a priority.</p><p>The demo has two on this page already: with "Show my editorial notes on the page" on, each one is a purple dotted line in the margin and, by default, a <b>bubble beside the text</b> with the note and a tint over its passage. A bubble's × hides it, <b>Hide all bubbles</b> hides them all; the switch "… as bubbles beside the text" in the panel brings them back.</p>',
      target: () => q('.yrS4-menu:not([hidden])') || q('#sec-integers'), done: () => (q('.yrS4-menu:not([hidden])') ? true : false), optional: true },
    { id: 'edit', title: 'Edit text in place', page: '03-numbers.html', teach: true,
      html: '<p><b>Right-click a paragraph</b> (or any block, a code block too; on a heading choose <b>Edit this heading…</b>) and choose <b>Edit this text…</b>. A box replaces the block with its Markdown; change it and Save. Your version replaces the block on your screen only, with a dashed teal line, until the proposal is applied to the source.</p>',
      target: () => q('.yrS4-editbox') || q('#sec-floating-point'), done: () => (q('.yrS4-editbox') ? true : false), optional: true },
    { id: 'notes-tab', title: 'The Editorial notes tab', teach: true,
      html: '<p>Open <b>Editorial notes</b> in the panel: every note and in-place edit on this book, this page first. Each card links to its passage ("show on page" or "open page ↗"). <b>Export editorial notes (.md)</b> writes one Markdown packet; an AI applies it to the book\'s repository with the <code>subjexts-apply-notes</code> skill, editing at once when a note is clear and asking first when it is not.</p><p>As it works, each card shows where it is (queued, in progress, applied, asking). An applied note shows what the AI did, the files and the change, with <b>Accept</b> and <b>Redo…</b>; a question shows with an answer box. The demo has one of each on the Numbers chapter.</p>',
      target: panelEl, done: () => undefined },
    { id: 'messages', title: 'Messages from students', teach: true,
      html: '<p>Open <b>Messages</b>: the demo students\' questions, with the instructor\'s replies. Reply, resolve, or press <b>Make editorial note</b> on an "error in the book" so it goes into the next packet.</p>',
      target: panelEl, done: () => undefined },
    { id: 'activity', title: 'Class activity and history', teach: true,
      html: '<p>In the Teach bar, <b>Show class activity</b> shows the reaction counts on the page (two demo students pressed 😕 on the code-point paragraph). The <b>⏱ History</b> tab lists every label added or removed, with the time; students never see it.</p>',
      target: panelEl, done: () => undefined },
    { id: 'switches', title: 'What students see', teach: true,
      html: '<p><b>View as student</b> shows exactly what a student of the section sees. <b>Students see subjexts</b> (one switch per section, in the gear) turns the whole layer off for them without touching the book. <b>What students see</b> is one checkbox per feature per section: the button and panel, labels and lines, the table of contents by label (off by default), comments, Ask my instructor, reactions, highlights and notes, What we covered; "→ all" copies a section\'s choices to your other sections. Switch the button off and students see your lines and pages without being able to open subjexts. <b>subjexts for me</b> hides it from your own screen, leaving a dot to bring it back; <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> does the same on a fresh browser.</p>',
      target: panelEl, done: () => undefined },
    { id: 'end', title: 'That is subjexts', page: 'tutorial.html',
      html: '<p>You have seen the layer: lines and labels, the table of contents by label, the reader\'s tools, teaching, editorial notes and the packet, messages, activity, history, and the switches.</p><p>Next: plug in a book of your own (the <code>subjexts-plug-in-book</code> skill in the yrS4 repository), or reset this demo and try again.</p>',
      done: () => undefined },
  ]

  // --- the tour -------------------------------------------------------------------------------------------------
  let dim, hole, card, timer, i = 0, baseline = null
  const active = () => steps.filter((s) => true)
  function ensureUi() {
    if (card) return
    dim = document.createElement('div'); dim.className = 'yrS4-tut-dim'; dim.setAttribute('data-yrs4', '')
    hole = document.createElement('div'); hole.className = 'yrS4-tut-hole'; dim.appendChild(hole)
    card = document.createElement('div'); card.className = 'yrS4-tut-card'; card.setAttribute('data-yrs4', ''); card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'subjexts tutorial')
    document.body.appendChild(dim); document.body.appendChild(card)
  }
  function teardown() {
    clearInterval(timer); timer = null
    if (dim) dim.remove(); if (card) card.remove(); dim = hole = card = null
  }
  function stop() { teardown(); save(null); wireStart() }
  function go(n) { i = Math.max(0, Math.min(steps.length - 1, n)); baseline = null; save({ step: i, at: Date.now() }); render() }
  function render() {
    ensureUi()
    const s = steps[i]
    const state = st()
    const onPage = !s.page || here() === s.page
    const teachNeeded = s.teach && !(state && state.canTeach)
    const d = onPage && !teachNeeded ? s.done() : undefined
    const parts = []
    parts.push('<div class="step">Step ' + (i + 1) + ' of ' + steps.length + (s.teach ? ' · teaching' : '') + '</div>')
    parts.push('<h3>' + s.title + '</h3>')
    parts.push(s.html)
    if (!onPage) parts.push('<p><a class="go" href="' + s.page + location.search + '">Go to the page for this step →</a></p>')
    else if (teachNeeded) parts.push('<p class="wait">This step needs teacher access to the demo section (ask Prof. Rosenthal). Read it and press Next.</p>')
    else if (d === true) parts.push('<p class="done">✓ Done. Press Next.</p>')
    else if (d === false) parts.push('<p class="wait">Waiting for you to try it' + (s.optional ? ', or press Next' : '') + '…</p>')
    parts.push('<div class="acts">' +
      (i > 0 ? '<button type="button" data-act="back">Back</button>' : '') +
      (i < steps.length - 1 ? '<button type="button" class="primary" data-act="next">Next</button>' : '<button type="button" class="primary" data-act="finish">Finish</button>') +
      '<button type="button" class="link" data-act="close">Close the tour</button></div>')
    card.innerHTML = parts.join('')
    card.querySelectorAll('button[data-act]').forEach((b) => b.addEventListener('click', () => {
      const a = b.getAttribute('data-act')
      if (a === 'back') go(i - 1)
      else if (a === 'next') go(i + 1)
      else if (a === 'finish' || a === 'close') stop()
    }))
    spotlight(onPage && !teachNeeded && s.target ? s.target() : null)
    clearInterval(timer)
    timer = setInterval(tick, 400)
  }
  function tick() {
    const s = steps[i]
    const state = st()
    const onPage = !s.page || here() === s.page
    if (!onPage || (s.teach && !(state && state.canTeach))) return
    spotlight(s.target ? s.target() : null)
    const d = s.done()
    const shown = card.querySelector('.done, .wait')
    if (d === true && !(shown && shown.className === 'done')) render()
  }
  function spotlight(el) {
    if (!dim) return
    if (!el || !el.getBoundingClientRect) { hole.style.display = 'none'; dim.classList.add('nohole'); return }
    const r = el.getBoundingClientRect()
    if (!r.width && !r.height) { hole.style.display = 'none'; dim.classList.add('nohole'); return }
    dim.classList.remove('nohole'); hole.style.display = ''
    const pad = 6
    hole.style.top = (r.top - pad) + 'px'; hole.style.left = (r.left - pad) + 'px'
    hole.style.width = (r.width + 2 * pad) + 'px'; hole.style.height = (r.height + 2 * pad) + 'px'
  }

  // --- starting and resuming --------------------------------------------------------------------------------------
  function waitOverlay(ms) {
    return new Promise((resolve) => {
      const t0 = Date.now()
      const poll = () => { if (st()) resolve(true); else if (Date.now() - t0 > ms) resolve(false); else setTimeout(poll, 250) }
      poll()
    })
  }
  function ensureSection() {
    // the page script reads ?section= at boot and remembers it; the tour wants the demo section
    const p = new URLSearchParams(location.search)
    if (p.get('section') === SECTION) return false
    p.set('section', SECTION)
    save({ step: 0, at: Date.now(), starting: true })
    location.replace(location.pathname + '?' + p.toString() + location.hash)
    return true
  }
  async function start(at) {
    if (ensureSection()) return
    const ok = await waitOverlay(15000)
    if (!ok) { note('subjexts has not loaded on this page. Reload it, or press Ctrl+Shift+S, then start again.'); return }
    go(at || 0)
  }
  function note(text) {
    const box = q('#yrS4-tutorial-start')
    if (!box) return alert(text)
    let n = box.querySelector('.yrS4-tut-note')
    if (!n) { n = document.createElement('p'); n.className = 'yrS4-tut-note text-danger'; box.appendChild(n) }
    n.textContent = text
  }
  function wireStart() {
    const box = q('#yrS4-tutorial-start')
    if (!box) return
    const saved = load()
    const resume = box.querySelector('[data-yrs4-tutorial="resume"]')
    const reset = box.querySelector('[data-yrs4-tutorial="reset"]')
    const startBtn = box.querySelector('[data-yrs4-tutorial="start"]')
    const has = saved && typeof saved.step === 'number' && saved.step > 0
    if (resume) { resume.hidden = !has; resume.onclick = () => start(saved.step) }
    if (reset) { reset.hidden = !has; reset.onclick = () => { save(null); start(0) } }
    if (startBtn) { startBtn.textContent = has ? 'Start from the beginning' : 'Start the tutorial'; startBtn.onclick = () => start(0) }
  }
  async function boot() {
    wireStart()
    const saved = load()
    if (!saved) return
    if (saved.starting) { save({ step: saved.step || 0, at: Date.now() }); start(saved.step || 0); return }
    // the tour is in progress: show the current step on this page once the page script is up
    if (await waitOverlay(15000)) { i = saved.step || 0; render() }
  }
  window.yrS4Tutorial = { start, stop, go, steps }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()

/* The Bank of Pixel City's pages. Reads the Bank (inside the Exchange's simulation), the census and working lives. Display only. */
(function () {
  const U = window.PixelUniverse || {};
  const B = U.bank, K = U.census, L = U.labour, W = U.climate;
  const DAY = 86400000;
  const main = document.getElementById('main');
  const q = new URLSearchParams(location.search);
  const at = q.get('at'), parsed = at ? Date.parse(at.length <= 16 ? at + ':00Z' : at) : NaN;
  const offset = isNaN(parsed) ? 0 : parsed - Date.now();
  const now = () => Date.now() + offset;
  const AT = isNaN(parsed) ? '' : '?at=' + encodeURIComponent(at);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (n) => Math.round(n).toLocaleString('en');
  const watts = (n) => num(n) + '\u00a0W';
  const mw = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + '\u00a0million W' : watts(n));
  const pct = (n) => n.toFixed(2).replace(/0$/, '').replace(/\.0$/, '') + '%';
  const cityMs = (ms) => ms + (W && W.offsetAt ? W.offsetAt(ms) : 0);
  const fDate = new Intl.DateTimeFormat('en-NZ', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const fShort = new Intl.DateTimeFormat('en-NZ', { timeZone: 'UTC', day: 'numeric', month: 'short' });
  const day = (s) => fShort.format(Date.parse(s + 'T12:00:00Z'));
  const head = (title, lede, kicker) => '<section class="page-head">' + (kicker ? '<p class="kicker">' + kicker + '</p>' : '') + '<h1>' + title + '</h1>' + (lede ? '<p class="lede">' + lede + '</p>' : '') + '</section>';
  const fact = (k, v, small) => '<div><dt>' + k + '</dt><dd>' + v + (small ? ' <small>' + small + '</small>' : '') + '</dd></div>';
  const td = (v, n, cls) => '<td class="' + (n ? 'n ' : '') + (cls || '') + '">' + v + '</td>';
  const table = (cols, rows) => '<div class="table-wrap"><table class="data"><thead><tr>' + cols.map((c) => '<th' + (c.n ? ' class="n"' : '') + '>' + c.l + '</th>').join('') + '</tr></thead><tbody>' + (rows.length ? rows.join('') : '<tr><td class="muted" colspan="' + cols.length + '">Nothing yet.</td></tr>') + '</tbody></table></div>';
  const news = (list) => '<ul class="timeline">' + (list.length ? list.map((e) => '<li><time>' + esc(fShort.format(Date.parse(e.time) - 1)) + '</time><span>' + esc(e.headline) + '</span></li>').join('') : '<li class="muted">A quiet stretch.</li>') + '</ul>';
  const SECTOR = { shop: 'Shops', office: 'Offices', factory: 'Industry', warehouse: 'Caches and haulage', port: 'Export buffer' };
  function chart(points, label, base) {
    if (points.length < 2) return '';
    const w = 640, h = 150, vals = points.map((p) => p[1]), lo = Math.min(0, ...vals), hi = Math.max(base * 1.5, ...vals) * 1.05;
    const x = (i) => (i / (points.length - 1)) * (w - 8) + 4, y = (v) => h - 6 - ((v - lo) / (hi - lo)) * (h - 12);
    let d = ''; points.forEach((p, i) => { d += (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p[1]).toFixed(1); });
    return '<figure class="chart"><svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label) + '" preserveAspectRatio="none"><line x1="0" x2="' + w + '" y1="' + y(base) + '" y2="' + y(base) + '" class="base"/><path d="' + d + '"/></svg>' +
      '<figcaption><span>' + esc(day(points[0][0])) + '</span><span>' + esc(label) + '</span><span>' + esc(day(points[points.length - 1][0])) + '</span></figcaption></figure>';
  }
  const closed = () => head('The Bank of Pixel City opens on 1 February 2027', 'From its opening, the Bank sets the city\u2019s interest rate, lends to businesses and to pixels buying homes, and writes off what it can\u2019t get back. Until then, businesses get by on the simple credit lines they have always had.');

  const V = {};
  V.home = {
    render() {
      const t = now(), b = B.stateAt(t);
      if (!b.open) return closed();
      const mood = b.appetite >= 90 ? 'lending freely' : b.appetite >= 60 ? 'lending carefully' : b.appetite >= 30 ? 'lending reluctantly' : 'all but closed to new borrowers';
      const wk = B.stateAt(t - 30 * DAY), was = wk.open ? wk : b;
      const row = (k, v, note, cls) => '<tr><td><b>' + k + '</b></td><td class="n' + (cls ? ' ' + cls : '') + '">' + v + '</td><td class="note">' + note + '</td></tr>';
      const board = [
        row('The Bank\u2019s rate', pct(b.rate), b.rate > was.rate ? 'Up from ' + pct(was.rate) + ' a month ago' : b.rate < was.rate ? 'Down from ' + pct(was.rate) + ' a month ago' : 'Unchanged this month', 'gold'),
        row('Capital', b.capitalRatio.toFixed(1) + '%', 'Of everything it has lent. Below 6%, it stops lending', b.capitalRatio < 8 ? 'warn' : ''),
        row('Appetite to lend', b.appetite.toFixed(0), 'Sets every overdraft limit and start-up loan', b.appetite < 60 ? 'warn' : ''),
        row('Home loans', mw(b.mortgages), b.arrears.toFixed(1) + '% in arrears', b.arrears > 4 ? 'warn' : ''),
        row('Business overdrafts', mw(b.overdrafts), num(b.borrowerCount) + ' businesses borrowing'),
        row('Start-up loans', mw(b.startup), 'Lent to businesses opening in empty premises'),
        row('Deposits', mw(b.deposits), 'Pixels save more when they\u2019re nervous'),
        (() => { const u = L && L.universityAt ? L.universityAt(t) : null; return u && u.open ? row('Student loans', mw(u.loanBook), num(u.loans) + ' pixels repaying Pixel University fees') : ''; })()].join('');
      const hist = B.historyBetween(t - 365 * DAY, t);
      return '<section class="page-head"><p class="kicker">The Bank of Pixel City at the close of ' + esc(fDate.format(cityMs(Date.parse(b.asOf)))) + '.</p><h1 class="status">The Bank is ' + mood + ', at ' + pct(b.rate) + '.</h1></section>' +
        '<figure class="screen board freight"><table><thead><tr><th>The vault</th><th class="n">Now</th><th></th></tr></thead><tbody>' + board + '</tbody></table>' +
        '<figcaption class="screen-bar"><span>The rate is set on the 1st of each month, from the shopping basket and business confidence.</span><span>Written off yesterday: ' + watts(b.writtenOff) + '</span></figcaption></figure>' +
        '<div class="two-col"><section><h2>The rate</h2>' + chart(hist.map((d) => [d.date, d.rate]), 'The Bank\u2019s rate, %', 4) + '<h2>Capital</h2>' + chart(hist.map((d) => [d.date, d.capitalRatio]), 'Capital, % of lending', 8) + '</section>' +
        '<section><h2>From the Bank</h2>' + news(B.eventsBetween(t - 90 * DAY, t).filter((e) => e.importance >= 2).reverse().slice(0, 16)) + '</section></div>';
    }
  };
  V.business = {
    title: 'Business lending',
    render() {
      const t = now(), b = B.stateAt(t);
      if (!b.open) return closed();
      const risk = b.sectors.map((x) => '<tr>' + td(SECTOR[x.sector]) + td(x.risk.toFixed(1) + '%', 1, x.risk > 15 ? 'warn' : '') + td(x.risk > 30 ? 'The Bank is wary of the whole trade' : x.risk > 10 ? 'Recent bad debts' : 'Business as usual') + '</tr>');
      const rows = b.borrowers.map((x) => '<tr>' + td('<a href="https://dvexperiments.github.io/Exchange/' + AT + '#/business/' + esc(x.premises) + '">' + esc(x.name) + '</a>') + td(esc(x.district)) + td(watts(x.overdraft), 1) + td(watts(x.limit), 1) + td(x.use.toFixed(0) + '%', 1, x.use > 80 ? 'warn' : '') + td(x.loan ? watts(x.loan) : '\u2013', 1) + '</tr>');
      return head('Business lending', 'Every business can run an overdraft up to a limit the Bank sets each day from its record: its margins, how long it has traded, the quality of its work, and how the Bank feels about its trade. A business that goes past its limit closes, and the Bank writes off what it can\u2019t recover.') +
        '<dl class="facts">' + fact('Borrowing', num(b.borrowerCount), 'businesses') + fact('Overdrafts', mw(b.overdrafts)) + fact('Start-up loans', mw(b.startup)) + fact('Appetite', b.appetite.toFixed(0)) + '</dl>' +
        '<h2>How the Bank sees each trade</h2>' + table([{ l: 'Trade' }, { l: 'Risk marked up', n: 1 }, { l: '' }], risk) +
        '<h2>The biggest borrowers</h2>' + table([{ l: 'Business' }, { l: 'District' }, { l: 'Overdraft', n: 1 }, { l: 'Limit', n: 1 }, { l: 'Used', n: 1 }, { l: 'Start-up loan', n: 1 }], rows) +
        '<h2>Bad debts</h2>' + news(B.eventsBetween(t - 120 * DAY, t).filter((e) => e.type === 'bank.default').reverse().slice(0, 20));
    }
  };
  // applicants for home loans: real residents, decided as the Bank would on the day (for display; the Bank lends by district)
  function applicants(t, b) {
    if (!K || !L) return [];
    const dayIdx = Math.floor(t / DAY), out = [];
    for (let j = 0; j < 8; j++) {
      const d = (dayIdx * 7 + j * 5) % 16, list = K.residentsOf(d, t, (dayIdx * 37 + j * 101) % 3000, 1) || [];
      const p = list[0]; if (!p) continue;
      const id = p.id || p, c = K.character(id); if (!c) continue;
      const job = L.jobOf ? L.jobOf(id, t) : null, district = b.districts[d];
      const u = ((dayIdx * 2654435761 + j * 40503) >>> 0) / 4294967296;
      let verdict, why;
      if (!job || job.status !== 'employed') { verdict = false; why = 'no steady income'; }
      else if (district.arrears > 6 && u > 0.4) { verdict = false; why = 'too many arrears in ' + district.name + ' just now'; }
      else if (u > b.appetite / 100) { verdict = false; why = 'the Bank is lending carefully'; }
      else { verdict = true; why = job.title ? 'a ' + job.title + ' at ' + job.employerName : 'in work'; }
      out.push({ id, name: c.name, district: district.name, verdict, why });
    }
    return out;
  }
  V.homes = {
    title: 'Home loans',
    render() {
      const t = now(), b = B.stateAt(t);
      if (!b.open) return closed();
      const rows = b.districts.slice().sort((x, y) => y.arrears - x.arrears).map((d) => '<tr>' + td(esc(d.name)) + td(mw(d.mortgages), 1) + td(d.arrears.toFixed(1) + '%', 1, d.arrears > 4 ? 'warn' : '') + '</tr>');
      const apps = applicants(t, b).map((a) => '<tr>' + td('<a href="https://dvexperiments.github.io/City/census.html' + AT + '#/resident/' + esc(a.id) + '">' + esc(a.name) + '</a>') + td(esc(a.district)) + td(a.verdict ? '<span class="approved">Approved</span>' : '<span class="declined">Declined</span>') + td(esc(a.why)) + '</tr>');
      return head('Home loans', 'Pixels borrow to buy their homes, district by district. How much the Bank lends follows business confidence, how many jobs a district has kept and the rate. Where jobs go, arrears follow, and the Bank sells the homes it can\u2019t be repaid on.') +
        '<dl class="facts">' + fact('Home loans', mw(b.mortgages)) + fact('Lent yesterday', mw(b.newMortgages)) + fact('In arrears', b.arrears.toFixed(1) + '%') + fact('The rate for homes', pct(b.rate + 1.8)) + '</dl>' +
        '<div class="two-col"><section><h2>By district</h2>' + table([{ l: 'District' }, { l: 'Lent', n: 1 }, { l: 'In arrears', n: 1 }], rows) + '</section>' +
        '<section><h2>At the counter today</h2><p class="muted">Some of the pixels who asked for a home loan, and what they were told.</p>' + table([{ l: 'Applicant' }, { l: 'District' }, { l: '' }, { l: '' }], apps) + '</section></div>';
    }
  };
  V.about = {
    title: 'About',
    render() {
      return head('About the Bank', 'Lending to Pixel City since 1 February 2027.') + '<div class="prose">' +
        '<p>The Bank of Pixel City sets the city\u2019s interest rate on the 1st of each month. When prices in the shops rise it raises the rate; when the city is nervous it cuts. When both happen at once, as they do when power is dear, it has to choose.</p>' +
        '<p>Every business can borrow on overdraft, up to a limit the Bank sets from its record and its own appetite. New businesses borrow most of the money they need to open. Pixels borrow to buy homes. A dear rate makes everything cost more, and cools spending in the shops.</p>' +
        '<p>When a borrower fails, the Bank writes off what it can\u2019t recover. Its capital shrinks, it grows wary of the failed business\u2019s whole trade, and it lends less to everyone, which can push the next business over. Below 6% capital, it all but stops lending, and empty premises stay empty longer.</p>' +
        '<p>The Bank\u2019s books are kept by the Pixel Exchange, in the same daily run as every business in the city, and computed in your browser from the date.</p></div>';
    }
  };

  const ROUTES = { '': 'home', business: 'business', homes: 'homes', about: 'about' };
  function render() {
    if (!B || !B.ready()) { main.innerHTML = head('The vault is closed', 'The Bank needs the Weather Bureau, the Senate, the city, the Census Office, the Exchange and Society, and one of them could not be reached. Please try again shortly.'); return; }
    const h = location.hash.replace(/^#\/?/, ''), cut = h.indexOf('/'), name = cut < 0 ? h : h.slice(0, cut);
    const key = ROUTES[name] || 'home', view = V[key];
    main.innerHTML = view.render();
    document.title = (view.title ? view.title + ' \u2013 ' : '') + 'The Bank of Pixel City';
    document.querySelectorAll('.nav a').forEach((a) => (a.dataset.view === key ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    window.scrollTo(0, 0);
  }
  if (AT) { const b = document.getElementById('travel'); b.hidden = false; b.innerHTML = 'Watching the Bank at ' + esc(at) + '. <a href="' + location.pathname + location.hash + '">Return to the present</a>.'; }
  window.addEventListener('hashchange', render);
  render();
})();

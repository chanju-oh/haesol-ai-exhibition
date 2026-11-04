/* ES5 public reader: works when modern modules or the external SDK cannot load. */
(function () {
  'use strict';
  var root, rows = [], active = false, departments = ['프로젝트 수업 연구', '비교과 활용 모델 개발'];
  var school = 'https://bg-haesol-m.goesh.kr/bg-haesol-m/main.do';
  var ebook = 'https://heyzine.com/flip-book/8b7671a1fa.html';
  var projectFolder = 'https://drive.google.com/drive/folders/1HevfFhaPTxGPc16h6hgNKn8JmQp1CB4z';
  var extraFolder = 'https://drive.google.com/drive/folders/1bpU1kIhqhCAmmEVc3bz9RvbS50zApXF5';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function label(d) { return d === departments[0] ? '교과 프로젝트 사례' : '비교과 활용 사례'; }
  function href(hash, text, cls) { return '<a class="' + (cls || '') + '" href="' + esc(hash) + '">' + esc(text) + '</a>'; }
  function external(url, text) { return '<a target="_blank" rel="noopener" href="' + esc(url) + '">' + esc(text) + ' ↗</a>'; }
  function frame(url, title) { return '<iframe title="' + esc(title) + '" src="' + esc(url) + '" allowfullscreen style="display:block;width:100%;height:78vh;min-height:440px;border:0;background:#eef4ff"></iframe>'; }
  function drive(url) { var m = /^https:\/\/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)\/(?:view|preview)/.exec(url || ''); return m ? 'https://drive.google.com/file/d/' + m[1] : null; }
  function title(r) { return (r.subject ? '[' + r.subject + '] ' : '') + (r.grade ? r.grade + ' · ' : '') + r.title; }
  function shell(content) {
    root.innerHTML = '<header><a class="brand brand-home" href="#home"><img class="school-emblem" src="./school-emblem.png" alt="배곧해솔중학교 교표"><div>배곧해솔중학교<small>AI 서·논술형 평가 사례집</small></div></a><nav aria-label="사례집 메뉴">' + href('#intro', '연구 소개') + href('#collection=' + encodeURIComponent(departments[0]), label(departments[0])) + href('#collection=' + encodeURIComponent(departments[1]), label(departments[1])) + href('#ebook', '연구 이야기 E북') + '</nav></header><div class="school-link-bar">' + external(school, '배곧해솔중학교 홈페이지') + '</div><main>' + content + '</main><footer class="footer"><span style="color:#c3cbd6;font-size:10px;line-height:1.9">배곧해솔중학교 교육연구부<br>Website designed &amp; developed by Oh Chanjoo</span>' + href('#admin','관리자') + '</footer>';
  }
  function originals() { return '<div class="actions">' + external(projectFolder, '교과 사례 Drive 폴더') + external(extraFolder, '비교과 사례 Drive 폴더') + external(ebook, '연구 이야기 E북') + '</div>'; }
  function order(a, b) { return String(a.description).slice(0,4).localeCompare(String(b.description).slice(0,4),'ko') || String(a.subject).localeCompare(String(b.subject),'ko') || String(a.grade).localeCompare(String(b.grade),'ko') || String(a.title).localeCompare(String(b.title),'ko'); }
  function collection(d) {
    shell(href('#home', '← 사례집 홈', 'back') + '<h2>' + label(d) + '</h2><div class="search-row"><input id="compatSearch" type="search" aria-label="자료 제목 교과 학년 검색" placeholder="자료 제목·교과·학년 검색"></div><div id="compatBooks" class="book-grid project-grid"></div>');
    var input = document.getElementById('compatSearch');
    function update() {
      var query = input.value.toLowerCase();
      var list = rows.filter(function(r) { return r.department === d && (r.title + ' ' + r.subject + ' ' + r.grade).toLowerCase().indexOf(query) !== -1; }).sort(order);
      document.getElementById('compatBooks').innerHTML = list.length ? list.map(function(r) { return '<article class="document project-document"><div class="cover"><span>' + esc((r.subject ? '[' + r.subject + '] ' : '') + (r.grade || '')) + '</span><strong>' + esc(r.title) + '</strong></div><span class="tag">' + esc(r.material_status) + '</span>' + href('#doc=' + encodeURIComponent(r.id), '책자 열람 ↗', 'primary') + '</article>'; }).join('') : '<p>표시할 자료가 없습니다.</p>';
    }
    input.oninput = update; input.onkeyup = update; update();
  }
  function route() {
    if (!active) return;
    var hash = location.hash, id, r, url, d;
    try {
      if (hash.indexOf('#collection=') === 0) { d = decodeURIComponent(hash.slice(12)); if (departments.indexOf(d) !== -1) { collection(d); return; } }
      if (hash.indexOf('#doc=') === 0) {
        id = decodeURIComponent(hash.slice(5)); r = rows.filter(function(x) { return x.id === id; })[0];
        if (!r) { shell('<h2>자료를 찾을 수 없습니다.</h2><p>공개 여부 또는 자료 주소를 확인해 주세요.</p>' + href('#home','사례집 홈')); return; }
        url = drive(r.drive_url);
        shell(href('#collection=' + encodeURIComponent(r.department), '← ' + label(r.department) + ' 자료 목록', 'back') + '<div class="viewer-heading"><div class="viewer-heading-text"><h2>' + esc(title(r)) + '</h2></div><div class="viewer-top-actions">' + (url ? external(url + '/view', '원본 열기') : '') + href('#doc=' + r.id, '다시 불러오기') + '</div></div>' + (url ? frame(url + '/preview', title(r)) + '<p class="muted">문서가 표시되지 않으면 상단의 원본 열기를 눌러 주세요.</p>' : '<p>이 자료는 최신 Chrome에서 열어 주세요.</p>'));
        return;
      }
      if (hash === '#ebook') { shell('<div class="viewer-heading"><h2>연구 이야기 E북</h2>' + external(ebook,'E북 크게 읽기') + '</div>' + frame(ebook, '연구 이야기 E북')); return; }
      if (hash === '#intro') { shell('<h2>연구 소개</h2><p>「가능성을 표준으로」 A.C.T.U.A.L. 사이클 기반 AI 서·논술형 평가의 학교 실행 모델 연구</p><img src="./research-overview.png" alt="배곧해솔중학교 연구개요" style="max-width:100%;height:auto">'); return; }
      if (hash === '#admin') { shell('<h2>관리자 화면</h2><p>자료 관리는 최신 Chrome 또는 Edge에서 이용해 주세요.</p>' + href('#home','사례집 홈')); return; }
      shell('<div class="hero"><div><div class="eyebrow">2026 RESEARCH OPEN HOUSE</div><h1>가능성을 표준으로.<br><em>평가의 다음을<br>함께 열다.</em></h1><p>A.C.T.U.A.L. 사이클 기반<br>AI 서·논술형 평가의 학교 실행 모델 연구</p></div><div><div class="video" style="position:relative;height:0;min-height:0;padding-top:56.25%"><iframe title="배곧해솔중학교 홍보영상" src="https://www.youtube-nocookie.com/embed/b5DcTsX85tA?rel=0" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"></iframe></div><div style="text-align:right;font-size:11px;margin-top:8px"><a href="https://youtu.be/b5DcTsX85tA" target="_blank" rel="noopener">YouTube에서 보기 ↗</a></div></div></div><div class="event"><span>공개보고회</span><strong>2026. 11. 04. · 15:00—17:00</strong><span>배곧해솔중학교 1층 시청각실</span></div><div class="section-head"><h2>소개에서 실천으로, 함께 쌓는 연구</h2></div><div class="departments">' + href('#intro','연구 소개','dept') + href('#collection=' + encodeURIComponent(departments[0]),label(departments[0]),'dept') + href('#collection=' + encodeURIComponent(departments[1]),label(departments[1]),'dept') + href('#ebook','연구 이야기 E북','dept') + '</div>');
    } catch (error) { shell('<h2>자료를 열지 못했습니다.</h2>' + originals()); }
    window.scrollTo(0,0);
  }
  function start() {
    if (active || window.EXHIBITION_READY) return;
    active = true; window.EXHIBITION_FALLBACK_ACTIVE = true; root = document.getElementById('hs-air');
    if (!root) return;
    shell('<h2>자료 목록을 연결하고 있습니다.</h2><p>연결이 오래 걸리면 아래 원본 폴더에서 바로 열람할 수 있습니다.</p>' + originals());
    var config = window.EXHIBITION_CONFIG || {}, xhr = new XMLHttpRequest(), finished = false;
    function fail() { if (finished) return; finished = true; shell('<h2>자료 연결을 확인해 주세요.</h2><p>이 기기에서 자료 서버에 연결하지 못했습니다. 아래 Drive 폴더 또는 E북을 직접 열어 주세요.</p>' + originals()); }
    xhr.open('GET', config.supabaseUrl + '/rest/v1/materials?select=id,title,department,description,subject,grade,material_status,published,source_type,drive_url&published=eq.true', true);
    xhr.setRequestHeader('apikey', config.supabasePublishableKey); xhr.timeout = 12000;
    xhr.onload = function () { if (finished) return; if (xhr.status < 200 || xhr.status >= 300) { fail(); return; } try { var result = JSON.parse(xhr.responseText); if (!Array.isArray(result)) { fail(); return; } rows = result.filter(function(r) { return r.published === true && departments.indexOf(r.department) !== -1 && !/^\[(PDF 비교용|검증용)\]/.test(r.title); }); finished = true; route(); } catch (e) { fail(); } };
    xhr.onerror = fail; xhr.ontimeout = fail; xhr.send();
    window.addEventListener('hashchange', route);
    root.onclick = function(e) { var t = e.target; while(t && t !== root) { if(t.tagName === 'A' && t.getAttribute('href') === location.hash) { e.preventDefault(); route(); return; } t = t.parentNode; } };
  }
  window.EXHIBITION_START_COMPAT = start;
  if (/[?&]compat=1(?:&|$)/.test(location.search)) start(); else window.setTimeout(start, 8000);
}());

window.addEventListener('DOMContentLoaded', function() {
  const UPCOMING_STORAGE_KEY = 'etw-upcoming-trip-ideas-v1';
  const CHECKLIST_STORAGE_KEY = 'etw-checklist-state-v1';
  const TRIP_SYNC_CONFIG = window.ETW_TRIP_SYNC || {};
  const CHECKLIST_SYNC_CONFIG = window.ETW_CHECKLIST_SYNC || {};
  const PREFECTURES = [
    'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
    'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
    'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu',
    'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara',
    'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
    'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki',
    'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'
  ];
  const PREFECTURE_SEEDS = {
    Hokkaido: [
      { title: '札幌で夜景と市場をはしご', description: '大通公園、場外市場、すすきのをゆるく回る王道コース。' },
      { title: '小樽で運河とスイーツ散歩', description: 'レトロな街並みと海鮮、甘いものをまとめて楽しむ旅。' }
    ],
    Aomori: [
      { title: 'ねぶたの熱気を感じる街歩き', description: '青森駅周辺から文化施設まで、祭りの空気を楽しむコース。' },
      { title: 'りんごと海の景色を味わう', description: '市場と海沿いドライブで、青森らしさをぎゅっと体験。' }
    ],
    Ishikawa: [
      { title: '金沢で庭園と市場を満喫', description: '兼六園、近江町市場、ひがし茶屋街を一日で楽しむ。' },
      { title: '能登で海と温泉をのんびり巡る', description: '景色を楽しみながら、静かな時間を過ごす旅。' }
    ],
    Kyoto: [
      { title: '朝の寺社で静かな時間を過ごす', description: '混雑前に寺社と庭園を回る、落ち着いた京都旅。' },
      { title: '路地裏カフェと和菓子巡り', description: '散歩しながら、甘味と季節の景色を楽しむ。' }
    ],
    Osaka: [
      { title: '食べ歩きと商店街さんぽ', description: 'たこ焼き、お好み焼き、粉ものを中心に気軽に回る。' },
      { title: 'ベイエリアで夜景を楽しむ', description: '海沿いの散歩と夜の街明かりを組み合わせるコース。' }
    ],
    Hiroshima: [
      { title: '宮島で海辺の神社と食べ歩き', description: 'フェリーで渡って、景色と名物をゆっくり味わう。' },
      { title: '平和記念公園から街へ歩く', description: '学びと街歩きをつなげた、穏やかな観光プラン。' }
    ],
    Fukuoka: [
      { title: '屋台と中洲の夜を楽しむ', description: '街の活気を感じながら、食べ歩きを中心に満喫。' },
      { title: '太宰府とカフェ巡り', description: '参道の散策と甘いものを組み合わせた日帰り旅。' }
    ],
    Kumamoto: [
      { title: '城下町を歩いて歴史を感じる', description: '熊本城周辺と街のグルメをあわせて楽しむ。' },
      { title: '阿蘇の大地を眺めるドライブ', description: '景色のいい道を走って、自然をメインに過ごす。' }
    ],
    Okinawa: [
      { title: '海沿いでゆるい島時間を過ごす', description: '青い海とカフェを組み合わせた、のんびりプラン。' },
      { title: '那覇で市場とローカルグルメ巡り', description: '観光と食をバランスよく楽しめる定番コース。' }
    ]
  };

  // -----------------------------
  // スプラッシュアニメーション
  // -----------------------------
  setTimeout(function() {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.style.display = 'none', 1000);
    }
  }, 1800);

  // -----------------------------
  // ハンバーガーメニューの開閉
  // -----------------------------
  const menuBtn = document.getElementById('menuBtn');
  const sidebarDrawer = document.getElementById('sidebarDrawer');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (menuBtn && sidebarDrawer && sidebarOverlay) {
    menuBtn.onclick = () => {
      sidebarDrawer.classList.toggle('open');
      sidebarOverlay.classList.toggle('open');
    };

    sidebarOverlay.onclick = () => {
      sidebarDrawer.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    };
  }

  // -----------------------------
  // トグルリスト（アコーディオン）
  // -----------------------------
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.onclick = function(e) {
      e.stopPropagation();
      const parent = btn.parentElement;
      parent.classList.toggle('open');
    };
  });

  // -----------------------------
  // 最新記事表示（本文から概要取得）
  // -----------------------------
  const links = document.querySelectorAll('#sidebarDrawer .toggle-list ul li a');
  let latest = null;
  let latestDate = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  links.forEach(link => {
    const href = link.getAttribute('href');
    const match = href && href.match(/(\d{2})-(\d{8})\.html$/);

    if (match) {
      const rawDate = match[2];
      const dd = rawDate.slice(0, 2);
      const mm = rawDate.slice(2, 4);
      const yyyy = rawDate.slice(4, 8);
      const dateObj = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);

      if (dateObj > today) return;

      if (!latestDate || dateObj > latestDate) {
        latestDate = dateObj;
        latest = link;
      }
    }
  });

  if (latest) {
    const url = latest.getAttribute('href');
    const container = document.getElementById('latest-container') || document.getElementById('latest-link');

    if (container) {
      fetch(url)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const summarySection = doc.querySelector('#summary');
          const content = summarySection ? summarySection.innerHTML : '<p>Summary not found.</p>';

          container.innerHTML = `
            <article>
              <h3><a href="${url}">${latest.textContent}</a></h3>
              ${content}
            </article>
          `;
        })
        .catch(err => {
          console.error('Failed to load summary:', err);
          const title = latest ? latest.textContent : '記事タイトル不明';
          const link = latest ? latest.getAttribute('href') : '#';
          container.innerHTML = `
            <article>
              <h3><a href="${link}">${title}</a></h3>
              <p>Summary could not be loaded.</p>
            </article>
          `;
        });
    }
  }

  function normalizePrefectureName(value) {
    return String(value || '')
      .replace(/prefecture$/i, '')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/(^|\s|-)[a-z]/g, match => match.toUpperCase())
      .replace(/^./, char => char.toUpperCase());
  }

  function getPrefecturePageName() {
    const prefectureLink = document.querySelector('main h2 a[href*="wikipedia.org"]');
    if (!prefectureLink) {
      return null;
    }

    return normalizePrefectureName(prefectureLink.textContent || prefectureLink.innerText || '');
  }

  function buildFallbackIdeas(prefecture) {
    const label = prefecture || 'その都道府県';
    return [
      {
        title: `${label}の朝市を歩く`,
        description: '地元の空気とご当地の食べ物を、朝のうちにゆっくり楽しむコース。'
      },
      {
        title: `${label}の温泉と散歩を組み合わせる`,
        description: '移動を少なめにして、景色とリラックスを優先するプラン。'
      },
      {
        title: `${label}でローカルグルメを食べ比べる`,
        description: '駅前や商店街を中心に、気になるお店をはしごする旅。'
      }
    ];
  }

  function getStoredIdeas() {
    try {
      return JSON.parse(localStorage.getItem(UPCOMING_STORAGE_KEY) || '[]');
    } catch (error) {
      console.warn('Failed to read stored trip ideas:', error);
      return [];
    }
  }

  function saveStoredIdeas(ideas) {
    localStorage.setItem(UPCOMING_STORAGE_KEY, JSON.stringify(ideas));
  }

  function getSyncSettings() {
    const supabaseUrl = String(TRIP_SYNC_CONFIG.supabaseUrl || '').trim();
    const supabaseAnonKey = String(TRIP_SYNC_CONFIG.supabaseAnonKey || '').trim();
    const table = String(TRIP_SYNC_CONFIG.table || 'trip_ideas').trim();

    return {
      supabaseUrl,
      supabaseAnonKey,
      table,
      enabled: Boolean(supabaseUrl && supabaseAnonKey)
    };
  }

  function normalizeIdeaPayload(item) {
    return {
      id: item.id || item.remote_id || Date.now(),
      prefecture: normalizePrefectureName(item.prefecture || ''),
      title: String(item.title || '').trim(),
      description: String(item.description || '').trim(),
      author: String(item.author || '').trim(),
      createdAt: item.createdAt || item.created_at || new Date().toISOString()
    };
  }

  let remoteIdeasCache = [];

  function getAllUserIdeas() {
    return [...remoteIdeasCache, ...getStoredIdeas()];
  }

  async function loadRemoteIdeas() {
    const sync = getSyncSettings();
    if (!sync.enabled) {
      remoteIdeasCache = [];
      return [];
    }

    const endpoint = `${sync.supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(sync.table)}?select=*`;

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: sync.supabaseAnonKey,
          Authorization: `Bearer ${sync.supabaseAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load remote ideas: ${response.status}`);
      }

      const payload = await response.json();
      remoteIdeasCache = Array.isArray(payload)
        ? payload.map(normalizeIdeaPayload).filter(item => item.title && item.description)
        : [];
      return remoteIdeasCache;
    } catch (error) {
      console.warn('Remote sync unavailable, using local ideas only:', error);
      remoteIdeasCache = [];
      return [];
    }
  }

  async function pushRemoteIdea(idea) {
    const sync = getSyncSettings();
    if (!sync.enabled) {
      return { ok: false, skipped: true };
    }

    const endpoint = `${sync.supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(sync.table)}`;
    const body = {
      prefecture: idea.prefecture,
      title: idea.title,
      description: idea.description,
      author: idea.author,
      created_at: idea.createdAt
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: sync.supabaseAnonKey,
        Authorization: `Bearer ${sync.supabaseAnonKey}`,
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Failed to save remote idea: ${response.status}`);
    }

    return { ok: true };
  }

  function getChecklistSyncSettings() {
    const fallbackUrl = String(TRIP_SYNC_CONFIG.supabaseUrl || '').trim();
    const fallbackKey = String(TRIP_SYNC_CONFIG.supabaseAnonKey || '').trim();
    const supabaseUrl = String(CHECKLIST_SYNC_CONFIG.supabaseUrl || fallbackUrl).trim();
    const supabaseAnonKey = String(CHECKLIST_SYNC_CONFIG.supabaseAnonKey || fallbackKey).trim();
    const table = String(CHECKLIST_SYNC_CONFIG.table || 'checklist_states').trim();

    return {
      supabaseUrl,
      supabaseAnonKey,
      table,
      enabled: Boolean(supabaseUrl && supabaseAnonKey)
    };
  }

  function getChecklistState() {
    try {
      return JSON.parse(localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
    } catch (error) {
      console.warn('Failed to read checklist state:', error);
      return {};
    }
  }

  function saveChecklistState(state) {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  }

  function toChecklistItemKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  async function loadRemoteChecklist(listId) {
    const sync = getChecklistSyncSettings();
    if (!sync.enabled) {
      return {};
    }

    const endpoint = `${sync.supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(sync.table)}?list_id=eq.${encodeURIComponent(listId)}&select=item_key,checked`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: sync.supabaseAnonKey,
        Authorization: `Bearer ${sync.supabaseAnonKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load checklist state: ${response.status}`);
    }

    const payload = await response.json();
    const map = {};
    (Array.isArray(payload) ? payload : []).forEach(item => {
      const key = toChecklistItemKey(item.item_key);
      map[key] = Boolean(item.checked);
    });

    return map;
  }

  async function pushRemoteChecklistItem(listId, itemKey, checked) {
    const sync = getChecklistSyncSettings();
    if (!sync.enabled) {
      return;
    }

    const endpoint = `${sync.supabaseUrl.replace(/\/$/, '')}/rest/v1/${encodeURIComponent(sync.table)}?on_conflict=list_id,item_key`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: sync.supabaseAnonKey,
        Authorization: `Bearer ${sync.supabaseAnonKey}`,
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify([
        {
          list_id: listId,
          item_key: itemKey,
          checked,
          updated_at: new Date().toISOString()
        }
      ])
    });

    if (!response.ok) {
      throw new Error(`Failed to save checklist state: ${response.status}`);
    }
  }

  function renderSyncedChecklists() {
    const lists = document.querySelectorAll('[data-checklist-id]');
    if (!lists.length) {
      return;
    }

    const allState = getChecklistState();

    lists.forEach(list => {
      const listId = String(list.getAttribute('data-checklist-id') || '').trim();
      if (!listId) {
        return;
      }

      list.classList.add('checklist-list');
      const localState = allState[listId] || {};

      const statusNode = document.createElement('p');
      statusNode.className = 'checklist-sync-status';
      statusNode.textContent = 'この端末でチェック状態を保存します。';
      list.insertAdjacentElement('afterend', statusNode);

      list.querySelectorAll('li').forEach((item, index) => {
        const rawLabel = item.textContent.trim();
        const itemKey = toChecklistItemKey(item.getAttribute('data-check-key') || rawLabel || `item-${index + 1}`);
        const checkboxId = `${listId}-${itemKey}`;

        item.classList.add('checklist-item');
        item.innerHTML = `
          <label for="${escapeHtml(checkboxId)}">
            <input type="checkbox" id="${escapeHtml(checkboxId)}" data-check-item="${escapeHtml(itemKey)}">
            <span>${escapeHtml(rawLabel)}</span>
          </label>
        `;

        const input = item.querySelector('input[type="checkbox"]');
        input.checked = Boolean(localState[itemKey]);

        input.addEventListener('change', async () => {
          const currentState = getChecklistState();
          currentState[listId] = currentState[listId] || {};
          currentState[listId][itemKey] = input.checked;
          saveChecklistState(currentState);

          statusNode.textContent = '保存しました（この端末）。';

          try {
            await pushRemoteChecklistItem(listId, itemKey, input.checked);
            statusNode.textContent = '保存しました（端末間で同期）。';
          } catch (error) {
            statusNode.textContent = 'ローカル保存のみ（同期サーバー未接続）。';
          }
        });
      });

      loadRemoteChecklist(listId)
        .then(remoteState => {
          const merged = { ...localState, ...remoteState };
          const latestState = getChecklistState();
          latestState[listId] = merged;
          saveChecklistState(latestState);

          list.querySelectorAll('input[data-check-item]').forEach(input => {
            const key = toChecklistItemKey(input.getAttribute('data-check-item'));
            input.checked = Boolean(merged[key]);
          });

          statusNode.textContent = 'チェック状態を同期しました。';
        })
        .catch(() => {
          statusNode.textContent = 'この端末でチェック状態を保存します。';
        });
    });
  }

  function getIdeasForPrefecture(prefecture) {
    const label = normalizePrefectureName(prefecture);
    const seeds = PREFECTURE_SEEDS[label] || [];
    const fallback = buildFallbackIdeas(label);
    const stored = getAllUserIdeas().filter(item => normalizePrefectureName(item.prefecture) === label);
    const merged = [...seeds, ...stored, ...fallback];
    const seen = new Set();

    return merged.filter(item => {
      const key = `${item.title}::${item.description}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  function pickRandom(items) {
    if (!items || !items.length) {
      return null;
    }

    return items[Math.floor(Math.random() * items.length)];
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ideaCard(idea, prefix) {
    if (!idea) {
      return '<p class="trip-empty">まだおすすめがありません。投稿フォームから最初の案を追加してください。</p>';
    }

    return `
      <article class="trip-card">
        <p class="trip-card-kicker">${escapeHtml(prefix)}</p>
        ${idea.prefecture ? `<p class="trip-card-prefecture">${escapeHtml(idea.prefecture)}</p>` : ''}
        <h3>${escapeHtml(idea.title)}</h3>
        <p>${escapeHtml(idea.description)}</p>
        ${idea.author ? `<p class="trip-card-meta">by ${escapeHtml(idea.author)}</p>` : ''}
      </article>
    `;
  }

  function renderPrefectureWidget() {
    const prefecture = getPrefecturePageName();
    if (!prefecture) {
      return;
    }

    const main = document.querySelector('main');
    if (!main || document.getElementById('prefecture-upcoming-widget')) {
      return;
    }

    const widget = document.createElement('section');
    widget.className = 'prefecture-trip-widget';
    widget.id = 'prefecture-upcoming-widget';
    widget.innerHTML = `
      <h2>Upcoming trip ideas for ${prefecture}</h2>
      <p>みんなが考えた観光案を、${prefecture}ごとにランダム表示します。</p>
      <div class="trip-widget-actions">
        <button type="button" class="highlight-btn trip-mini-btn" data-randomize-widget>もう一度ランダム</button>
        <a class="highlight-btn trip-mini-btn" href="upcoming-trip.html?prefecture=${encodeURIComponent(prefecture)}" target="_blank" rel="noopener">投稿ページを開く</a>
      </div>
      <div class="trip-widget-slot" data-widget-slot></div>
    `;

    const firstSection = main.querySelector('section');
    if (firstSection && firstSection.nextSibling) {
      main.insertBefore(widget, firstSection.nextSibling);
    } else {
      main.appendChild(widget);
    }

    const slot = widget.querySelector('[data-widget-slot]');
    const randomButton = widget.querySelector('[data-randomize-widget]');

    const refresh = () => {
      const ideas = getIdeasForPrefecture(prefecture);
      const randomIdea = pickRandom(ideas);
      slot.innerHTML = ideaCard(randomIdea, 'Random pick');
    };

    randomButton.addEventListener('click', refresh);
    window.addEventListener('etw-trip-data-updated', refresh);
    refresh();
  }

  function populatePrefectureSelect(select, selectedPrefecture) {
    PREFECTURES.forEach(prefecture => {
      const option = document.createElement('option');
      option.value = prefecture;
      option.textContent = prefecture;
      if (prefecture === selectedPrefecture) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  function renderRouletteSystem(onPick) {
    const rouletteValue = document.querySelector('[data-roulette-value]');
    const rouletteSubcopy = document.querySelector('[data-roulette-subcopy]');
    const toggleButton = document.querySelector('[data-roulette-toggle]');

    if (!rouletteValue || !rouletteSubcopy || !toggleButton) {
      return;
    }

    let rouletteTimer = null;
    let currentIndex = 0;
    let currentValue = rouletteValue.textContent.trim() || PREFECTURES[0];

    const setActiveState = isRunning => {
      toggleButton.textContent = isRunning ? 'STOP' : 'START';
      toggleButton.setAttribute('aria-pressed', isRunning ? 'true' : 'false');
      rouletteSubcopy.textContent = isRunning
        ? 'Scanning prefectures...'
        : 'Ready to lock a destination.';
    };

    const advance = () => {
      currentIndex = (currentIndex + 1) % PREFECTURES.length;
      currentValue = PREFECTURES[currentIndex];
      rouletteValue.textContent = currentValue;
    };

    toggleButton.addEventListener('click', () => {
      if (!rouletteTimer) {
        currentIndex = Math.max(PREFECTURES.indexOf(currentValue), 0);
        setActiveState(true);
        rouletteTimer = window.setInterval(advance, 22);
        return;
      }

      window.clearInterval(rouletteTimer);
      rouletteTimer = null;
      const randomPrefecture = PREFECTURES[Math.floor(Math.random() * PREFECTURES.length)];
      currentValue = randomPrefecture;
      rouletteValue.textContent = randomPrefecture;
      setActiveState(false);

      if (typeof onPick === 'function') {
        onPick(randomPrefecture);
      }
    });

    setActiveState(false);
  }

  function renderUpcomingTripApp() {
    const app = document.getElementById('upcoming-trip-app');
    if (!app) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const selectedFromUrl = normalizePrefectureName(urlParams.get('prefecture') || 'Hokkaido');
    const prefectureSelect = app.querySelector('[data-prefecture-select]');
    const formPrefectureSelect = app.querySelector('[data-form-prefecture]');
    const randomSlot = app.querySelector('[data-random-slot]');
    const listSlot = app.querySelector('[data-list-slot]');
    const randomizeButton = app.querySelector('[data-randomize]');
    const form = app.querySelector('form');
    const statusMessage = app.querySelector('[data-status]');

    if (!prefectureSelect || !formPrefectureSelect || !randomSlot || !listSlot || !randomizeButton || !form) {
      return;
    }

    populatePrefectureSelect(prefectureSelect, selectedFromUrl);
    populatePrefectureSelect(formPrefectureSelect, selectedFromUrl);

    const render = () => {
      const prefecture = prefectureSelect.value;
      const ideas = getIdeasForPrefecture(prefecture);
      const randomIdea = pickRandom(ideas);

      randomSlot.innerHTML = ideaCard(randomIdea, `${prefecture} のランダム案`);

      if (ideas.length) {
        listSlot.innerHTML = ideas.map(idea => ideaCard(idea, prefecture)).join('');
      } else {
        listSlot.innerHTML = '<p class="trip-empty">まだ投稿がありません。</p>';
      }
    };

    prefectureSelect.addEventListener('change', render);
    formPrefectureSelect.addEventListener('change', () => {
      if (statusMessage) {
        statusMessage.textContent = '';
      }
    });
    randomizeButton.addEventListener('click', event => {
      event.preventDefault();
      render();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const formData = new FormData(form);
      const prefecture = normalizePrefectureName(formData.get('prefecture') || prefectureSelect.value);
      const title = String(formData.get('title') || '').trim();
      const description = String(formData.get('description') || '').trim();
      const author = String(formData.get('author') || '').trim();

      if (!title || !description) {
        if (statusMessage) {
          statusMessage.textContent = 'タイトルと説明を入力してください。';
        }
        return;
      }

      const newIdea = {
        id: Date.now(),
        prefecture,
        title,
        description,
        author,
        createdAt: new Date().toISOString()
      };

      const storedIdeas = getStoredIdeas();
      storedIdeas.unshift(newIdea);
      saveStoredIdeas(storedIdeas);

      let saveMessage = `${prefecture} に投稿を保存しました。`;
      try {
        const result = await pushRemoteIdea(newIdea);
        if (result.ok) {
          await loadRemoteIdeas();
          saveMessage = `${prefecture} に投稿を保存しました（端末間で共有されます）。`;
        }
      } catch (error) {
        console.warn('Remote save failed, kept local copy only:', error);
        saveMessage = `${prefecture} に保存しました（共有サーバーには接続できませんでした）。`;
      }

      form.reset();
      prefectureSelect.value = prefecture;
      formPrefectureSelect.value = prefecture;

      if (statusMessage) {
        statusMessage.textContent = saveMessage;
      }

      render();
      window.dispatchEvent(new Event('etw-trip-data-updated'));
    });

    loadRemoteIdeas().finally(() => {
      render();
      window.dispatchEvent(new Event('etw-trip-data-updated'));
    });
  }

  renderRouletteSystem(selectedPrefecture => {
    const prefectureSelect = document.querySelector('[data-prefecture-select]');
    const formPrefectureSelect = document.querySelector('[data-form-prefecture]');
    const randomizeButton = document.querySelector('[data-randomize]');

    if (prefectureSelect) {
      prefectureSelect.value = selectedPrefecture;
      prefectureSelect.dispatchEvent(new Event('change'));
    }

    if (formPrefectureSelect) {
      formPrefectureSelect.value = selectedPrefecture;
    }

    if (randomizeButton) {
      randomizeButton.textContent = `Randomize ${selectedPrefecture}`;
    }
  });
  renderSyncedChecklists();
  renderPrefectureWidget();
  renderUpcomingTripApp();
});


window.addEventListener('DOMContentLoaded', function() {
  // -----------------------------
  // スプラッシュアニメーション
  // -----------------------------
  setTimeout(function() {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.style.display = 'none', 1000);
    }
  }, 1800); // 1.8秒表示してからフェードアウト

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
  const links = document.querySelectorAll("#sidebarDrawer .toggle-list ul li a");

  let latest = null;
  let latestDate = null;
  const today = new Date();
  today.setHours(0,0,0,0); // 今日の日付だけにリセット

  links.forEach(link => {
    const href = link.getAttribute("href");
    const match = href.match(/(\d{2})-(\d{8})\.html$/);

    if (match) {
      const rawDate = match[2]; // ddmmyyyy
      const dd = rawDate.slice(0,2);
      const mm = rawDate.slice(2,4);
      const yyyy = rawDate.slice(4,8);
      const dateObj = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);

      // 今日より未来はスキップ
      if (dateObj > today) return;

      if (!latestDate || dateObj > latestDate) {
        latestDate = dateObj;
        latest = link;
      }
    }
  });

  if (latest) {
    const url = latest.getAttribute("href");
    const container = document.getElementById("latest-container");

    fetch(url)
      .then(res => res.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const summarySection = doc.querySelector("#summary");

        if (summarySection) {
          container.innerHTML = `
            <article>
              <h3><a href="${url}">${latest.textContent}</a></h3>
              ${summarySection.innerHTML}
            </article>
          `;
        } else {
          container.innerHTML = `
            <article>
              <h3><a href="${url}">${latest.textContent}</a></h3>
              <p>Summary not found.</p>
            </article>
          `;
        }
      })
      .catch(err => {
        console.error("Failed to load summary:", err);
        const title = latest ? latest.textContent : "記事タイトル不明";
        const link = latest ? latest.getAttribute("href") : "#";
        container.innerHTML = `
          <article>
            <h3><a href="${link}">${title}</a></h3>
            <p>Summary could not be loaded.</p>
          </article>
        `;
      });
  }
});


// スプラッシュアニメーション
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.classList.add('fade-out');
            setTimeout(() => splash.style.display = 'none', 1000);
        }
    }, 1800); // 1.8秒表示してからフェードアウト
});

// ハンバーガーメニューの開閉
const menuBtn = document.getElementById('menuBtn');
const sidebarDrawer = document.getElementById('sidebarDrawer');
const sidebarOverlay = document.getElementById('sidebarOverlay');
menuBtn.onclick = function() {
    sidebarDrawer.classList.toggle('open');
    sidebarOverlay.classList.toggle('open');
};
sidebarOverlay.onclick = function() {
    sidebarDrawer.classList.remove('open');
    sidebarOverlay.classList.remove('open');
};

// トグルリスト（アコーディオン）の開閉
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.onclick = function(e) {
        e.stopPropagation();
        const parent = btn.parentElement;
        parent.classList.toggle('open');
        // 他のトグルを閉じたい場合は下記を有効化
        // document.querySelectorAll('.toggle-list').forEach(d => {
        //     if (d !== parent) d.classList.remove('open');
        // });
    };
});
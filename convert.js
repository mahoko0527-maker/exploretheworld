const fs = require('fs');
const cheerio = require('cheerio');

// SVGファイル読み込み
const svgText = fs.readFileSync('world.svg', 'utf8');

// cheerioでパース
const $ = cheerio.load(svgText, { xmlMode: true });

// 各国の <path id="XX" ... /> を <a xlink:href="xx.html">...</a> で囲む
$('path[id]').each(function() {
  const path = $(this);
  const countryId = path.attr('id');
  if (!countryId) return;

  // 新しい <a> 要素作成
  const a = $('<a></a>');
  a.attr('xlink:href', `${countryId.toLowerCase()}.html`);

  // pathをaの子に移動
  path.replaceWith(a.append(path));
});

// xlink名前空間がなければ追加
const svg = $('svg');
if (!svg.attr('xmlns:xlink')) {
  svg.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink');
}

// 新しいSVGを書き出し
fs.writeFileSync('world_linked.svg', $.xml(), 'utf8');

console.log('変換完了: world_linked.svg');
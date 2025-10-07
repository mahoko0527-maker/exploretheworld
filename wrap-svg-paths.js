const fs = require('fs');
const inputPath = 'japan.svg';
const outputPath = 'japan-linked.svg';

let svg = fs.readFileSync(inputPath, 'utf8');

// <path id="都道府県名" ... /> を <a xlink:href="都道府県名.html"><path id="都道府県名" ... /></a> に変換
svg = svg.replace(/<path\s+id="([A-Z]+)"([\s\S]*?\/>)/g, 
  '<a xlink:href="$1.html" target="_top">\n<path id="$1"$2\n</a>');

fs.writeFileSync(outputPath, svg);
console.log('変換完了: japan-linked.svg を作成しました');       
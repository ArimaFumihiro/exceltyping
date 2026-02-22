'use strict';

/*====================
配列内の値を変更できないようにする
====================*/

function deepFreeze(obj) {
  // オブジェクトのプロパティ名を取得
  const propNames = Object.getOwnPropertyNames(obj);

  // プロパティを1つずつ処理
  for (const name of propNames) {
    const value = obj[name];
    // プロパティがオブジェクトで、かつnullでない場合に再帰的に処理
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  // オブジェクト自体をフリーズして返す
  return Object.freeze(obj);
}

// romajiMap.js
export const kanaToRomaji = deepFreeze({
  // --- 母音 ---
  'あ': ['a'], 'い': ['i'], 'う': ['u'], 'え': ['e'], 'お': ['o'],

  // --- 小文字母音 ---
  'ぁ': ['la', 'xa'], 'ぃ': ['li', 'xi'], 'ぅ': ['lu', 'xu'], 'ぇ': ['le', 'xe'], 'ぉ': ['lo', 'xo'],

  // --- か行 ---
  'か': ['ka', 'ca'], 'き': ['ki'], 'く': ['ku', 'cu', 'qu'], 'け': ['ke'], 'こ': ['ko', 'co'],
  // 拗音
  'きゃ': ['kya', 'kilya', 'kixya'], 'きぃ': ['kyi', 'kilyi', 'kixyi'], 'きゅ': ['kyu', 'kilyu', 'kixyu'], 'きぇ': ['kye', 'kilye', 'kixye'], 'きょ': ['kyo', 'kilyo', 'kixyo'],

  // --- さ行 ---
  'さ': ['sa'], 'し': ['si', 'shi','ci'], 'す': ['su'], 'せ': ['se', 'ce'], 'そ': ['so'],
  // 拗音
  'しゃ': ['sha', 'sya', 'silya', 'shilya', 'sixya', 'shixya'],
  'しぃ': ['shi', 'syi', 'silyi', 'shilyi', 'sixyi', 'shixyi'],
  'しゅ': ['shu', 'syu', 'silyu', 'shilyu', 'sixyu', 'shixyu'],
  'しぇ': ['she', 'sye', 'silye', 'shilye', 'sixye', 'shixye'],
  'しょ': ['sho', 'syo', 'silyo', 'shilyo', 'sixyo', 'shixyo'],

  // --- た行 ---
  'た': ['ta'], 'ち': ['chi', 'ti'], 'つ': ['tsu', 'tu'], 'て': ['te'], 'と': ['to'],
  // 拗音
  'ちゃ': ['cha', 'cya', 'tya', 'chilya', 'tilya', 'chixya', 'tixya'],
  'ちぃ': ['chi', 'cyi', 'tyi', 'chilyi', 'tilyi', 'chixyi', 'tixyi'],
  'ちゅ': ['chu', 'cyu', 'tyu', 'chilyu', 'tilyu', 'chixyu', 'tixyu'],
  'ちぇ': ['che', 'cye', 'tye', 'chilye', 'tilye', 'chixye', 'tixye'],
  'ちょ': ['cho', 'cyo', 'tyo', 'chilyo', 'tilyo', 'chixyo', 'tixyo'],

  // --- な行 ---
  'な': ['na'], 'に': ['ni'], 'ぬ': ['nu'], 'ね': ['ne'], 'の': ['no'],
  // 拗音
  'にゃ': ['nya', 'nilya', 'nixya'],  'にぃ': ['nyi', 'nilyi', 'nixyi'],  'にゅ': ['nyu', 'nilyu', 'nixyu'],  'にぇ': ['nye', 'nilye', 'nixye'],  'にょ': ['nyo', 'nilyo', 'nixyo'],

  // --- は行 ---
  'は': ['ha'], 'ひ': ['hi'], 'ふ': ['fu', 'hu'], 'へ': ['he'], 'ほ': ['ho'],
  // 拗音
  'ひゃ': ['hya', 'hilya', 'hixya'], 'ひぃ': ['hyi', 'hilyi', 'hixyi'], 'ひゅ': ['hyu', 'hilyu', 'hixyu'], 'ひぇ': ['hye', 'hilye', 'hixye'], 'ひょ': ['hyo', 'hilyo', 'hixyo'],
  'ふぁ': ['fa', 'fulya', 'fuxya'], 'ふぃ': ['fi', 'fulyi', 'fuxyi'], 'ふぇ': ['fe', 'fulye', 'fuxye'], 'ふぉ': ['fo', 'fulyo', 'fuxyo'],

  // --- ま行 ---
  'ま': ['ma'], 'み': ['mi'], 'む': ['mu'], 'め': ['me'], 'も': ['mo'],
  // 拗音
  'みゃ': ['mya', 'milya', 'mixya'],  'みぃ': ['myi', 'milyi', 'mixyi'],  'みゅ': ['myu', 'milyu', 'mixyu'],  'みぇ': ['mye', 'milye', 'mixye'],  'みょ': ['myo', 'milyo', 'mixyo'],

  // --- や行 ---
  'や': ['ya'], 'ゆ': ['yu'], 'よ': ['yo'],
  // 小文字
  'ゃ': ['lya', 'xya'], 'ゅ': ['lyu', 'xyu'], 'ょ': ['lyo', 'xyo'],

  // --- ら行 ---
  'ら': ['ra'], 'り': ['ri'], 'る': ['ru'], 'れ': ['re'], 'ろ': ['ro'],
  // 拗音
  'りゃ': ['rya', 'rilya', 'rixya'],  'りぃ': ['ryi', 'rilyi', 'rixyi'],  'りゅ': ['ryu', 'rilyu', 'rixyu'],  'りぇ': ['rye', 'rilye', 'rixye'],  'りょ': ['ryo', 'rilyo', 'rixyo'],

  // --- わ行 ---
  'わ': ['wa'], 'を': ['wo'], 'ん': ['nn', 'n'],

  // --- 濁音 ---
  'が': ['ga'], 'ぎ': ['gi'], 'ぐ': ['gu'], 'げ': ['ge'], 'ご': ['go'],
  'ざ': ['za'], 'じ': ['ji', 'zi'], 'ず': ['zu'], 'ぜ': ['ze'], 'ぞ': ['zo'],
  'だ': ['da'], 'ぢ': ['di'], 'づ': ['du'], 'で': ['de'], 'ど': ['do'],
  'ば': ['ba'], 'び': ['bi'], 'ぶ': ['bu'], 'べ': ['be'], 'ぼ': ['bo'],
  // 拗音
  'ぎゃ': ['gya', 'gilya', 'gixya'], 'ぎぃ': ['gyi', 'gilyi', 'gixyi'],  'ぎゅ': ['gyu', 'gilyu', 'gixyu'], 'ぎぇ': ['gye', 'gilye', 'gixye'], 'ぎょ': ['gyo', 'gilyo', 'gixyo'],
  'じゃ': ['ja', 'jya', 'zya', 'jilya', 'zilya', 'jixya', 'zixya'],
  'じぃ': ['ji', 'jyi', 'zyi', 'jilyi', 'zilyi', 'jixyi', 'zixyi'],
  'じゅ': ['ju', 'jyu', 'zyu', 'jilyu', 'zilyu', 'jixyu', 'zixyu'],
  'じぇ': ['je', 'jye', 'zye', 'jilye', 'zilye', 'jixye', 'zixye'],
  'じょ': ['jo', 'jyo', 'zyo', 'jilyo', 'zilyo', 'jixyo', 'zixyo'],
  'びゃ': ['bya', 'bilya', 'bixya'], 'びぃ': ['byi', 'bilyi', 'bixyi'], 'びゅ': ['byu', 'bilyu', 'bixyu'], 'びぇ': ['bye', 'bilye', 'bixye'], 'びょ': ['byo', 'bilyo', 'bixyo'],

  // --- 半濁音 ---
  'ぱ': ['pa'], 'ぴ': ['pi'], 'ぷ': ['pu'], 'ぺ': ['pe'], 'ぽ': ['po'],
  // 拗音
  'ぴゃ': ['pya', 'pilya', 'pixya'], 'ぴぃ': ['pyi', 'pilyi', 'pixyi'], 'ぴゅ': ['pyu', 'pilyu', 'pixyu'], 'ぴぇ': ['pye', 'pilye', 'pixye'], 'ぴょ': ['pyo', 'pilyo', 'pixyo'],

  // --- 小文字っ (促音) ---
  'っ': ['ltu', 'xtu', 'ltsu', 'xtsu'], // 特殊処理で「kk」「tt」なども可

  // スペース
  '　': [" "], // 全角スペース
  ' ': [" "], // 半角スペース

  // ハイフォン
  '-': ['-'],
  'ー': ['-'],

  // 点　丸
  '、': [','],
  '。': ['.'],
});


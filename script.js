'use strict';

/*====================
別のjsからインポート
====================*/

import { problemSet } from './problem-set.js' //problemSet（問題集）をインポート
import { kanaToRomaji } from './kanaToRomaji.js' //kanaToRomaji（ローマ字マップ）をインポート

/*====================
DOMヘルパ
====================*/

//クエリセレクターを関数に格納
function $(sel) {
  return document.querySelector(sel);
}

//要素を取得する
const $hamburger = $('#js-hamburger'); // ハンバーガーメニュー
const $nav = $('#js-nav'); // ナビ
const $overlay = $('#overlay'); // ナビ

const $fx = $('#fx'); //fx欄
const $HowTo = $('#How-to-text'); //使い方欄
const $subject = $('#subject');　//関数名欄
const $hint = $('#hint'); //関数説明欄
const $typingWords = $('#typing-words'); //タイピング文字欄
const $time = $('#time'); // 残り時間表示
const $timebar = $('#timebar'); // タイマーバー
const $combo = $('#combo'); // コンボ
const $wpm = $('#wpm'); // wpm
const $score = $('#score'); // スコア

const $startBtn = $('#startBtn'); // スタートボタン
const $dur = $('#duration'); // 時間設定
const $mode = $('#mode'); // モード選択
const $theme = $('#theme'); // 色彩選択
const $sound = $('#sound'); // 効果音
const $chara = $('#chara'); // 効果音

const $cFire = $('#combo-fire'); // コンボファイアーエフェクト
const $wFire = $('#wpm-fire'); // WPMファイアーエフェクト

const $home = $("#home"); // home画面
const $game = $("#game"); // game画面
const $end = $('#end'); // end画面

const $EC = $('#end-canvas'); // エンドキャンバス
const $retry = $('#retry'); // もう一度プレイボタン
const $TR = $('#titleReturn'); // タイトルに戻るボタン
const $eCor = $('#end-correct'); // 正答数
const $eMiss = $('#end-miss'); // ミス
const $eRate = $('#end-rate'); // レート
const $eWpm = $('#end-wpm'); // WPM
const $eCombo = $('#end-combo'); // コンボ
const $eQuiz = $('#end-quiz'); // 問題数

const $rec3Quiz = $('#record3-quiz'); // 成績表示

const $homeChara = $('#home-chara'); // homeのキャラimg
const $gameChara = $('#game-chara'); // gameのキャラimg
const $endChara = $('#end-chara'); // endのキャラimg

/*====================
canvas作成
====================*/

// 引数DOM要素
function canvasAcquisition(e) {
  const c = e.getContext("2d");
  return { canvas: e, ctx: c };
}


/*====================
状態管理
====================*/

$sound.addEventListener('change', e => {
  gameState.sound = e.target.checked;
  // saveSettings();  
});

$mode.addEventListener('change', e => {
  gameState.gameType = e.target.value;
  // saveSettings();  
});

$chara.addEventListener('change', e => {
  if (!e.target.checked) {
    $homeChara.classList.add('hidden'); // homeのキャラimg非表示
    $gameChara.classList.add('hidden'); //gameのキャラimg非表示
    $endChara.classList.add('hidden'); // endのキャラimg非表示    
  } else {
    $homeChara.classList.remove('hidden'); // homeのキャラimg表示
    $gameChara.classList.remove('hidden'); //gameのキャラimg表示
    $endChara.classList.remove('hidden'); // endのキャラimg表示
  };
  // saveSettings();  
});

const gameConfing = {
  problemSetLength: problemSet.length,
  cellColumns: ['A', 'B', 'C', 'D', 'E'], //セルの列名
  cellRows: 5,　//セルの行数
  get columnsLength() { //セルの列数
    return this.cellColumns.length; 
  }
};

const gameState = {
  sound: true,
  chara: true,
  gameType: 'normal', // 通常タイピングモード
  answerCount: 0, // 問題数

  problemNumber: null, // ランダム値
  problem: {}, // 問題
  functionName: '', // 関数名
  functionLower: '', // 関数名小文字
  functionReading: '', // 関数名の読み
  formula: '', // fxに入る式
  hiragana: '', // ひらがな
  hiraganaLength: '', // ひらがなの数

  counter: 0, // ローマ字との文字数比較用カウンター
  currentIndex: 0, // 入力文字数カウンター
  kanaIndex: 0, // かな文字数カウンター
  allowed: 'abcdefghijklmnopqrstuvwxyz-', // 判定文字
  currentTyping: '', // 入力中のローマ字
  domMapping: [],　// 何文字目のタイピングで、どのDOM要素(span)を塗るか記憶する配列

  timerId: null, //タイマー中か判断
  playing: false, // ゲームをしているか判断
  stepUp: false, // 用途に切り替え

  duration: 60, // 設定時刻
  
  score: 0, // スコア
  wpm: 0, // 一分間あたりのタイピング数
  combo: 0, // コンボ数
  maxCombo: 0, // 最大コンボ数
  typedCounter: 0, // キーを押した回数
  typeMiss: 0, // ミスした数
  correctTyping: 0, // 正解タイピング
  rate: 0, // 正解率

  speed: 0, // タイピング速度
  
  isHype: false, // BGMが盛り上がっているか
  cheered: false, // 100コンボの歓声が流れたか
  seType: new Audio('./se/type.mp3'),
  seMiss: new Audio('./se/miss.mp3'),
  seCheer: new Audio('./se/cheer.mp3'),  
};


/*====================
音声をフェードアウトさせる関数
====================*/
/**
 * @param {HTMLAudioElement} audio - フェードアウトさせたいAudioオブジェクト
 * @param {number} duration - フェードアウトにかける時間（ミリ秒）
 */

function fadeOut(audio, duration) {
  const startVolume = audio.volume; // 現在の音量を保持（通常 1.0）
  const interval = 75; // 0.05秒ごとに音量を下げる
  const step = startVolume / (duration / interval); // 1回あたりの減少量

  const timer = setInterval(() => {
    if (audio.volume > step) {
      audio.volume -= step; // 音量を下げる
    } else {
      audio.volume = 0;
      audio.pause(); // 完全に消えたら停止
      audio.currentTime = 0; // 再生位置を戻す
      audio.volume = startVolume; // 次回のために音量を元に戻しておく
      clearInterval(timer);
    }
  }, interval);
}

/*====================
問題キュー
====================*/

function newProblem() {
  gameState.problemNumber = Math.floor(Math.random() * gameConfing.problemSetLength);
  // gs.problemNumber = 22; //チェック用
  gameState.problem = problemSet[gameState.problemNumber];
}

function newTyping() {
  const gs = gameState; //オブジェクト名短縮
  const gameMode = $mode.value 
  
  if (gameMode === 'quiz') {
    newProblem() //  問題セット
    $subject.textContent = "";

    const p = gs.problem;

    gs.functionName = p['関数名'];
    gs.functionLower = gs.functionName.toLowerCase();

    gs.functionReading = p['読み'];
    gs.formula = p['式'];
 
  } else if (!gs.stepUp) {
    newProblem() //  問題セット
    $subject.textContent = "";
  
    const p = gs.problem;
  
    gs.functionName = p['関数名'];
    gs.functionLower = gs.functionName.toLowerCase();
    
    gs.functionReading = p['読み'];
    gs.formula = p['式'];

    $hint.classList.add('emphasis');
  } else {
    const p = gs.problem;

    $hint.classList.remove('emphasis');
  }

  gs.counter = 0;
  gs.currentIndex = 0;
  gs.kanaIndex = 0;
  gs.currentTyping = '';

  gs.duration = Number($dur.value);
  console.log('時間', gs.duration);

  //Excel風プレビュー作成
  createPreview();
  //説明欄作成
  newHowTo();
  //タイピング更新
  (gs.gameType === 'normal' ? initGame : initQuiz)();
}

/*====================
カタカナをひらがなに置き換える関数
====================*/
function katakanaToHiragana(src) {
  return src.replace(/[\u30a1-\u30f6]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

/*====================
ひらがな文字列を音節に分解する関数
====================*/
function splitKana(str) {
  // [\u4E00-\u9FFF] 漢字
  const kanaRegex = /([\u4E00-\u9FFF]|きゃ|きぃ|きゅ|きぇ|きょ|しゃ|しぃ|しゅ|しぇ|しょ|ちゃ|ちぃ|ちゅ|ちぇ|ちょ|にゃ|にぃ|にゅ|にぇ|にょ|ひゃ|ひぃ|ひゅ|ひぇ|ひょ|ふゃ|ふぃ|ふぇ|ふょ|みゃ|みぃ|みゅ|みぇ|みょ|りゃ|りぃ|りゅ|りぇ|りょ|ぎゃ|ぎぃ|ぎゅ|ぎぇ|ぎょ|じゃ|じぃ|じゅ|じぇ|じょ|びゃ|びぃ|びゅ|びぇ|びょ|ぴゃ|ぴぃ|ぴゅ|ぴぇ|ぴょ|キャ|キィ|キュ|キェ|キョ|シャ|シィ|シュ|シェ|ショ|チャ|チィ|チュ|チェ|チョ|ニャ|ニィ|ニュ|ニェ|ニョ|ヒャ|ヒィ|ヒュ|ヒェ|ヒョ|ファ|フィ|フェ|フォ|ミャ|ミィ|ミュ|ミェ|ミョ|リャ|リィ|リュ|リェ|リョ|ギャ|ギィ|ギュ|ギェ|ギョ|ジャ|ジィ|ジュ|ジェ|ジョ|ビャ|ビィ|ビュ|ビェ|ビョ|ピャ|ピィ|ピュ|ピェ|ピョ|[あ-んー]|っ|[ア-ン]|ッ|[A-Z]|[a-z]| |　|。)/g;
  return str.match(kanaRegex) || [str];
}

/*====================
Excel風プレビュー表描画
====================*/

function createPreview() {
  const gs = gameState;
  const gc = gameConfing;

  // クイズモード用　関数の部分を＊にする
  let [left, right] = gs.formula.split("(");
  let stars = "*".repeat(left.length);
  let hiddenFormula = stars + "(" + right;
  
  // 数式バーに式を表示
  if (gs.gameType === 'normal') {
    $fx.textContent = gs.formula;
  } else {
    $fx.textContent = hiddenFormula;
  }

  const $B5 = document.getElementById('B5');
  const $C5 = document.getElementById('C5');
  const $D5 = document.getElementById('D5');

  for (let i = 0; i < gc.columnsLength; i++) {
    for (let j = 0; j < gc.cellRows; j++) {
      const range = `${gc.cellColumns[i]}${j + 1}`;
      const $target = $(`#${range}`);
      const value = problemSet[gs.problemNumber][range] ?? '';
      const len = String(value).length;

      // 初期化
      $target.textContent = value;
      $target.classList.remove('choice');
  
      if (!value) continue; // 値がない場合は次のループへ

      if (range === 'A5') {
        // 答えセル
        $target.classList.add('answer');
        if (len < 8) {
          $target.classList.remove('span-2', 'span-3');
          [$B5, $C5, $D5].forEach(e => e.classList.remove('hidden'));         
        } else if (len < 21) {
          $target.classList.add('span-2');
          $target.classList.remove('span-3');
          $B5.classList.add('hidden');
          $C5.classList.remove('hidden');       
        } else {
          $target.classList.add('span-3');
          $target.classList.remove('span-2');
          [$B5, $C5, $D5].forEach(e => e.classList.add('hidden'));
        }
      } else {
        // A5以外の選択可能セル
        $target.classList.add('choice');
      }     
    }
  }
}

/*====================
使い方説明欄
====================*/

function newHowTo() {
  $HowTo.textContent = problemSet[gameState.problemNumber]['説明'];
  $HowTo.style.whiteSpace = 'pre-line';　//改行は反映、複数スペースは 1 つにまとめて折り返す
}

/*====================
タイピングエリア
====================*/

// --------タイピングモード-------- //
function initGame() {
  const gs = gameState; // オブジェクト名短縮
  const p = gs.problem; // 問題

  //　1.表示リセット
  $typingWords.textContent = ''; //タイピング欄
  $hint.textContent = ""; // ヒント欄
  $subject.textContent = ""; // 関数名欄

  let targetParts = [];

  if (gs.stepUp) {
    // ステップ２
    $hint.className = 'hint';
    $subject.textContent = `■ ${gs.functionName} （${gs.functionReading}）`;
    targetParts = p['parts'];
  } else {
    // ステップ１
    $hint.className ='hint emphasis';
    $subject.textContent = '■ 関数名';
    targetParts = [{ t: gs.functionName, r: gs.functionReading }];
  }

  // 2.マッピング配列とひらがな結合用変数をリセット
  gs.domMapping = [];
  let fullHiragana = '';
  let globalCharIndex = 0; // 全体の何文字目か

  targetParts.forEach(part => {
    // ルビコンテナの作成
    const rubyEl = document.createElement('ruby');
    rubyEl.classList.add('rubys');

    // 親文字の作成
    let mainRbSpan = null;
    if (gs.stepUp) {
      mainRbSpan = document.createElement('span');
      mainRbSpan.classList.add('character');
      mainRbSpan.textContent = part.t;
      rubyEl.appendChild(mainRbSpan);
    }
    // 読み仮名を取得（ルビが無ければそのままテキストを使う）
    const typingReading = gs.stepUp ? (part.r || part.t) : part.t;
    const displayReading = gs.stepUp ? (part.r || part.t) : part.r;
    // カタカナをひらがなに変換
    const hiraReading = katakanaToHiragana(typingReading);
    // 読み仮名を「音節(splitKana」に分解
    const tokens = splitKana(hiraReading);
    const tokenCount = tokens.length;

    // C. ルビ(rt)とタイピング判定の作成
    const reEl = document.createElement('rt');
    reEl.classList.add('ruby-container');

    tokens.forEach((token, index) => {
      let charRbSpan = null;
      if (!gs.stepUp) {
        charRbSpan = document.createElement('span');
        charRbSpan.classList.add('character');
        charRbSpan.textContent = token; // 英語の1文字をセット
        rubyEl.appendChild(charRbSpan); // rtではなくruby直下に追加
      }

      // 1. ルビ表示用のspan作成
      let charSpan = null;
      if (gs.stepUp) {
        // 日本語モード:１文字ずつspanを作る
        charSpan = document.createElement('span');
        charSpan.textContent = token;
        charSpan.classList.add('ruby-text');
        if (!part.r) {
          // ルビが無い場合は非表示
          charSpan.classList.add('hidden-element'); 
        }
        reEl.appendChild(charSpan);
      } else {
      // 関数名モード:ルビはただのヒント
        reEl.textContent = displayReading;
        reEl.classList.add('ruby-hint');
      }

      const isLastTokenOfPart = (index === tokenCount - 1);
      const acutiveRbSpan = gs.stepUp
        ? (isLastTokenOfPart ? mainRbSpan : null)
        : charRbSpan;

      // 2. マッピング 「現在の文字数（globalCharIndex）」に対応するDOM要素を記録
      gs.domMapping[globalCharIndex] = {
        rubySpan: charSpan, // ルビのspan
        kanjiSpan: acutiveRbSpan, // 親の文字span
        isRuby: !!(gs.stepUp && part.r) // ルビがあるかどうか
      };

      gs.stepUp ? fullHiragana += token : fullHiragana += token.toLowerCase();
      globalCharIndex++;
    });

    rubyEl.appendChild(reEl);
    $hint.appendChild(rubyEl); 
  });

  // 4. タイピング用データの確定
  gs.hiragana = splitKana(fullHiragana);
  gs.hiraganaLength = gs.hiragana.length;
 
  // 5. ローマ字表示の生成
  let kanaNum = 0; // かな文字数カウンター
  for (const kana of gs.hiragana) {
    const container = document.createElement('span'); //かな１文字文のローマ字が入るspan要素
    container.id = `char${kanaNum}`;

    // 「っ」の場合の特殊処理
    if (kana === 'っ') {
      const nextKana = gs.hiragana[kanaNum + 1]; // 次のひらがな
      const nextRomaji = kanaToRomaji[nextKana] || []; // 次のひらがなに対応するローマ字配列
      const firstRomanji = nextRomaji[0]?.[0]; //ローマ字配列の先頭で最初の英語　?.はローマ字が無い場合にエラーを返さない
      
      if (!gs.allowed.includes(nextRomaji[0][0])) {       
        for (let i = 0; i < 5; i++) {
          const letter = document.createElement('span'); //英語1文字あたりのspan要素
          letter.className = 'letter';
          letter.textContent = kanaToRomaji['っ'][0][i];
          container.appendChild(letter);
        }
      } else {
        for (let i = 0; i < 5; i++) {
          if (i === 0) {
            const letter = document.createElement('span');
            letter.className = 'letter';
            letter.textContent = firstRomanji || ''; // 初期表示は候補の1つ目
            container.appendChild(letter);
          } else {
            const letter = document.createElement('span');
            letter.className = 'letter';
            container.appendChild(letter);
          }
        }
      }
    } else {
      const romaji = kanaToRomaji[kana] || [kana];
      // そのかなに対応するローマ字候補の最大長を求める
      const maxLen = romaji.reduce((m, s) => Math.max(m, s.length), 0);
      const setRomaji = romaji[0];
  
      // maxLen 個の小 span を作っておく（存在しない位置は空文字）
      for (let i = 0; i < maxLen; i++) {
        const letter = document.createElement('span');
        letter.className = 'letter';
        letter.textContent = setRomaji[i] || ''; // 初期表示は候補の1つ目
        container.appendChild(letter);
      }
    }
      　
    $typingWords.appendChild(container);
    kanaNum++;
  }
}

// --------クイスモード-------- //
function initQuiz() {
  const gs = gameState; // オブジェクト名短縮
  const p = gs.problem; // 問題
  
  //　1.表示リセット
  $typingWords.textContent = ''; //タイピング欄
  $hint.textContent = ""; // ヒント欄
  $hint.className = 'hint';
  $subject.textContent = "■ 問題：次の関数名は？"; // 関数名欄
  
  let quizParts = [];
  let answerParts = [];
  let hintWord = '';
  
  quizParts = p['parts'];
  answerParts = p['関数名'].toLowerCase();

  gs.hiragana = answerParts;
  gs.hiraganaLength = gs.hiragana.length;
  
  quizParts.forEach(part => {   
    hintWord += part.t;   
  });

  gs.hiragana = answerParts;
  $hint.textContent = hintWord;

  let kanaNum = 0;
  for (const Alphabet of answerParts) {
    const letterSpans = document.createElement('span');
    letterSpans.className = 'quiz-answer hidden-element';
    letterSpans.id = `char${kanaNum}`;
    letterSpans.textContent = Alphabet;
    $typingWords.appendChild(letterSpans);
    kanaNum++;
  }
}

/*====================
タイピング判定
====================*/

document.addEventListener('keydown', (event) => {
  const typedKey = event.key.toLowerCase(); //押したkeyを小文字にして格納
  const gs = gameState;
  
  // ゲーム外のキー（スペースで開始、Escでメニューなど）
  if (typedKey === ' ' && !gs.playing) {playGame(); return;}
  if (typedKey === 'escape') { esc(); return; }
  
  // 許可する文字以外は無視（a-z , . - のみ）
  if (!gs.playing || !gs.allowed.includes(typedKey)) return;
  
  const inputBuffer = gs.currentTyping + typedKey;
  const nextIdx = skip(gs.kanaIndex + 1);
  const nextKana = gs.hiragana[nextIdx];
  const nextRomaji = kanaToRomaji[nextKana] || [];  
  
  let isCorrect = false;
  let isMissed = false;
  let isComplete = false;
  let chosen = '';

  // ========== 1.「ん」の判定 ==========
  if (gs.stepUp && gs.hiragana[gs.kanaIndex] === 'ん') {  
    const needDoubleN = nextRomaji.some(c => /^[aiueoy]/.test(c));

    if (inputBuffer === 'n') {
      isCorrect = true;
      chosen = 'n';
    }
    else if (inputBuffer === 'nn') {
      isCorrect = true;
      isComplete = true;
      chosen = 'nn'; 
    }
    else if (inputBuffer === 'n' && !needDoubleN) {
      if (nextRomaji.startsWith(typedKey)) {
        isCorrect = true;
        isComplete = true;
        chosen = 'n';
      }
    } else {
      isMissed = true;
    }
  }

  // ========== 2.「っ」の判定 ==========
  else if (gs.stepUp && gs.hiragana[gs.kanaIndex] === 'っ') {
    // 母音(a,i,u,e,o)なら子音重ねは不可なので即ミス
    if (/^[aiueo]/.test(typedKey)) {
      isMissed = true;
      return;
    }
    
    // 次のかながtypedKeyで始まるならOK
    if (nextRomaji.some(c => c.startsWith(typedKey))) {
      isCorrect = true;
      isComplete = true;
      chosen = typedKey;
    } else {
      isMissed = true;
    }

    // ① 「っ」を単体で入力する場合（優先チェック）
    const candidatesForTsu = kanaToRomaji['っ'] || ['ltu', 'xtu', 'ltsu', 'xtsu'];
    if (candidatesForTsu.some(c => c.startsWith(inputBuffer))) {
      isCorrect = true;
      chosen = c;
      if (c === inputBuffer) {
        isComplete = true;
      }
    }
    if (!isCorrect) isMissed = true;
  }

  // ========== 3.通常のかな判定 ==========
  else {
    const candidates = kanaToRomaji[gs.hiragana[gs.kanaIndex]] || [gs.hiragana[gs.kanaIndex]];
    for (const c of candidates) {
      if (c.startsWith(inputBuffer)) {
        if (!chosen || c.length < chosen.length) {
          isCorrect = true;
          chosen = c;
          if (c === inputBuffer) {
            isComplete = true;
          }
        }        
      }
    }
    if (!isCorrect) isMissed = true;
  }

  // ========== 共通の音・演出処理 ==========
  if (isCorrect) {
    handleTypingSuccess(chosen, isComplete, inputBuffer);
  } else if (isMissed) {
    handleTypingMiss();
  }

  if (gs.typedCounter > 0 && gs.typedCounter > gs.typeMiss) {
    gs.correctTyping = gs.typedCounter - gs.typeMiss;
  } else {
    gs.correctTyping = 0;
  }

  console.log('タイプ回数', gs.typedCounter);
  console.log('ミス', gs.typeMiss);
  console.log('正答数', gs.correctTyping);
  console.log('コンボ', gs.combo);
});

/*====================
正解処理
====================*/

function handleTypingSuccess(chosen, isComplete, newBuffer) {
  const gs = gameState;
  const nextKana = gs.hiragana[gs.kanaIndex + 1]; // nextKanaを定義
  
  // 1. 状態と音の更新
  gs.currentTyping = newBuffer;
  gs.seType.currentTime = 0;
  gs.seType.playbackRate = 1.1;
  if(gs.sound) gs.seType.play();

  // 2. 表示更新
  if (gs.gameType === 'normal') {
    handleCorrect(chosen, isComplete, gs.kanaIndex);
  } else {
    quizHandleCorrect(gs.kanaIndex);
  }  
  
  // 3. コンボカウンターと100コンボ演出
  gs.typedCounter++;
  gs.combo++;
  if (gs.combo > gs.maxCombo) gs.maxCombo = gs.combo;

  // コンボ演出
  if (gs.combo >= 30) {
     $cFire.classList.remove('hidden-element'); 
  } else {
    $combo.textContent = gs.combo;
  }

  // 4. スコア更新
  gameScore();
  // updateBGM(); // ここで速度(playbackRate)も変更

  // 5. 文字完成時の「次への移動」ロジック
  if (isComplete) {
    // 最後の文字だった場合
    if (!nextKana) {
      setTimeout(() => {
        gs.stepUp = !gs.stepUp;
        console.log('gs.stepUp', gs.stepUp);
        gs.answerCount++;
        newTyping();
      }, 200);
    } else {
      // 次の文字へ
      gs.kanaIndex++;
      gs.currentTyping = '';
      gs.currentIndex++;
      // 判定文字以外はスキップ処理
      gs.kanaIndex = skip(gs.kanaIndex++);
    }    
  }
}

/*====================
ミスタイプ処理
====================*/

function handleTypingMiss() {
  const gs = gameState;

  // 1. ミス音を鳴らす
  gs.seMiss.volume = 0.4;
  gs.seMiss.currentTime = 0;
  if(gs.sound) gs.seMiss.play();

  // 2. 状態リセット
  gs.typeMiss++;
  gs.combo = 0;
  gs.cheered = false;

  // 3. 表示更新
  $cFire.classList.add('invisible-element');
  $combo.textContent = gs.combo;
  // updateBGM(); // BGMを通常（低速）に戻す
}

/*====================
正解時の色付け処理
====================*/

function handleCorrect(chosen, isComplete, idx) {
  const gs = gameState; // オブジェクト名短縮
  const chosenLength = chosen.length;
  const currentSpan = document.getElementById(`char${idx}`);
  // const ruby = document.getElementById(`rt${idx}`);
  if (!currentSpan) return;

  const letterSpans = currentSpan.querySelectorAll("span");
  
  
  // まず全色リセット
  letterSpans.forEach (span => span.classList.remove('completion'));
  for (let i = 0; i < chosenLength; i++) {
    letterSpans[i].textContent = chosen[i];
  }
  
  // 入力済み部分だけ黄色
  const typedLength = gs.currentTyping.length;
  for (let i = 0; i < typedLength; i++) {
    if (letterSpans[i]) letterSpans[i].classList.add('completion');
  }
  
  // 完了時は色付け
  if (isComplete) {
    // すべてのローマ字文字の色を黄色に設定
    completionColor(idx);
    letterSpans.forEach(span => span.classList.add('completion'));
    const rtSpan = document.getElementById(`rt-span${idx}`);
    if (rtSpan) rtSpan.classList.add('completion');

    // 表示されるローマ字を「chosen」の値に更新
    for (let i = 0; i < letterSpans.length; i++) {
      if (letterSpans[i]) {
        letterSpans[i].textContent = chosen[i] || "";
      }
    }
  }
}

function quizHandleCorrect(idx) {
  const gs = gameState; // オブジェクト名短縮
  const currentSpan = document.getElementById(`char${idx}`);
  currentSpan.textContent = currentSpan.textContent.toLocaleUpperCase();
  currentSpan.classList.remove('hidden-element');  
}

// 判定文字以外はスキップ処理
function skip(startIndex) {
  const gs = gameState; // オブジェクト名短縮
  let index = startIndex;

  while (index < gs.hiraganaLength) {
    const nextKana = gs.hiragana[index];
    const nextRomaji = kanaToRomaji[nextKana] || [];

    const firstChar = nextRomaji[0]?.[0];
    console.log('next',nextKana);

    if (gs.allowed.includes(nextKana)) {
      break;
    } else if (typeof firstChar === 'string' && firstChar.length > 0 && gs.allowed.includes(firstChar)) {
      break;
    } else {
      index++;
    }    
  }
  return index;
}

/* =========================
   用途部分の色付け
========================= */

function completionColor(num) {
  const gs = gameState; // オブジェクト名短縮
  
  // マッピングからDOM要素を取得
  const target = gs.domMapping[num];

  if (!target) return;

  // 1. ルビ（またはひらがな）を塗る
  if (target.rubySpan) {
    target.rubySpan.classList.add('completion-accent');
  }

  // 2. 漢字（親文字）を塗る
  if (target.kanjiSpan) {
    target.kanjiSpan.classList.add('completion-accent');
  }
}


/* =========================
   テーマ切替
========================= */

$theme.addEventListener('change', e => {
  document.body.className = 'theme-' + e.target.value;
  // saveSettings();  
  return;
});

// canvas用 CSSVar
function getCssVar(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/* =========================
   タイマー
========================= */

function startTimer() {

  const gs = gameState; // オブジェクト名短縮
  const dur = gs.duration;

  if (!dur || dur <= 0) { $time.textContent = '∞'; $timebar.style.width = '100%'; return; }

  const t0 = Date.now();
  $timebar.style.width = '100%';
  gs.timerId = setInterval(() => {
    if (!gs.playing || gs.paused) return;
    const elapsed = (Date.now() - t0) / 1000;
    const remain = Math.max(0, dur - elapsed);

    gs.wpm = Math.floor(gs.correctTyping / elapsed * 60 / 5);

    $time.textContent = Math.ceil(remain);
    const pct = Math.max(0, (remain / dur) * 100);
    $timebar.style.width = pct + '%';
    $combo.textContent = gs.combo;
    $wpm.textContent = gs.wpm;

    if (gs.wpm > 40) {
      $wFire.classList.remove('invisible-element');
    } else {
      $wFire.classList.add('invisible-element');
    }

    if (remain <= 0) {
      // endGame('時間切れ');
      stopTimer();
    }    
  }, 100);  
}

function stopTimer() {
  const gs = gameState; // オブジェクト名短縮
  if (gs.timerId) clearInterval(gs.timerId);
  gs.timerId = null;
  gs.playing = false;
  gemeEnd();
}


/* =========================
ゲームスタート
========================= */

$startBtn.addEventListener('click', playGame);
$retry.addEventListener('click', playGame);

function playGame() {  
  const gs = gameState; // オブジェクト名短縮
  if (gs.playing) return;
  gs.playing = true;
  
  $dur.disabled = true;
  $mode.disabled = true;
  $theme.disabled = true;

  $hamburger.classList.remove('is-active');
  $nav.classList.remove('is-active');
  $overlay.classList.remove('is-active');
  
  let countdownSeconds = 800;
  const t0 = Date.now();
  
  const timerId = setInterval(() => {
    const now = Date.now();
    const co = now - t0;
    console.log(co);
    
    const remain = Math.max(0, countdownSeconds - co);
    
    if (remain <= 0) {
      reset();
      newTyping();
      startTimer();
      $home.classList.add('hidden-element');
      $game.classList.remove('hidden-element');
      $end.classList.add('hidden-element');
      clearInterval(timerId);
    }
  }, 100);  
}

/* =========================
   ゲーム中断
========================= */

$TR.addEventListener('click', esc);

function esc() {  
  setTimeout(() => {
    reset();  
    stopTimer()
    $home.classList.remove('hidden-element');
    $game.classList.add('hidden-element');
    $end.classList.add('hidden-element');
    gameState.playing = false;
  }, 300);
}

/* =========================
   ゲーム初期設定
========================= */

function reset() {
  const gs = gameState; // オブジェクト名短縮
  gs.typedCounter = 0;
  gs.typeMiss = 0;
  gs.combo = 0;
  gs.maxCombo = 0;
  gs.wpm = 0;
  gs.score = 0;
  gs.stepUp = false;
 
  $time.textContent = gs.duration;
  $timebar.style.width = '100%';
  $combo.textContent = 0;
  $wpm.textContent = 0;
  $score.textContent = 0;
}

/* =========================
ゲームスコア
========================= */

function gameScore() {
  const gs = gameState; // オブジェクト名短縮
  let wpmBonus = Math.floor(gs.wpm / 40 * 1.2 * 10) / 10;
  if (wpmBonus < 1) wpmBonus = 1;
  const comboMultiplier = { 0: 1, 10: 1.5, 20: 1.6, 30: 1.8, 40: 1.8, 50: 1.9, 60: 1.9, 70: 1.9, 80: 2.0, 90: 2.0, 100: 2.4 };
  let value = Math.floor(gameState.combo / 10) * 10;
  if (value >= 100) value = 100;
  
  let com = comboMultiplier[value];
  gs.score = gs.score + Math.floor(30 * wpmBonus * com);
  $score.textContent = gs.score;
}

function gemeEnd() {
  $dur.disabled = false;
  $mode.disabled = false;
  $theme.disabled = false;
  $home.classList.add('hidden-element');
  $game.classList.add('hidden-element');
  $end.classList.remove('hidden-element');

  gameState.rate = gameState.correctTyping > 0 ? Math.floor(gameState.correctTyping / gameState.typedCounter * 1000) / 10 : '0';
  drawEndScreen()
}

// エンド画面　点数表示
function drawEndScreen() {
  const { canvas, ctx } = canvasAcquisition($EC);
  const text1 = '#FFFFFF';
  const text2 = getCssVar('--text-2');
  const shadow = getCssVar('--shadow');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.lineJoin = "round"; // 影のトゲを無くす
  ctx.lineCap = "round";

  ctx.fillStyle = text1;

  // ctx.font = "20px 'M PLUS Rounded 1c'";
  // ctx.fillText("スコア",  canvas.width / 2, 10);
  
  ctx.font = "80px 'M PLUS Rounded 1c'";
  ctx.lineWidth = 5; 
  ctx.strokeStyle = shadow;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeText(gameState.score.toLocaleString(),  canvas.width / 2,  32);
  ctx.fillText(gameState.score.toLocaleString(),  canvas.width / 2,  32);

  $eCor.textContent = gameState.correctTyping + ' key';
  $eMiss.textContent = gameState.typeMiss + ' key';
  $eRate.textContent = gameState.rate + ' %';
  $eWpm.textContent = gameState.wpm;
  $eCombo.textContent = gameState.maxCombo;

  if (gameState.gameType === 'quiz') {
    $eQuiz.textContent = `${gameState.answerCount} 問`
    $rec3Quiz.classList.remove('invisible-element');    
  } else {
    $rec3Quiz.classList.add('invisible-element'); 
  }
}

/* =========================
ハンバーガーメニュー
========================= */

$hamburger.addEventListener('click', () => {
  $hamburger.classList.toggle('is-active');
  $nav.classList.toggle('is-active');
  $overlay.classList.toggle('is-active');
});

$overlay.addEventListener('click', () => {
  $hamburger.classList.toggle('is-active');
  $nav.classList.toggle('is-active');
  $overlay.classList.toggle('is-active');
})






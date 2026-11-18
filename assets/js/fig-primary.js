/* ==========================================================================
   小课桌 · 1-3 年级基础互动图
   数学：数的组成、数线、乘法、测量、周长
   英语：字母、问候、颜色、家人、数量
   语文：拼音、偏旁、近反义词、段落中心
   ========================================================================== */
(function () {
  'use strict';

  var XK = window.XK;
  var s = XK.s;
  var h = XK.h;
  var fmt = XK.fmt;
  var C = {
    ink: '#1e232b', ink2: '#3d4552', mut: '#6b7280', faint: '#9aa1ab',
    line: '#c9c1b2', grid: '#e7e1d6', paper: '#fbf7ee',
    blue: '#2563eb', blueL: '#dbe6ff', blueF: '#eff4ff',
    gold: '#b88700', goldL: '#fff0bf',
    green: '#15803d', greenL: '#dcf0e2',
    red: '#c2410c', redL: '#fbe3d6'
  };

  function stage(host, vb, label) {
    var svg = s('svg', { viewBox: vb, role: 'img', 'aria-label': label });
    host.appendChild(svg);
    return svg;
  }

  function T(x, y, str, o) {
    o = o || {};
    return s('text', {
      x: x, y: y,
      fill: o.fill || C.ink,
      'font-size': o.size || 13,
      'text-anchor': o.anchor || 'middle',
      'font-weight': o.weight || 400,
      'font-family': o.mono ? 'ui-monospace,monospace' : null,
      'dominant-baseline': o.base || 'auto'
    }, str);
  }

  function box(host, attrs) {
    var el = h('div', {
      style: 'box-sizing:border-box;width:100%;max-width:520px;min-height:220px;display:flex;' +
        'flex-direction:column;justify-content:center;gap:14px;padding:20px;' +
        'border:1px solid #e7e1d6;border-radius:16px;background:#fbf7ee'
    });
    if (attrs && attrs.style) el.style.cssText += attrs.style;
    host.appendChild(el);
    return el;
  }

  /* ---------- 数学：十和一 ---------- */
  XK.figure('base10', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '成捆的小棒和零散小棒表示两位数');
    var g = s('g');
    svg.appendChild(g);
    var tens = 3, ones = 4;

    function draw() {
      XK.clear(g);
      g.appendChild(T(240, 28, tens + ' 个十 + ' + ones + ' 个一', { size: 15, weight: 700 }));

      var startX = 48, startY = 62, gapX = 48;
      for (var t = 0; t < tens; t++) {
        var x = startX + t * gapX, y = startY;
        g.appendChild(s('rect', { x: x, y: y, width: 42, height: 50, rx: 8, fill: '#fff', stroke: C.gold, 'stroke-width': 1.4 }));
        for (var i = 0; i < 10; i++) {
          g.appendChild(s('line', {
            x1: x + 5 + i * 3.5, y1: y + 8, x2: x + 5 + i * 3.5, y2: y + 42,
            stroke: C.gold, 'stroke-width': 1.8, 'stroke-linecap': 'round'
          }));
        }
        g.appendChild(T(x + 21, y + 64, '10', { size: 10.5, fill: C.mut }));
      }

      var oy = 145;
      g.appendChild(T(44, oy + 9, '还有', { size: 11, fill: C.mut, anchor: 'end' }));
      for (var j = 0; j < ones; j++) {
        g.appendChild(s('circle', {
          cx: 64 + j * 34, cy: oy, r: 9,
          fill: C.blueL, stroke: C.blue, 'stroke-width': 1.6
        }));
      }
      if (!ones) g.appendChild(T(92, oy + 4, '0 个一', { size: 11.5, fill: C.faint, anchor: 'start' }));
      g.appendChild(T(240, 286, '每十根捆成一捆；满十就再捆一捆', { size: 10.5, fill: C.faint }));
    }

    function update() {
      var n = tens * 10 + ones;
      ctx.set([
        { k: '这个数', v: String(n), big: true },
        { k: '读作', v: XK.readDigits(String(n)) },
        { k: '十位', v: tens + '，表示 ' + tens + ' 个十' },
        { k: '个位', v: ones + '，表示 ' + ones + ' 个一' },
        { k: '', eq: '十位上的1表示10，个位上的1表示1' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '十位：几捆十', min: 0, max: 9, value: tens,
      oninput: function (v) { tens = v; draw(); update(); }
    });
    XK.slider(ctx.controls, {
      label: '个位：几根一', min: 0, max: 9, value: ones,
      oninput: function (v) { ones = v; draw(); update(); }
    });

    draw(); update();
    return function () {};
  });

  /* ---------- 数学：数线加减 ---------- */
  XK.figure('numberline', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '一条从0到20的数线，表示加法和减法');
    var g = s('g');
    svg.appendChild(g);
    var start = 8, step = 5, op = '+';
    var x0 = 46, x1 = 434, y = 170;

    function px(n) { return x0 + (x1 - x0) * n / 20; }

    function draw() {
      XK.clear(g);
      var end = op === '+' ? start + step : start - step;
      g.appendChild(s('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: C.ink2, 'stroke-width': 2 }));
      for (var n = 0; n <= 20; n++) {
        var x = px(n);
        g.appendChild(s('line', { x1: x, y1: y - 8, x2: x, y2: y + 8, stroke: C.ink2, 'stroke-width': n % 5 === 0 ? 1.8 : 1 }));
        g.appendChild(T(x, y + 28, String(n), { size: n % 5 === 0 ? 11.5 : 10, fill: n % 5 === 0 ? C.ink2 : C.mut }));
      }

      var sx = px(start), ex = px(end);
      var color = op === '+' ? C.blue : C.red;
      g.appendChild(s('circle', { cx: sx, cy: y, r: 7, fill: '#fff', stroke: C.ink2, 'stroke-width': 2 }));
      g.appendChild(s('path', {
        d: 'M ' + (sx + (op === '+' ? 10 : -10)) + ' ' + (y - 44) +
          ' Q ' + ((sx + ex) / 2) + ' ' + (y - 92) + ' ' + ex + ' ' + (y - 55),
        fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round',
        'stroke-dasharray': '7 5'
      }));
      g.appendChild(s('circle', { cx: ex, cy: y, r: 10, fill: color, opacity: .9 }));
      g.appendChild(T(ex, y + 4, String(end), { size: 10.5, fill: '#fff', weight: 700 }));
      g.appendChild(T(240, 58, start + ' ' + (op === '+' ? '+' : '−') + ' ' + step + ' = ' + end, {
        size: 27, weight: 700, fill: color, mono: true
      }));
      g.appendChild(T(240, 254, op === '+' ? '加法向右走 ↑' : '减法向左走 ↑', { size: 12, fill: C.mut }));
    }

    function update() {
      var end = op === '+' ? start + step : start - step;
      ctx.set([
        { k: '起点', v: String(start), big: true },
        { k: op === '+' ? '向右走' : '向左走', v: step + ' 格' },
        { k: '结果', v: String(end), big: true },
        { k: '算式', v: start + ' ' + (op === '+' ? '+' : '−') + ' ' + step + ' = ' + end },
        { k: '', eq: op === '+' ? '加法往右，数变大' : '减法往左，数变小' }
      ]);
    }

    XK.toggles(ctx.controls, {
      label: '走法', value: op,
      options: [{ value: '+', label: '加法 →' }, { value: '-', label: '← 减法' }],
      onchange: function (v) {
        op = v;
        if (op === '-' && step > start) {
          step = start;
          stepS.set(step);
        }
        draw(); update();
      }
    });
    XK.slider(ctx.controls, {
      label: '从几出发', min: 0, max: 10, value: start,
      oninput: function (v) {
        start = v;
        if (op === '-' && step > start) {
          step = start;
          stepS.set(step);
        }
        draw(); update();
      }
    });
    var stepS = XK.slider(ctx.controls, {
      label: '走几格', min: 0, max: 10, value: step,
      oninput: function (v) {
        step = op === '-' ? Math.min(v, start) : v;
        if (op === '-' && v > start) stepS.set(start);
        draw(); update();
      }
    });

    draw(); update();
    return function () {};
  });

  /* ---------- 数学：乘法点阵 ---------- */
  XK.figure('multiplication', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '用点阵表示行数乘每行个数');
    var g = s('g');
    svg.appendChild(g);
    var rows = 4, cols = 3;

    function draw() {
      XK.clear(g);
      var cell = Math.min(38, 250 / Math.max(rows, cols));
      var w = cols * cell, hgt = rows * cell;
      var x0 = 240 - w / 2, y0 = 74;
      g.appendChild(s('rect', {
        x: x0 - 12, y: y0 - 12, width: w + 24, height: hgt + 24,
        rx: 14, fill: '#fff', stroke: C.grid, 'stroke-width': 1.4
      }));
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          g.appendChild(s('circle', {
            cx: x0 + c * cell + cell / 2, cy: y0 + r * cell + cell / 2,
            r: Math.max(5, cell * .22), fill: C.blue, opacity: .82
          }));
        }
      }
      g.appendChild(T(240, 36, rows + ' 行，每行 ' + cols + ' 个', { size: 15, weight: 700 }));
      g.appendChild(T(240, 278, rows + ' × ' + cols + ' = ' + rows * cols, {
        size: 23, weight: 700, fill: C.blue, mono: true
      }));
    }

    function update() {
      var reps = [];
      for (var i = 0; i < rows; i++) reps.push(cols);
      ctx.set([
        { k: '乘法算式', v: rows + ' × ' + cols + ' = ' + rows * cols, big: true },
        { k: '表示', v: rows + ' 个 ' + cols + ' 相加' },
        { k: '重复加法', v: reps.join(' + ') + ' = ' + rows * cols },
        { k: '交换后', v: cols + ' × ' + rows + ' = ' + rows * cols },
        { k: '', eq: '交换两个因数的位置，积不变' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '排成几行', min: 1, max: 6, value: rows,
      oninput: function (v) { rows = v; draw(); update(); }
    });
    XK.slider(ctx.controls, {
      label: '每行几个', min: 1, max: 6, value: cols,
      oninput: function (v) { cols = v; draw(); update(); }
    });

    draw(); update();
    return function () {};
  });

  /* ---------- 数学：厘米尺 ---------- */
  XK.figure('measure', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '从0刻度开始测量物体长度');
    var g = s('g');
    svg.appendChild(g);
    var len = 7;

    function draw() {
      XK.clear(g);
      var x0 = 38, y = 190, unit = 39.5;
      g.appendChild(s('rect', { x: x0 - 8, y: y, width: unit * 10 + 16, height: 66, rx: 7, fill: '#fff8dc', stroke: '#c6a84b', 'stroke-width': 1.5 }));
      for (var i = 0; i <= 50; i++) {
        var x = x0 + i * unit / 5;
        var major = i % 5 === 0;
        g.appendChild(s('line', {
          x1: x, y1: y, x2: x, y2: y + (major ? 18 : i % 5 === 0 ? 14 : 9),
          stroke: major ? C.ink2 : C.faint, 'stroke-width': major ? 1.4 : 1
        }));
        if (major) g.appendChild(T(x, y + 34, String(i / 5), { size: 10, fill: C.mut }));
      }
      g.appendChild(T(38, 236, 'cm', { size: 11, fill: C.mut, anchor: 'start' }));

      var ex = x0 + len * unit;
      g.appendChild(s('rect', { x: x0, y: 104, width: len * unit, height: 42, rx: 21, fill: C.blueL, stroke: C.blue, 'stroke-width': 1.8 }));
      g.appendChild(T(x0 + len * unit / 2, 130, len + ' 厘米', { size: 14, weight: 700, fill: C.blue }));
      g.appendChild(s('line', { x1: ex, y1: 98, x2: ex, y2: 220, stroke: C.red, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }));
      g.appendChild(T(ex, 82, '终点', { size: 10.5, fill: C.red }));
      g.appendChild(T(x0, 82, '0刻度', { size: 10.5, fill: C.ink2 }));
    }

    function update() {
      ctx.set([
        { k: '量得长度', v: len + ' 厘米', big: true },
        { k: '换成毫米', v: len * 10 + ' 毫米' },
        { k: '换成米', v: fmt(len / 100, 2) + ' 米' },
        { k: '进率', v: '1米 = 100厘米 = 1000毫米' },
        { k: '', eq: '量长度时，物体一端要对准直尺的0刻度' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '物体长度', min: 1, max: 10, value: len, unit: ' 厘米',
      oninput: function (v) { len = v; draw(); update(); }
    });
    draw(); update();
    return function () {};
  });

  /* ---------- 数学：长方形周长 ---------- */
  XK.figure('perimeter', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '可以改变长和宽的长方形，外框表示周长');
    var g = s('g');
    svg.appendChild(g);
    var L = 6, W = 3;

    function draw() {
      XK.clear(g);
      var u = Math.min(310 / L, 120 / W);
      var w = L * u, hgt = W * u;
      var x = 240 - w / 2, y = 122 - hgt / 2;
      g.appendChild(s('rect', {
        x: x, y: y, width: w, height: hgt, rx: 4,
        fill: C.blueF, stroke: C.blue, 'stroke-width': 3
      }));
      g.appendChild(T(x + w / 2, y - 14, L + ' 厘米', { size: 12.5, weight: 700, fill: C.blue }));
      g.appendChild(T(x + w / 2, y + hgt + 27, L + ' 厘米', { size: 12.5, weight: 700, fill: C.blue }));
      g.appendChild(T(x - 20, y + hgt / 2, W + ' 厘米', { size: 12.5, weight: 700, fill: C.blue, anchor: 'end' }));
      g.appendChild(T(x + w + 20, y + hgt / 2, W + ' 厘米', { size: 12.5, weight: 700, fill: C.blue, anchor: 'start' }));
      g.appendChild(T(240, 250, '沿蓝色边框走一周 = 周长', { size: 11.5, fill: C.mut }));
      g.appendChild(T(240, 278, (L === W ? '四条边一样长，这是正方形' : '对边相等，两个长 + 两个宽'), {
        size: 10.5, fill: L === W ? C.green : C.faint
      }));
    }

    function update() {
      var P = 2 * (L + W);
      ctx.set([
        { k: '算式', v: '(' + L + ' + ' + W + ') × 2 = ' + P, big: true },
        { k: '四条边相加', v: L + ' + ' + W + ' + ' + L + ' + ' + W + ' = ' + P },
        { k: '周长', v: P + ' 厘米' },
        { k: '图形', v: L === W ? '正方形，还可以用边长 × 4' : '长方形' },
        { k: '', eq: '周长单位是长度单位，不是面积单位' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '长', min: 2, max: 10, value: L, unit: ' 厘米',
      oninput: function (v) { L = v; draw(); update(); }
    });
    XK.slider(ctx.controls, {
      label: '宽', min: 1, max: 8, value: W, unit: ' 厘米',
      oninput: function (v) { W = v; draw(); update(); }
    });
    draw(); update();
    return function () {};
  });

  /* ---------- 英语：低年级场景 ---------- */
  XK.figure('starter', function (ctx) {
    var state = (ctx.cfg && ctx.cfg.state) || {};
    var scene = state.scene || 'alphabet';

    if (scene === 'alphabet') {
      var letters = [
        ['A', 'a', 'apple', '/æ/', true], ['B', 'b', 'ball', '/b/', false],
        ['C', 'c', 'cat', '/k/', false], ['D', 'd', 'dog', '/d/', false],
        ['E', 'e', 'egg', '/e/', true], ['F', 'f', 'fish', '/f/', false],
        ['G', 'g', 'goat', '/g/', false], ['H', 'h', 'hat', '/h/', false],
        ['I', 'i', 'ink', '/ɪ/', true], ['J', 'j', 'jam', '/dʒ/', false],
        ['K', 'k', 'kite', '/k/', false], ['L', 'l', 'lion', '/l/', false],
        ['M', 'm', 'map', '/m/', false], ['N', 'n', 'nose', '/n/', false],
        ['O', 'o', 'orange', '/ɒ/', true], ['P', 'p', 'pen', '/p/', false],
        ['Q', 'q', 'queen', '/kw/', false], ['R', 'r', 'red', '/r/', false],
        ['S', 's', 'sun', '/s/', false], ['T', 't', 'tree', '/t/', false],
        ['U', 'u', 'umbrella', '/ʌ/', true], ['V', 'v', 'van', '/v/', false],
        ['W', 'w', 'water', '/w/', false], ['X', 'x', 'box', '/ks/', false],
        ['Y', 'y', 'yes', '/j/', false], ['Z', 'z', 'zoo', '/z/', false]
      ];
      var svg = stage(ctx.stage, '0 0 480 300', '字母大小写与例词');
      var g = s('g');
      svg.appendChild(g);
      var idx = 0;

      function draw() {
        XK.clear(g);
        var d = letters[idx];
        g.appendChild(s('rect', { x: 62, y: 44, width: 180, height: 174, rx: 22, fill: '#fff', stroke: C.grid, 'stroke-width': 1.5 }));
        g.appendChild(T(152, 136, d[0] + ' ' + d[1], { size: 72, weight: 700, fill: ctx.tone || C.red }));
        g.appendChild(s('rect', { x: 270, y: 62, width: 150, height: 140, rx: 16, fill: C.redL, stroke: C.grid }));
        g.appendChild(T(345, 103, '例词', { size: 11, fill: C.mut }));
        g.appendChild(T(345, 139, d[2], { size: 24, weight: 700, fill: C.ink }));
        g.appendChild(T(345, 172, '常见音 ' + d[3], { size: 13, fill: C.red }));
        g.appendChild(T(240, 266, '第 ' + (idx + 1) + ' 个字母 / 共 26 个', { size: 11, fill: C.faint }));
      }

      function update() {
        var d = letters[idx];
        ctx.set([
          { k: '大写 / 小写', v: d[0] + ' / ' + d[1], big: true },
          { k: '例词', v: d[2] },
          { k: '常见音', v: d[3] },
          { k: '字母类型', v: d[4] ? '元音字母' : '辅音字母' },
          { k: '', eq: '字母名称和它在单词里的发音不是一回事' }
        ]);
      }

      XK.slider(ctx.controls, {
        label: '翻到第几个', min: 0, max: 25, value: 0,
        format: function (v) { return letters[v][0]; },
        oninput: function (v) { idx = v; draw(); update(); }
      });
      draw(); update();
      return function () {};
    }

    if (scene === 'greetings') {
      var dialogs = {
        morning: ['Good morning!', 'Good morning! What\'s your name?', 'My name is Lily. Nice to meet you.'], 
        afternoon: ['Good afternoon!', 'Good afternoon! How are you?', 'I\'m fine, thank you.'], 
        night: ['Good night, Mum.', 'Good night. Sleep well.', 'Good night.']
      };
      var mode = 'morning';
      var g2 = s('g');
      stage(ctx.stage, '0 0 480 300', '不同场景的英语问候对话').appendChild(g2);

      function drawDialog() {
        XK.clear(g2);
        var lines = dialogs[mode];
        g2.appendChild(T(240, 32, mode === 'morning' ? '早上见面' : mode === 'afternoon' ? '下午见面' : '睡前道别', { size: 13, weight: 700 }));
        lines.forEach(function (line, i) {
          var x = i % 2 ? 272 : 62;
          var w = i % 2 ? 178 : 206;
          g2.appendChild(s('rect', {
            x: x, y: 58 + i * 72, width: w, height: 52, rx: 16,
            fill: i % 2 ? C.redL : '#fff', stroke: C.grid, 'stroke-width': 1.3
          }));
          g2.appendChild(T(x + 13, 90 + i * 72, line, {
            size: 11.5, fill: C.ink2, anchor: 'start'
          }));
        });
      }

      function updateDialog() {
        ctx.set([
          { k: '问候', v: dialogs[mode][0], big: true },
          { k: '问名字', v: "What's your name?" },
          { k: '回答', v: 'My name is …' },
          { k: '', eq: 'Good night 是晚上道别，不是晚上见面问候' }
        ]);
      }

      XK.toggles(ctx.controls, {
        label: '换场景', value: mode,
        options: [{ value: 'morning', label: '早上' }, { value: 'afternoon', label: '下午' }, { value: 'night', label: '睡前' }],
        onchange: function (v) { mode = v; drawDialog(); updateDialog(); }
      });
      drawDialog(); updateDialog();
      return function () {};
    }

    if (scene === 'colors') {
      var colors = [
        ['red', '#dc2626', '红色'], ['blue', '#2563eb', '蓝色'],
        ['yellow', '#eab308', '黄色'], ['green', '#15803d', '绿色'],
        ['orange', '#ea580c', '橙色'], ['black', '#1e232b', '黑色'],
        ['white', '#ffffff', '白色'], ['brown', '#8b5a2b', '棕色']
      ];
      var picked = 0;
      var host = box(ctx.stage, { style: 'min-height:250px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px' });

      function drawColors() {
        XK.clear(host);
        colors.forEach(function (c, i) {
          var sw = h('button', {
            type: 'button',
            'aria-label': c[0] + ' ' + c[2],
            style: 'min-height:82px;border-radius:14px;cursor:pointer;border:3px solid ' +
              (i === picked ? (ctx.tone || C.red) : '#d8d1c5') + ';background:' + c[1] +
              ';color:' + (c[0] === 'white' ? '#1e232b' : '#fff') + ';font-weight:700;font-size:13px'
          }, c[0]);
          sw.addEventListener('click', function () { picked = i; drawColors(); updateColors(); });
          host.appendChild(sw);
        });
      }

      function updateColors() {
        var c = colors[picked];
        ctx.set([
          { k: '问题', v: 'What colour is it?' },
          { k: '回答', v: "It's " + c[0] + '.', big: true },
          { k: '中文', v: c[2] },
          { k: '放进短语', v: 'a ' + c[0] + ' object' },
          { k: '', eq: '颜色词放在名词前面' }
        ]);
      }

      XK.toggles(ctx.controls, {
        label: '选颜色', value: 0,
        options: colors.map(function (c, i) { return { value: i, label: c[0] }; }),
        onchange: function (v) { picked = +v; drawColors(); updateColors(); }
      });
      drawColors(); updateColors();
      return function () {};
    }

    if (scene === 'family') {
      var family = [
        ['father', '爸爸', 'he', 'He is my father.'],
        ['mother', '妈妈', 'she', 'She is my mother.'],
        ['brother', '兄弟', 'he', 'He is my brother.'],
        ['sister', '姐妹', 'she', 'She is my sister.'],
        ['grandfather', '爷爷 / 外公', 'he', 'He is my grandfather.'],
        ['grandmother', '奶奶 / 外婆', 'she', 'She is my grandmother.']
      ];
      var who = 0;
      var g3 = s('g');
      stage(ctx.stage, '0 0 480 300', '家人照片与he、she的选择').appendChild(g3);

      function drawFamily() {
        XK.clear(g3);
        var p = family[who];
        var color = p[2] === 'he' ? C.blue : C.red;
        g3.appendChild(s('circle', { cx: 160, cy: 135, r: 64, fill: color === C.blue ? C.blueL : C.redL, stroke: color, 'stroke-width': 2 }));
        g3.appendChild(s('circle', { cx: 160, cy: 112, r: 21, fill: '#fff', stroke: color, 'stroke-width': 2 }));
        g3.appendChild(s('path', { d: 'M 120 185 Q 160 134 200 185', fill: '#fff', stroke: color, 'stroke-width': 2 }));
        g3.appendChild(T(286, 80, "Who's " + p[2] + '?', { size: 14, weight: 700, anchor: 'start' }));
        g3.appendChild(s('rect', { x: 280, y: 102, width: 150, height: 54, rx: 14, fill: '#fff', stroke: C.grid }));
        g3.appendChild(T(355, 135, p[2] + "'s my " + p[0], { size: 11.5, fill: color }));
        g3.appendChild(T(240, 252, p[1], { size: 16, weight: 700, fill: color }));
      }

      function updateFamily() {
        var p = family[who];
        ctx.set([
          { k: '家人', v: p[0] + '（' + p[1] + '）', big: true },
          { k: '人称代词', v: p[2] },
          { k: '问句', v: "Who's " + p[2] + '?' },
          { k: '回答', v: p[3] },
          { k: '', eq: '男性用he，女性用she' }
        ]);
      }

      XK.toggles(ctx.controls, {
        label: '看照片', value: 0,
        options: family.map(function (p, i) { return { value: i, label: p[1] }; }),
        onchange: function (v) { who = +v; drawFamily(); updateFamily(); }
      });
      drawFamily(); updateFamily();
      return function () {};
    }

    var words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
    var count = 12;
    var g4 = s('g');
    stage(ctx.stage, '0 0 480 300', '可以数数量的20个以内的圆点').appendChild(g4);

    function drawCount() {
      XK.clear(g4);
      for (var i = 0; i < count; i++) {
        var r = Math.floor(i / 5), c = i % 5;
        g4.appendChild(s('circle', {
          cx: 112 + c * 64, cy: 70 + r * 48, r: 13,
          fill: i % 2 ? C.goldL : C.redL, stroke: i % 2 ? C.gold : C.red, 'stroke-width': 1.7
        }));
      }
      g4.appendChild(T(240, 278, 'How many balls?', { size: 15, weight: 700, fill: ctx.tone || C.red }));
    }

    function updateCount() {
      ctx.set([
        { k: '数量', v: String(count), big: true },
        { k: '英语', v: words[count] },
        { k: '完整回答', v: words[count].charAt(0).toUpperCase() + words[count].slice(1) + ' balls.' },
        { k: '', eq: 'How many 后面通常接复数名词' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '小球数量', min: 1, max: 20, value: count,
      oninput: function (v) { count = v; drawCount(); updateCount(); }
    });
    drawCount(); updateCount();
    return function () {};
  });

  /* ---------- 语文：拼音 ---------- */
  XK.figure('pinyin', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '声母、韵母和声调组合成音节');
    var g = s('g');
    svg.appendChild(g);
    var DATA = [
      { i: 'm', f: 'a', p: 'mā', z: '妈', tone: '第一声' },
      { i: 'm', f: 'a', p: 'má', z: '麻', tone: '第二声' },
      { i: 'm', f: 'a', p: 'mǎ', z: '马', tone: '第三声' },
      { i: 'm', f: 'a', p: 'mà', z: '骂', tone: '第四声' },
      { i: 'b', f: 'a', p: 'bā', z: '八', tone: '第一声' },
      { i: 'b', f: 'a', p: 'bá', z: '拔', tone: '第二声' },
      { i: 'b', f: 'a', p: 'bà', z: '爸', tone: '第四声' },
      { i: 'l', f: 'ù', p: 'lù', z: '路', tone: '第四声' }
    ];
    var idx = 0;

    function draw() {
      XK.clear(g);
      var d = DATA[idx];
      var cards = [
        { x: 38, label: '声母', text: d.i, color: C.blue, soft: C.blueL },
        { x: 184, label: '韵母', text: d.f, color: C.gold, soft: C.goldL },
        { x: 330, label: '音节', text: d.p, color: C.red, soft: C.redL }
      ];
      cards.forEach(function (c, i) {
        g.appendChild(s('rect', { x: c.x, y: 74, width: 112, height: 92, rx: 16, fill: c.soft, stroke: c.color, 'stroke-width': 1.8 }));
        g.appendChild(T(c.x + 56, 101, c.label, { size: 11, fill: C.mut }));
        g.appendChild(T(c.x + 56, 145, c.text, { size: 32, weight: 700, fill: c.color }));
        if (i < 2) g.appendChild(T(c.x + 128, 132, '+', { size: 24, weight: 700, fill: C.faint }));
      });
      g.appendChild(T(240, 211, d.z + ' · ' + d.tone, { size: 16, weight: 700 }));
      g.appendChild(T(240, 260, '前音轻短，后音重，两音相连猛一碰', { size: 11, fill: C.faint }));
    }

    function update() {
      var d = DATA[idx];
      ctx.set([
        { k: '音节', v: d.p, big: true },
        { k: '拼法', v: d.i + ' + ' + d.f + ' = ' + d.p },
        { k: '声调', v: d.tone },
        { k: '对应汉字', v: d.z },
        { k: '', eq: '同样的声母、韵母，声调不同，字也可能不同' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '换一个音节', min: 0, max: DATA.length - 1, value: 0,
      format: function (v) { return DATA[v].p; },
      oninput: function (v) { idx = v; draw(); update(); }
    });
    draw(); update();
    return function () {};
  });

  /* ---------- 语文：汉字部件 ---------- */
  XK.figure('hanzi', function (ctx) {
    var svg = stage(ctx.stage, '0 0 480 300', '汉字由不同部件组成');
    var g = s('g');
    svg.appendChild(g);
    var DATA = [
      { ch: '明', a: '日', b: '月', hint: '日月都有光，合起来表示明亮。', type: '左右结构' },
      { ch: '林', a: '木', b: '木', hint: '两棵树挨在一起，表示树林。', type: '左右结构' },
      { ch: '河', a: '氵', b: '可', hint: '三点水提示和水有关。', type: '左右结构' },
      { ch: '休', a: '亻', b: '木', hint: '人靠在树旁休息。', type: '左右结构' },
      { ch: '尖', a: '小', b: '大', hint: '上面小、下面大，像尖尖的形状。', type: '上下结构' }
    ];
    var idx = 0;

    function draw() {
      XK.clear(g);
      var d = DATA[idx];
      g.appendChild(s('rect', { x: 62, y: 56, width: 138, height: 138, rx: 20, fill: '#fff', stroke: C.green, 'stroke-width': 2 }));
      g.appendChild(T(131, 157, d.ch, { size: 84, weight: 700, fill: C.green }));
      g.appendChild(T(131, 224, d.type, { size: 12, fill: C.mut }));
      g.appendChild(T(266, 88, '拆成两个部件', { size: 11, fill: C.mut }));
      [d.a, d.b].forEach(function (part, i) {
        g.appendChild(s('rect', {
          x: 256 + i * 76, y: 108, width: 66, height: 66, rx: 11,
          fill: C.greenL, stroke: C.green, 'stroke-width': 1.5
        }));
        g.appendChild(T(289 + i * 76, 153, part, { size: 29, weight: 700, fill: C.green }));
      });
      g.appendChild(T(317, 207, d.a + ' + ' + d.b + ' → ' + d.ch, { size: 14, weight: 700 }));
    }

    function update() {
      var d = DATA[idx];
      ctx.set([
        { k: '汉字', v: d.ch, big: true },
        { k: '部件', v: d.a + ' + ' + d.b },
        { k: '结构', v: d.type },
        { k: '记忆提示', v: d.hint },
        { k: '', eq: '偏旁常提示字义，但遇到新字还要查字典确认' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '换一个汉字', min: 0, max: DATA.length - 1, value: 0,
      format: function (v) { return DATA[v].ch; },
      oninput: function (v) { idx = v; draw(); update(); }
    });
    draw(); update();
    return function () {};
  });

  /* ---------- 语文：近义词与反义词 ---------- */
  XK.figure('wordpair', function (ctx) {
    var host = box(ctx.stage, { style: 'min-height:250px' });
    var DATA = [
      { w: '高兴', syn: '快乐', ant: '难过', ex: '我今天很高兴。' },
      { w: '美丽', syn: '漂亮', ant: '丑陋', ex: '花园真美丽。' },
      { w: '安静', syn: '宁静', ant: '热闹', ex: '图书馆里很安静。' },
      { w: '寒冷', syn: '严寒', ant: '炎热', ex: '冬天的风很寒冷。' }
    ];
    var idx = 0;

    function draw() {
      XK.clear(host);
      var d = DATA[idx];
      var top = h('div', { style: 'text-align:center;font-size:34px;font-weight:800;color:' + C.ink }, d.w);
      host.appendChild(top);
      var row = h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:12px' });
      [
        ['近义词', d.syn, C.blue, C.blueL],
        ['反义词', d.ant, C.red, C.redL]
      ].forEach(function (x) {
        row.appendChild(h('div', {
          style: 'padding:15px;border:1.5px solid ' + x[2] + ';border-radius:14px;background:' + x[3] + ';text-align:center'
        }, h('div', { style: 'font-size:11px;color:' + C.mut + ';margin-bottom:7px' }, x[0]),
          h('b', { style: 'font-size:24px;color:' + x[2] }, x[1])));
      });
      host.appendChild(row);
      host.appendChild(h('div', { style: 'text-align:center;font-size:13px;color:' + C.mut }, '例句：' + d.ex));
    }

    function update() {
      var d = DATA[idx];
      ctx.set([
        { k: '词语', v: d.w, big: true },
        { k: '近义词', v: d.syn },
        { k: '反义词', v: d.ant },
        { k: '例句', v: d.ex },
        { k: '', eq: '近义词意思相近，反义词意思相反；换词后要读一读句子' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '换一组词语', min: 0, max: DATA.length - 1, value: 0,
      format: function (v) { return DATA[v].w; },
      oninput: function (v) { idx = v; draw(); update(); }
    });
    draw(); update();
    return function () {};
  });

  /* ---------- 语文：段落中心句 ---------- */
  XK.figure('paragraph', function (ctx) {
    var host = box(ctx.stage, { style: 'min-height:265px;justify-content:flex-start' });
    var DATA = [
      {
        text: '操场真热闹。有人在跑步，有人在跳绳，还有人踢足球。',
        center: '操场真热闹。',
        pos: '段首',
        why: '第一句先总说，后面的句子都在举例说明怎样热闹。'
      },
      {
        text: '花园里有红红的花，有绿绿的草，还有飞舞的蝴蝶。花园真美啊！',
        center: '花园真美啊！',
        pos: '段尾',
        why: '前面分别写花、草、蝴蝶，最后一句总结共同特点。'
      },
      {
        text: '小蚂蚁找来一片树叶，拖到洞口，又把食物放在树叶上。它真会想办法。',
        center: '它真会想办法。',
        pos: '段尾',
        why: '前面写具体做法，最后一句评价小蚂蚁会想办法。'
      }
    ];
    var idx = 0;

    function draw() {
      XK.clear(host);
      var d = DATA[idx];
      host.appendChild(h('div', { style: 'font-size:11px;letter-spacing:.08em;color:' + C.faint }, '先遮住中心句，试着概括'));
      var p = h('div', {
        style: 'font-size:16px;line-height:2;text-align:left;color:' + C.ink +
          ';background:#fff;border:1px solid ' + C.grid + ';border-radius:13px;padding:16px 18px'
      });
      var i = d.text.indexOf(d.center);
      if (i >= 0) {
        p.appendChild(document.createTextNode(d.text.slice(0, i)));
        p.appendChild(h('mark', {
          style: 'padding:2px 4px;border-radius:5px;background:' + C.greenL + ';color:' + C.green + ';font-weight:700'
        }, d.center));
        p.appendChild(document.createTextNode(d.text.slice(i + d.center.length)));
      } else {
        p.textContent = d.text;
      }
      host.appendChild(p);
      host.appendChild(h('div', { style: 'display:flex;gap:10px;align-items:center;font-size:12px;color:' + C.mut },
        h('b', { style: 'color:' + C.green }, '中心句在' + d.pos),
        h('span', {}, d.why)
      ));
    }

    function update() {
      var d = DATA[idx];
      ctx.set([
        { k: '这段主要写', v: d.center, big: true },
        { k: '中心句位置', v: d.pos },
        { k: '为什么', v: d.why },
        { k: '', eq: '中心句要能概括整段，而不是只概括一个细节' }
      ]);
    }

    XK.slider(ctx.controls, {
      label: '换一段话', min: 0, max: DATA.length - 1, value: 0,
      format: function (v) { return '第 ' + (v + 1) + ' 段'; },
      oninput: function (v) { idx = v; draw(); update(); }
    });
    draw(); update();
    return function () {};
  });

})();

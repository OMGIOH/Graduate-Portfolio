(function () {
    'use strict';

    document.documentElement.classList.add('no-scroll');

    /* ================================================================
       Terminal Typing
       ================================================================ */
    var terminal = document.getElementById('terminal');
    var lines = [
        [{ t: '// Oliver Huang — Graduate Portfolio', c: 'syn-comment' }],
        [{ t: '// (C) 2025 Oliver Huang. All rights reserved.', c: 'syn-comment' }],
        [],
        [
            { t: 'C', c: 'syn-path' },
            { t: ':', c: 'syn-punct' },
            { t: '\\', c: 'syn-punct' },
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: 'cd', c: 'syn-cmd' },
            { t: ' ', c: '' },
            { t: 'Graduate Portfolio', c: 'syn-string' }
        ],
        [
            { t: 'C', c: 'syn-path' },
            { t: ':', c: 'syn-punct' },
            { t: '\\', c: 'syn-punct' },
            { t: 'Graduate-Portfolio', c: 'syn-path' },
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: 'oliver', c: 'syn-func' },
            { t: '.', c: 'syn-punct' },
            { t: 'exe', c: 'syn-string' }
        ],
        [
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: 'loading', c: 'syn-cmd' },
            { t: ' ', c: '' },
            { t: 'resources', c: 'syn-func' },
            { t: '...................', c: 'syn-punct' },
            { t: '[ok]', c: 'ok' }
        ],
        [
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: 'loading', c: 'syn-cmd' },
            { t: ' ', c: '' },
            { t: 'fonts', c: 'syn-func' },
            { t: '.......................', c: 'syn-punct' },
            { t: '[ok]', c: 'ok' }
        ],
        [
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: 'building', c: 'syn-cmd' },
            { t: ' ', c: '' },
            { t: 'layout', c: 'syn-func' },
            { t: '.....................', c: 'syn-punct' },
            { t: '[ok]', c: 'ok' }
        ],
        [
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: 'ready', c: 'syn-func' },
            { t: '.', c: 'syn-punct' }
        ],
        [
            { t: 'C', c: 'syn-path' },
            { t: ':', c: 'syn-punct' },
            { t: '\\', c: 'syn-punct' },
            { t: 'Graduate-Portfolio', c: 'syn-path' },
            { t: '>', c: 'syn-punct' },
            { t: ' ', c: '' },
            { t: '_', c: 'terminal-cursor' }
        ]
    ];

    var currentLine = 0;
    var currentToken = 0;
    var currentChar = 0;
    var typingSpeed = 1;
    var currentLineEl = null;
    var currentSpan = null;

    function typeNext() {
        if (currentLine >= lines.length) { onTypingDone(); return; }

        var tokens = lines[currentLine];

        if (currentToken === 0 && currentChar === 0) {
            currentLineEl = document.createElement('div');
            currentLineEl.className = 'terminal-line';
            terminal.appendChild(currentLineEl);
        }

        if (currentToken < tokens.length) {
            var tk = tokens[currentToken];
            if (currentChar === 0) {
                currentSpan = document.createElement('span');
                if (tk.c) currentSpan.className = tk.c;
                currentLineEl.appendChild(currentSpan);
            }
            if (currentChar < tk.t.length) {
                currentSpan.appendChild(document.createTextNode(tk.t[currentChar]));
                currentChar++;
                setTimeout(typeNext, typingSpeed);
            } else {
                currentToken++;
                currentChar = 0;
                typeNext();
            }
        } else {
            currentLine++;
            currentToken = 0;
            currentChar = 0;
            if (currentLine < lines.length) {
                setTimeout(typeNext, 50);
            } else {
                onTypingDone();
            }
        }
    }

    setTimeout(typeNext, 300);

    /* ================================================================
       After Typing: Pixel Off → Starfield → START Button
       ================================================================ */
    var typingDone = false;

    function sleep(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    async function onTypingDone() {
        if (typingDone) return;
        typingDone = true;

        var winWindow = document.getElementById('win-window');

        await sleep(400);

        await new Promise(function (resolve) {
            winWindow.addEventListener('animationend', resolve, { once: true });
            winWindow.classList.add('pixel-off');
        });

        winWindow.style.display = 'none';

        var welcome = document.getElementById('welcome-screen');
        welcome.classList.add('show');

        await sleep(1800);
        welcome.classList.add('fade-out');

        await sleep(800);
        welcome.style.display = 'none';
        initStarfield();
        initComet();

        await sleep(400);
        document.getElementById('hero-name').classList.add('visible');

        await sleep(800);
        document.getElementById('hero-sub').classList.add('visible');

        await sleep(600);
        var sh = document.getElementById('scroll-hint');
        sh.style.opacity = '1';
        sh.style.pointerEvents = '';
        sh.style.visibility = '';

        document.documentElement.classList.remove('no-scroll');
    }

    /* ================================================================
       Dot Cloud Sphere — pixel dots + text labels on canvas
       ================================================================ */
    var sphereCanvas = document.getElementById('pixel-sphere');
    var sphereCtx = sphereCanvas ? sphereCanvas.getContext('2d') : null;
    var pixelBg = getComputedStyle(document.documentElement).getPropertyValue('--pixel-bg').trim();
    var sphereRotY = 0;
    var sphereRotX = -0.3;
    var sphereAutoSpin = true;
    var sphereDragging = false;
    var sphereVelY = 0;
    var sphereVelX = 0;
    var sphereLastX = 0;
    var sphereLastY = 0;
    var sphereDpr = window.devicePixelRatio || 1;

    var sphereLabels = [
        { text: 'Unity',       color: '#ff6b6b' },
        { text: 'Unreal',      color: '#00e5ff' },
        { text: 'Godot',       color: '#ffd166' },
        { text: 'Python',      color: '#06ffa5' },
        { text: 'SQL',         color: '#bf00ff' },
        { text: 'JavaScript',  color: '#ff6600' },
        { text: 'CSS',         color: '#f72585' },
        { text: 'HTML',        color: '#00ff88' },
        { text: 'Transformer', color: '#00d4ff' },
        { text: 'LangChain',   color: '#f15bb5' },
        { text: 'LSTM',        color: '#ffd60a' },
        { text: 'PyTorch',     color: '#ff00cc' },
        { text: 'LlamaIndex',  color: '#00ffcc' },
        { text: 'Embedding',   color: '#f94144' },
        { text: 'Codex',       color: '#7fff00' },
        { text: 'Node.js',     color: '#ff4400' },
        { text: 'C++',         color: '#0088ff' },
        { text: 'C#',          color: '#4488ff' },
        { text: 'Git',         color: '#9900ff' },
        { text: 'PyCharm',     color: '#e63946' },
        { text: 'MySQL',       color: '#ff006e' },
        { text: 'Trae',        color: '#cc00ff' },
        { text: 'AIGC',        color: '#00eaff' }
    ];

    var sphereDots = [];
    var sphereLabelPts = [];
    var sphereHoverIdx = -1;
    var sphereMouseX = -1;
    var sphereMouseY = -1;

    var dotProjSX, dotProjSY, dotProjAlpha, dotProjSize, dotProjZ;
    var dotOrder;
    var sphereLabelRender = [];

    function buildSpherePoints() {
        sphereDots = [];
        var dotCount = 3000;
        dotProjSX = new Float32Array(dotCount);
        dotProjSY = new Float32Array(dotCount);
        dotProjAlpha = new Float32Array(dotCount);
        dotProjSize = new Float32Array(dotCount);
        dotProjZ = new Float32Array(dotCount);
        dotOrder = new Int32Array(dotCount);
        var golden = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < dotCount; i++) {
            var y = 1 - (i / (dotCount - 1)) * 2;
            var r = Math.sqrt(1 - y * y);
            var theta = golden * i;
            sphereDots.push({
                x: Math.cos(theta) * r,
                y: y,
                z: Math.sin(theta) * r
            });
        }

        sphereLabelPts = [];
        var ln = sphereLabels.length;
        var lg = Math.PI * (3 - Math.sqrt(5));
        for (var j = 0; j < ln; j++) {
            var ly = 1 - (j / (ln - 1)) * 2;
            var lr = Math.sqrt(1 - ly * ly);
            var lt = lg * j;
            sphereLabelPts.push({
                x: Math.cos(lt) * lr,
                y: ly,
                z: Math.sin(lt) * lr,
                text: sphereLabels[j].text,
                color: sphereLabels[j].color,
                baseWidth: 0
            });
        }
    }

    function cacheLabelWidths() {
        if (!sphereCtx) return;
        sphereCtx.font = '100px "VT323", monospace';
        for (var i = 0; i < sphereLabelPts.length; i++) {
            sphereLabelPts[i].baseWidth = sphereCtx.measureText(sphereLabelPts[i].text).width / 100;
        }
    }

    function resizeSphere() {
        if (!sphereCanvas) return;
        var rect = sphereCanvas.getBoundingClientRect();
        sphereCanvas.width = rect.width * sphereDpr;
        sphereCanvas.height = rect.height * sphereDpr;
        sphereCtx.setTransform(sphereDpr, 0, 0, sphereDpr, 0, 0);
    }

    function drawSphere() {
        if (!sphereCtx) return;
        var w = sphereCanvas.width / sphereDpr;
        var h = sphereCanvas.height / sphereDpr;
        sphereCtx.clearRect(0, 0, w, h);

        var cx = w / 2;
        var cy = h / 2;
        var radius = Math.min(w, h) * 0.342;

        var cosY = Math.cos(sphereRotY);
        var sinY = Math.sin(sphereRotY);
        var cosX = Math.cos(sphereRotX);
        var sinX = Math.sin(sphereRotX);

        var dotLen = sphereDots.length;
        for (var i = 0; i < dotLen; i++) {
            var d = sphereDots[i];
            var x1 = d.x * cosY - d.z * sinY;
            var z1 = d.x * sinY + d.z * cosY;
            var y2 = d.y * cosX - z1 * sinX;
            var z2 = d.y * sinX + z1 * cosX;

            var scale = 1.6 / (1.6 + z2);
            dotProjSX[i] = cx + x1 * radius * scale;
            dotProjSY[i] = cy + y2 * radius * scale;
            dotProjZ[i] = z2;
            dotProjAlpha[i] = (1 - z2) / 2 * 0.7 + 0.05;
            dotProjSize[i] = 1 + scale * 1.5;
        }

        sphereLabelRender.length = 0;
        for (var k = 0; k < sphereLabelPts.length; k++) {
            var lb = sphereLabelPts[k];
            var lx1 = lb.x * cosY - lb.z * sinY;
            var lz1 = lb.x * sinY + lb.z * cosY;
            var ly2 = lb.y * cosX - lz1 * sinX;
            var lz2 = lb.y * sinX + lz1 * cosX;

            var lScale = 1.6 / (1.6 + lz2);
            sphereLabelRender.push({
                sx: cx + lx1 * radius * lScale,
                sy: cy + ly2 * radius * lScale,
                alpha: (1 - lz2) / 2 * 0.7 + 0.3,
                z: lz2,
                font: 11 + lScale * 5,
                text: lb.text,
                color: lb.color,
                baseWidth: lb.baseWidth,
                idx: k
            });
        }
        sphereLabelRender.sort(function (a, b) { return b.z - a.z; });

        for (var oi = 0; oi < dotLen; oi++) dotOrder[oi] = oi;
        dotOrder.sort(function (a, b) { return dotProjZ[b] - dotProjZ[a]; });

        sphereHoverIdx = -1;
        sphereCtx.textAlign = 'center';
        sphereCtx.textBaseline = 'middle';

        if (sphereMouseX >= 0) {
            for (var hi = 0; hi < sphereLabelRender.length; hi++) {
                var hr = sphereLabelRender[hi];
                var hfSize = hr.font | 0;
                var htw = hr.baseWidth > 0 ? hr.baseWidth * hfSize : sphereCtx.measureText(hr.text).width;
                var hpadX = 6, hpadY = 3;
                var hboxW = htw + hpadX * 2;
                var hboxH = hfSize + hpadY * 2;
                var hbx = hr.sx - hboxW / 2;
                var hby = hr.sy - hboxH / 2;
                if (sphereMouseX >= hbx && sphereMouseX <= hbx + hboxW &&
                    sphereMouseY >= hby && sphereMouseY <= hby + hboxH) {
                    sphereHoverIdx = hr.idx;
                    break;
                }
            }
        }

        var di = 0;
        var li = 0;
        var labelLen = sphereLabelRender.length;
        sphereCtx.fillStyle = '#ffffff';

        while (di < dotLen || li < labelLen) {
            var dotZ = di < dotLen ? dotProjZ[dotOrder[di]] : -Infinity;
            var lblZ = li < labelLen ? sphereLabelRender[li].z - 0.1 : -Infinity;

            if (dotZ >= lblZ) {
                var dIdx = dotOrder[di];
                di++;
                sphereCtx.globalAlpha = dotProjAlpha[dIdx];
                var dsz = dotProjSize[dIdx];
                sphereCtx.fillRect(dotProjSX[dIdx] - dsz / 2, dotProjSY[dIdx] - dsz / 2, dsz, dsz);
            } else {
                var pl = sphereLabelRender[li];
                li++;
                var fSize = pl.font | 0;
                var isHover = (sphereHoverIdx === pl.idx);
                var drawScale = isHover ? 1.5 : 1;

                var fSizeD = (fSize * drawScale) | 0;
                sphereCtx.font = fSizeD + 'px "VT323", monospace';
                sphereCtx.globalAlpha = pl.alpha;

                if (isHover) {
                    sphereCtx.shadowColor = pl.color;
                    sphereCtx.shadowBlur = 18;
                } else {
                    sphereCtx.shadowBlur = 0;
                }

                var tw = pl.baseWidth > 0 ? pl.baseWidth * fSizeD : sphereCtx.measureText(pl.text).width;
                var padX = 6 * drawScale;
                var padY = 3 * drawScale;
                var boxW = tw + padX * 2;
                var boxH = fSizeD + padY * 2;
                var bx = pl.sx - boxW / 2;
                var by = pl.sy - boxH / 2;
                var ow = 2 * drawScale;

                sphereCtx.fillStyle = pl.color;
                sphereCtx.fillRect(bx - ow, by - ow, boxW + ow * 2, ow);
                sphereCtx.fillRect(bx - ow, by + boxH, boxW + ow * 2, ow);
                sphereCtx.fillRect(bx - ow, by - ow, ow, boxH + ow * 2);
                sphereCtx.fillRect(bx + boxW, by - ow, ow, boxH + ow * 2);

                sphereCtx.fillStyle = pixelBg;
                sphereCtx.fillRect(bx, by, boxW, boxH);
                sphereCtx.fillStyle = pl.color;
                sphereCtx.fillRect(bx, by, boxW, 2 * drawScale);
                sphereCtx.fillRect(bx, by + boxH - 2 * drawScale, boxW, 2 * drawScale);
                sphereCtx.fillRect(bx, by, 2 * drawScale, boxH);
                sphereCtx.fillRect(bx + boxW - 2 * drawScale, by, 2 * drawScale, boxH);

                sphereCtx.fillStyle = pl.color;
                sphereCtx.fillText(pl.text, pl.sx, pl.sy);

                sphereCtx.shadowBlur = 0;
                sphereCtx.fillStyle = '#ffffff';
            }
        }

        sphereCtx.globalAlpha = 1;
        sphereCanvas.style.cursor = sphereHoverIdx >= 0 ? 'pointer' : (sphereDragging ? 'grabbing' : 'grab');
    }

    function sphereLoop() {
        if (!sphereDragging) {
            if (Math.abs(sphereVelY) > 0.0001 || Math.abs(sphereVelX) > 0.0001) {
                sphereRotY += sphereVelY;
                sphereRotX += sphereVelX;
                if (sphereRotX > 1.2) sphereRotX = 1.2;
                if (sphereRotX < -1.2) sphereRotX = -1.2;
                sphereVelY *= 0.9;
                sphereVelX *= 0.9;
            } else if (sphereAutoSpin) {
                sphereRotY += 0.00386;
                sphereRotX += 0.00104;
            }
        }
        drawSphere();
        requestAnimationFrame(sphereLoop);
    }

    if (sphereCanvas) {
        buildSpherePoints();
        resizeSphere();
        cacheLabelWidths();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(cacheLabelWidths);
        }
        sphereLoop();

        sphereCanvas.addEventListener('mouseenter', function () {
            sphereAutoSpin = false;
        });
        sphereCanvas.addEventListener('mouseleave', function () {
            sphereAutoSpin = true;
            sphereMouseX = -1;
            sphereMouseY = -1;
        });

        sphereCanvas.addEventListener('mousedown', function (e) {
            sphereDragging = true;
            sphereLastX = e.clientX;
            sphereLastY = e.clientY;
            sphereVelY = 0;
            sphereVelX = 0;
        });
        window.addEventListener('mouseup', function () { sphereDragging = false; });
        window.addEventListener('mousemove', function (e) {
            if (sphereDragging) {
                var dx = e.clientX - sphereLastX;
                var dy = e.clientY - sphereLastY;
                sphereRotY += dx * 0.008;
                sphereRotX += dy * 0.008;
                if (sphereRotX > 1.2) sphereRotX = 1.2;
                if (sphereRotX < -1.2) sphereRotX = -1.2;
                sphereVelY = dx * 0.008;
                sphereVelX = dy * 0.008;
                sphereLastX = e.clientX;
                sphereLastY = e.clientY;
            }
        });

        sphereCanvas.addEventListener('mousemove', function (e) {
            var rect = sphereCanvas.getBoundingClientRect();
            sphereMouseX = e.clientX - rect.left;
            sphereMouseY = e.clientY - rect.top;
        });

        window.addEventListener('resize', resizeSphere);
    }

    /* ================================================================
       Address Bar / Scroll Progress
       ================================================================ */
    var addrBar = document.getElementById('addr-bar');
    var addrFill = document.getElementById('addr-fill');
    var addrPct = document.getElementById('addr-pct');
    var addrPath = document.getElementById('addr-path');
    var addrSkillsPage = document.getElementById('skills-page');
    var addrScrollHint = document.getElementById('scroll-hint');
    var scrollSections = [
        { id: 'hero-wrapper', file: 'home' },
        { id: 'skills-page', file: 'skills' },
        { id: 'experience-page', file: 'experience' }
    ];
    var sectionEls = scrollSections.map(function (s) { return document.getElementById(s.id); });

    function updateAddrBar() {
        var st = window.pageYOffset || document.documentElement.scrollTop;
        var sh = document.documentElement.scrollHeight - window.innerHeight;
        var pct = sh > 0 ? (st / sh) * 100 : 0;
        if (pct < 0) pct = 0;
        if (pct > 100) pct = 100;

        var vh = window.innerHeight;

        var skillsTop = addrSkillsPage.getBoundingClientRect().top;
        var inSkills = skillsTop < vh * 0.6 && typingDone;

        var currentFile = scrollSections[0].file;
        for (var i = 0; i < sectionEls.length; i++) {
            if (sectionEls[i] && sectionEls[i].getBoundingClientRect().top < vh * 0.5) {
                currentFile = scrollSections[i].file;
            }
        }

        addrFill.style.width = pct + '%';
        addrPct.textContent = Math.round(pct) + '%';

        if (inSkills && !addrBar.classList.contains('visible')) {
            addrBar.classList.add('visible');
        } else if (!inSkills && addrBar.classList.contains('visible')) {
            addrBar.classList.remove('visible');
        }

        if (addrScrollHint) {
            if (typingDone && st < 200) {
                addrScrollHint.style.display = '';
                addrScrollHint.style.opacity = (200 - st) / 200;
                addrScrollHint.style.visibility = '';
                addrScrollHint.style.pointerEvents = '';
            } else {
                addrScrollHint.style.display = 'none';
            }
        }

        addrPath.textContent = 'C:\\Graduate-Portfolio\\' + currentFile;
    }

    var addrBarTicking = false;
    function requestAddrBarUpdate() {
        if (!addrBarTicking) {
            addrBarTicking = true;
            requestAnimationFrame(function () {
                updateAddrBar();
                addrBarTicking = false;
            });
        }
    }

    window.addEventListener('scroll', requestAddrBarUpdate, { passive: true });
    window.addEventListener('resize', updateAddrBar);

    /* ================================================================
       Starfield
       ================================================================ */
    var canvas = document.getElementById('starfield');
    var ctx = canvas.getContext('2d');
    var stars = [];
    var STAR_COUNT = 200;
    var mouseX = 0, mouseY = 0, targetMX = 0, targetMY = 0;
    var centerX, centerY;
    var starChars = ['.', '·', '*', '•', '✦', '✧', '⋆'];
    var charLen = starChars.length;
    var starColors = [
        [255, 255, 255],
        [255, 255, 255],
        [255, 255, 255],
        [200, 220, 255],
        [180, 210, 255],
        [255, 240, 200],
        [255, 220, 180],
        [255, 200, 200],
        [220, 200, 255]
    ];
    var colorLen = starColors.length;

    /* ---- Planets ---- */
    var planets = [];
    var planetCanvases = [];

    function renderPlanet(r, hasRing, tilt) {
        var size = r * 2 + (hasRing ? r * 2 : 0);
        var ox = size * 0.5, oy = size * 0.5;
        var off = document.createElement('canvas');
        off.width = size; off.height = size;
        var oc = off.getContext('2d');
        oc.font = '8px VT323, monospace';
        var step = 2.5;
        var rSq = r * r;

        for (var px = ox - r; px <= ox + r; px += step) {
            for (var py = oy - r; py <= oy + r; py += step) {
                var dx = px - ox, dy = py - oy;
                var distSq = dx * dx + dy * dy;
                if (distSq > rSq) continue;
                var dist = Math.sqrt(distSq);
                var ratio = dist / r;
                var ch = ratio < 0.25 ? '@' : ratio < 0.45 ? 'O' : ratio < 0.65 ? '*' : ratio < 0.82 ? '+' : '·';
                var light = 1 - (dx * 0.3 + dy * 0.3) / r;
                var shadow = Math.max(0, (dx * 0.5 + dy * 0.5 + r * 0.3) / r);
                var alpha = Math.max(0.08, light * 0.9 - shadow * 0.7);
                oc.fillStyle = 'rgba(255,255,255,' + alpha + ')';
                oc.fillText(ch, px, py);
            }
        }

        if (hasRing) {
            var ringRx = r * 1.7, ringRy = r * 0.35;
            var cosT = Math.cos(tilt), sinT = Math.sin(tilt);
            for (var angle = 0; angle < Math.PI * 2; angle += 0.04) {
                var erx = Math.cos(angle) * ringRx, ery = Math.sin(angle) * ringRy;
                var rx = ox + erx * cosT - ery * sinT;
                var ry = oy + erx * sinT + ery * cosT;
                var ra = Math.sin(angle) > 0 ? 0.6 : 0.12;
                oc.fillStyle = 'rgba(200,220,255,' + ra + ')';
                oc.fillText('─', rx, ry);
            }
        }
        return off;
    }

    function initPlanets() {
        planets = []; planetCanvases = [];
        var defs = [
            { x: 0.15, y: 0.22, r: 19, ring: true,  tilt: 0.45 },
            { x: 0.82, y: 0.28, r: 12, ring: false, tilt: 0 },
            { x: 0.50, y: 0.78, r: 24, ring: true,  tilt: -0.55 }
        ];
        var cw = canvas.width, ch = canvas.height;
        for (var i = 0; i < defs.length; i++) {
            var d = defs[i];
            planets.push({
                rx: d.x * cw, ry: d.y * ch,
                depth: 0.5 + Math.random() * 0.5
            });
            planetCanvases.push(renderPlanet(d.r, d.ring, d.tilt));
        }
    }

    /* ---- Starfield Init & Loop ---- */
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        centerX = canvas.width * 0.5;
        centerY = canvas.height * 0.5;
        initPlanets();
    }

    function initStarfield() {
        resize();
        canvas.classList.add('active');

        var cw = canvas.width, ch = canvas.height;
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            var c = starColors[(Math.random() * colorLen) | 0];
            stars.push({
                x: Math.random() * cw,
                y: Math.random() * ch,
                char: starChars[(Math.random() * charLen) | 0],
                size: 8 + Math.random() * 14,
                baseAlpha: 0.2 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2,
                speed: 0.005 + Math.random() * 0.02,
                flashTimer: 540 + Math.random() * 2700,
                flashAlpha: 0,
                cr: c[0], cg: c[1], cb: c[2]
            });
        }

        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', function (e) {
            targetMX = (e.clientX - centerX) * 0.08;
            targetMY = (e.clientY - centerY) * 0.08;
        });

        requestAnimationFrame(drawStarfield);
    }

    function drawStarfield() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        mouseX += (targetMX - mouseX) * 0.02;
        mouseY += (targetMY - mouseY) * 0.02;

        for (var i = 0; i < planets.length; i++) {
            var p = planets[i], pc = planetCanvases[i];
            var lx = p.rx + mouseX * p.depth * 0.8;
            var ly = p.ry + mouseY * p.depth * 0.8;
            ctx.drawImage(pc, lx - pc.width * 0.5, ly - pc.height * 0.5);
        }

        var t = Date.now() * 0.001;
        for (i = 0; i < stars.length; i++) {
            var s = stars[i];

            s.flashTimer--;
            if (s.flashTimer <= 0) {
                s.flashTimer = 720 + Math.random() * 3600;
                s.flashAlpha = 0.7 + Math.random() * 0.3;
            }
            if (s.flashAlpha > 0.01) {
                s.flashAlpha *= 0.991;
            } else {
                s.flashAlpha = 0;
            }

            var alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(t * s.speed * 10 + s.phase));
            alpha = Math.min(1, alpha + s.flashAlpha);
            var px = s.x + mouseX * s.size * 0.083;
            var py = s.y + mouseY * s.size * 0.083;
            ctx.font = s.size + 'px VT323, monospace';
            ctx.fillStyle = 'rgba(' + s.cr + ',' + s.cg + ',' + s.cb + ',' + alpha + ')';
            ctx.fillText(s.char, px, py);
        }

        requestAnimationFrame(drawStarfield);
    }

    /* ================================================================
       Comet Cursor Trail
       ================================================================ */
    var trail = [];
    var TRAIL_LENGTH = 24;
    var cometChars = ['✦', '✧', '*', '·', '.', ' '];
    var cometCharsLen = cometChars.length;
    var cometX = 0, cometY = 0;

    function initComet() {
        document.body.style.cursor = 'none';
        for (var i = 0; i < TRAIL_LENGTH; i++) {
            var el = document.createElement('span');
            el.className = 'comet-particle';
            document.body.appendChild(el);
            trail.push({ el: el, x: 0, y: 0 });
        }
        document.addEventListener('mousemove', function (e) {
            cometX = e.clientX;
            cometY = e.clientY;
        });
        requestAnimationFrame(renderComet);
    }

    function renderComet() {
        for (var i = trail.length - 1; i > 0; i--) {
            trail[i].x += (trail[i - 1].x - trail[i].x) * 0.6;
            trail[i].y += (trail[i - 1].y - trail[i].y) * 0.6;
        }
        trail[0].x += (cometX - trail[0].x) * 0.8;
        trail[0].y += (cometY - trail[0].y) * 0.8;

        for (var j = 0; j < trail.length; j++) {
            var t = trail[j];
            var ratio = j / trail.length;
            var charIdx = Math.min((ratio * cometCharsLen) | 0, cometCharsLen - 1);
            t.el.textContent = cometChars[charIdx];
            t.el.style.transform = 'translate(' + t.x + 'px,' + t.y + 'px) translate(-50%,-50%)';
            t.el.style.fontSize = (18 - ratio * 14) + 'px';
            t.el.style.opacity = 1 - ratio * 0.85;
        }

        requestAnimationFrame(renderComet);
    }

    /* ================================================================
       Arcade Reveal — IntersectionObserver
       ================================================================ */
    var typewriterTimers = [];

    function revealScanElement(el) {
        var idx = el.getAttribute('data-tl-index');
        if (idx !== null) {
            el.style.animationDelay = (parseInt(idx, 10) * 0.15) + 's';
        }
        el.classList.add('visible');
        revealObserver.unobserve(el);
    }

    function revealSectionContent(section) {
        var scans = section.querySelectorAll('[data-reveal="scan"]');
        for (var i = 0; i < scans.length; i++) {
            revealScanElement(scans[i]);
        }
    }

    function typeReveal(el) {
        var text = el.getAttribute('data-original-text');
        el.textContent = '';
        el.classList.add('visible', 'typing');

        var timers = [];
        var i = 0;
        timers.push(setTimeout(function () {
            function typeChar() {
                if (i < text.length) {
                    el.textContent += text[i];
                    i++;
                    timers.push(setTimeout(typeChar, 40));
                } else {
                    el.classList.remove('typing');
                    el.classList.add('typing-done');
                    var section = el.closest('section');
                    if (section) revealSectionContent(section);
                    revealObserver.unobserve(el);
                }
            }
            typeChar();
        }, 500));

        typewriterTimers.push({ el: el, timers: timers });
    }

    var revealEls = document.querySelectorAll('[data-reveal]');
    if (revealEls.length && 'IntersectionObserver' in window) {
        var timelineCards = document.querySelectorAll('.timeline-item[data-reveal]');
        for (var tc = 0; tc < timelineCards.length; tc++) {
            timelineCards[tc].setAttribute('data-tl-index', tc);
        }

        for (var s = 0; s < revealEls.length; s++) {
            if (revealEls[s].getAttribute('data-reveal') === 'typewriter') {
                revealEls[s].setAttribute('data-original-text', revealEls[s].textContent);
            }
        }

        var revealObserver = new IntersectionObserver(function (entries) {
            for (var e = 0; e < entries.length; e++) {
                var entry = entries[e];
                var el = entry.target;
                var type = el.getAttribute('data-reveal');

                if (entry.isIntersecting) {
                    if (type === 'typewriter') {
                        typeReveal(el);
                    } else {
                        var section = el.closest('section');
                        var title = section ? section.querySelector('[data-reveal="typewriter"]') : null;
                        if (title && !title.classList.contains('typing-done')) {
                            return;
                        }
                        revealScanElement(el);
                    }
                }
            }
        }, { threshold: 0.15 });

        for (var r = 0; r < revealEls.length; r++) {
            revealObserver.observe(revealEls[r]);
        }
    }

    var langToggle = document.getElementById('lang-toggle');
    var currentLang = 'en';
    if (langToggle) {
        var langOpts = langToggle.querySelectorAll('.lang-opt');
        langToggle.addEventListener('click', function () {
            currentLang = currentLang === 'en' ? 'zh' : 'en';
            for (var lo = 0; lo < langOpts.length; lo++) {
                langOpts[lo].classList.toggle('active');
            }
            switchLang(currentLang);
        });
    }

    function switchLang(lang) {
        document.documentElement.classList.toggle('lang-zh', lang === 'zh');
        var els = document.querySelectorAll('.i18n');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var text = el.getAttribute('data-' + lang);
            if (text === null) continue;
            if (el.hasAttribute('data-reveal') && el.getAttribute('data-reveal') === 'typewriter') {
                el.setAttribute('data-original-text', text);
                if (el.classList.contains('typing-done')) {
                    el.textContent = text;
                }
            } else if (el.classList.contains('hero-sub-text')) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        }
    }

})();
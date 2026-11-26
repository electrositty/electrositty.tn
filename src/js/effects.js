/* =====================================================================
   ELECTROSITTY – EFFETS DYNAMIQUES & 3D
   Fonctionne avec les composants chargés dynamiquement par app.js.
   Ne touche ni à la navbar ni au hero.
===================================================================== */
(function () {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------------------------------------------------------------
       1. APPARITION 3D EN CASCADE
    ---------------------------------------------------------------- */
    const STAGGER_GROUPS = [
        "#about .ring-stage",
        "#about .group",
        "#process .cube-scene",
        "#process [data-step]",
        "#packs .pk-toggle",
        "#packs .pk-nav",
        "#materiels [data-catalogue]",
        "#contact .ph-stage",
        "#contact form > *"
    ];

    function applyStagger() {
        STAGGER_GROUPS.forEach(sel => {
            document.querySelectorAll(sel).forEach((el, i) => {
                if (el.classList.contains("stagger-item")) return;
                el.classList.add("stagger-item");
                el.style.setProperty("--i", Math.min(i, 10));
            });
        });
    }

    /* ---------------------------------------------------------------
       2. CARTES 3D + BOUTONS MAGNÉTIQUES + PROJECTEURS
    ---------------------------------------------------------------- */
    const TILT = [
        { sel: "#about .group",             max: 12, lift: 3 }
    ];
    const MAGNETIC = "#btn-whatsapp-send, #packs a[data-pack]";

    let tiltEl = null, tiltCfg = null, magEl = null;

    function resetTilt() {
        if (!tiltEl) return;
        tiltEl.style.transition = "transform .7s cubic-bezier(.2,.7,.2,1), border-color .3s, box-shadow .3s";
        tiltEl.style.transform = "";
        tiltEl.classList.remove("is-tilting");
        tiltEl = tiltCfg = null;
    }
    function resetMag() {
        if (!magEl) return;
        magEl.style.transition = "translate .5s cubic-bezier(.2,.7,.2,1)";
        magEl.style.translate = "";
        magEl = null;
    }

    function onPointerMove(e) {
        const t = e.target;

        /* --- Inclinaison 3D --- */
        let found = null, cfg = null;
        for (const c of TILT) {
            const el = t.closest && t.closest(c.sel);
            if (el) { found = el; cfg = c; break; }
        }
        if (found !== tiltEl) resetTilt();
        if (found) {
            tiltEl = found; tiltCfg = cfg;
            found.classList.add("tilt-card", "is-tilting");
            const r = found.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rx = (0.5 - py) * cfg.max * 2;
            const ry = (px - 0.5) * cfg.max * 2;
            found.style.transition = "transform .12s ease-out, border-color .3s, box-shadow .3s";
            found.style.transform =
                `perspective(900px) translateY(-${cfg.lift}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
            found.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
            found.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        }

        /* --- Boutons magnétiques --- */
        const m = t.closest && t.closest(MAGNETIC);
        if (m !== magEl) resetMag();
        if (m) {
            magEl = m;
            const r = m.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
            const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
            m.style.transition = "translate .15s ease-out";
            m.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        }

        /* --- Projecteur dans la carte contact --- */
        const s = t.closest && t.closest(".spotlight");
        if (s) {
            const r = s.getBoundingClientRect();
            s.style.setProperty("--mx", (e.clientX - r.left) + "px");
            s.style.setProperty("--my", (e.clientY - r.top) + "px");
        }

        /* --- Halo curseur (masqué sur le hero et la navbar) --- */
        if (glow) {
            glowTarget.x = e.clientX;
            glowTarget.y = e.clientY;
            const overHero = t.closest && t.closest("#hero, #navbar, #lightbox");
            glow.classList.toggle("on", !overHero);
        }
    }

    /* ---------------------------------------------------------------
       3. HALO QUI SUIT LE CURSEUR (fluide, avec inertie)
    ---------------------------------------------------------------- */
    let glow = null;
    const glowTarget = { x: -999, y: -999 }, glowPos = { x: -999, y: -999 };

    function startGlow() {
        glow = document.createElement("div");
        glow.id = "cursor-glow";
        document.body.appendChild(glow);
        (function loop() {
            glowPos.x += (glowTarget.x - glowPos.x) * 0.12;
            glowPos.y += (glowTarget.y - glowPos.y) * 0.12;
            glow.style.transform = `translate3d(${glowPos.x}px, ${glowPos.y}px, 0)`;
            requestAnimationFrame(loop);
        })();
        document.addEventListener("mouseleave", () => glow.classList.remove("on"));
    }

    /* ---------------------------------------------------------------
       4. GALERIE 3D EN ANNEAU (glisser pour tourner)
    ---------------------------------------------------------------- */
    function initRing(stage) {
        if (stage.dataset.ready) return;
        stage.dataset.ready = "1";

        const ring = stage.querySelector("[data-ring]");
        const items = [...ring.children];
        const step = 360 / items.length;
        let angle = 0, velocity = 0, dragging = false, lastX = 0, visible = true;
        const autoSpeed = reduceMotion ? 0 : -0.12;

        new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(stage);

        stage.addEventListener("pointerdown", (e) => {
            dragging = true;
            lastX = e.clientX;
            velocity = 0;
            stage.classList.add("dragging");
            stage.setPointerCapture(e.pointerId);
        });
        stage.addEventListener("pointermove", (e) => {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            lastX = e.clientX;
            velocity = dx * 0.35;
            angle += velocity;
        });
        const stop = () => { dragging = false; stage.classList.remove("dragging"); };
        stage.addEventListener("pointerup", stop);
        stage.addEventListener("pointercancel", stop);
        stage.addEventListener("mouseenter", () => { stage._hover = true; });
        stage.addEventListener("mouseleave", () => { stage._hover = false; });

        (function loop() {
            if (visible) {
                if (!dragging) {
                    velocity *= 0.94;                         // inertie après le lâcher
                    angle += velocity + (stage._hover ? autoSpeed * 0.3 : autoSpeed);
                }
                ring.style.setProperty("--ry", angle + "deg");

                // Les images de face sont lumineuses, celles du fond plus sombres
                items.forEach((img, i) => {
                    const a = ((angle + i * step) % 360 + 360) % 360;
                    const facing = (Math.cos(a * Math.PI / 180) + 1) / 2;   // 0 = dos, 1 = face
                    img.style.filter = `brightness(${(0.35 + facing * 0.7).toFixed(2)}) saturate(${(0.6 + facing * 0.5).toFixed(2)})`;
                });
            }
            requestAnimationFrame(loop);
        })();
    }


    /* ---------------------------------------------------------------
       5. « COMMENT ÇA MARCHE » : CUBE 3D + ÉTINCELLES GÉNÉRATIVES
    ---------------------------------------------------------------- */
    function initProcess(root) {
        if (root.dataset.ready) return;
        root.dataset.ready = "1";

        const scene  = root.querySelector("[data-cube-scene]");
        const wrap   = root.querySelector(".cube-wrap");
        const cube   = root.querySelector("[data-cube]");
        const faces  = [...cube.children];
        const list   = root.querySelector("[data-steps]");
        const steps  = [...root.querySelectorAll("[data-step]")];
        const canvas = root.querySelector("[data-process-canvas]");
        const ctx    = canvas.getContext("2d");

        // Rotation du cube pour montrer chaque face
        const ROT = [
            "rotateX(0deg) rotateY(0deg)",
            "rotateX(0deg) rotateY(-90deg)",
            "rotateX(0deg) rotateY(-180deg)",
            "rotateX(0deg) rotateY(90deg)",
            "rotateX(-90deg) rotateY(0deg)",
            "rotateX(90deg) rotateY(0deg)"
        ];
        const DURATION = 4500;
        let current = -1, timer = null, paused = false, visible = false;

        function go(i, fromUser) {
            i = (i + steps.length) % steps.length;
            if (i === current) return;
            current = i;
            cube.style.transition = fromUser
                ? "transform .55s cubic-bezier(.16, 1, .3, 1)"     // clic : part tout de suite
                : "transform 1s cubic-bezier(.65, 0, .25, 1)";     // auto : plus doux
            cube.style.transform = ROT[i];
            faces.forEach((f, k) => f.classList.toggle("on", k === i));
            steps.forEach((b, k) => {
                b.classList.toggle("active", k === i);
                b.classList.remove("running");
                b.setAttribute("aria-current", k === i ? "step" : "false");
            });
            const active = steps[i];
            void active.offsetWidth;                 // relance la barre de progression
            active.style.setProperty("--dur", DURATION + "ms");
            if (!reduceMotion) active.classList.add("running");
            burst(fromUser ? 70 : 45);
            schedule();
        }

        function schedule() {
            clearTimeout(timer);
            if (reduceMotion || paused || !visible) return;
            timer = setTimeout(() => go(current + 1), DURATION);
        }

        function setPaused(p) {
            paused = p;
            list.classList.toggle("steps-paused", p);
            if (p) clearTimeout(timer); else schedule();
        }

        steps.forEach((b, k) => {
            b.addEventListener("pointerdown", () => go(k, true));
            b.addEventListener("click", () => go(k, true));      // clavier
        });
        [scene, list].forEach(el => {
            el.addEventListener("mouseenter", () => setPaused(true));
            el.addEventListener("mouseleave", () => setPaused(false));
        });

        // Glisser le cube (souris ou doigt) → étape suivante / précédente
        let downX = null;
        scene.addEventListener("pointerdown", e => { downX = e.clientX; });
        scene.addEventListener("pointerup", e => {
            if (downX === null) return;
            const dx = e.clientX - downX;
            downX = null;
            if (Math.abs(dx) > 35) go(current + (dx < 0 ? 1 : -1), true);
            else go(current + 1, true);
        });

        // Parallaxe : le cube suit légèrement la souris
        if (canHover) {
            scene.addEventListener("pointermove", e => {
                const r = scene.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                wrap.style.setProperty("--ty", (24 + px * 30).toFixed(1) + "deg");
                wrap.style.setProperty("--tx", (-14 - py * 20).toFixed(1) + "deg");
            });
            scene.addEventListener("mouseleave", () => {
                wrap.style.removeProperty("--ty");
                wrap.style.removeProperty("--tx");
            });
        }

        /* ---------- Canvas génératif ---------- */
        let W = 0, H = 0, dpr = 1, t = 0;

        // Halo pré-dessiné une seule fois (beaucoup plus rapide que shadowBlur)
        function makeSprite(r, g, b) {
            const c = document.createElement("canvas");
            c.width = c.height = 32;
            const x = c.getContext("2d");
            const grad = x.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, `rgba(255,255,255,1)`);
            grad.addColorStop(0.2, `rgba(${r},${g},${b},0.9)`);
            grad.addColorStop(0.5, `rgba(${r},${g},${b},0.25)`);
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            x.fillStyle = grad;
            x.fillRect(0, 0, 32, 32);
            return c;
        }
        const SPRITE_GOLD = makeSprite(245, 196, 0);
        const SPRITE_WHITE = makeSprite(255, 240, 200);
        const sparks = [];
        const BARS = matchMedia("(max-width: 640px)").matches ? 48 : 72;
        const phases = Array.from({ length: BARS }, () => Math.random() * Math.PI * 2);
        const speeds = Array.from({ length: BARS }, () => 1.5 + Math.random() * 2.5);

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = scene.clientWidth; H = scene.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener("resize", resize);

        const floor = () => ({ cx: W / 2, cy: H * 0.86, rx: Math.min(W * 0.42, 230), ry: Math.min(H * 0.07, 32) });
        const center = () => ({ x: W / 2, y: H * 0.44 });

        function spawnRising() {
            const f = floor(), a = Math.random() * Math.PI * 2;
            sparks.push({
                x: f.cx + Math.cos(a) * f.rx * (0.6 + Math.random() * 0.4),
                y: f.cy + Math.sin(a) * f.ry,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -(0.4 + Math.random() * 1.1),
                life: 1, decay: 0.006 + Math.random() * 0.01,
                size: 0.8 + Math.random() * 1.8,
                hue: Math.random() < 0.8 ? 48 : 0
            });
        }

        function burst(n) {
            const c = center();
            for (let k = 0; k < n; k++) {
                const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 4.5;
                sparks.push({
                    x: c.x, y: c.y,
                    vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.7,
                    life: 1, decay: 0.012 + Math.random() * 0.018,
                    size: 1 + Math.random() * 2.4, hue: Math.random() < 0.85 ? 48 : 0, drag: 0.96
                });
            }
        }

        function draw() {
            t += 0.016;
            ctx.clearRect(0, 0, W, H);
            const f = floor();

            // Halo au sol
            const g = ctx.createRadialGradient(f.cx, f.cy, 0, f.cx, f.cy, f.rx * 1.1);
            g.addColorStop(0, "rgba(245,196,0,0.22)");
            g.addColorStop(1, "rgba(245,196,0,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(f.cx, f.cy, f.rx * 1.1, f.ry * 2.2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Égaliseur circulaire
            ctx.lineCap = "round";
            for (let i = 0; i < BARS; i++) {
                const a = (i / BARS) * Math.PI * 2;
                const x = f.cx + Math.cos(a) * f.rx;
                const y = f.cy + Math.sin(a) * f.ry;
                const depth = (Math.sin(a) + 1) / 2;               // 0 = fond, 1 = devant
                const amp = 0.5 + 0.5 * Math.sin(t * speeds[i] + phases[i]);
                const beat = 0.6 + 0.4 * Math.sin(t * 2.2 + i * 0.35);
                const h = (6 + amp * beat * 34) * (0.55 + depth * 0.6);
                ctx.strokeStyle = `rgba(245,196,0,${(0.18 + depth * 0.55).toFixed(2)})`;
                ctx.lineWidth = 1.5 + depth * 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y - h);
                ctx.stroke();
            }

            // Étincelles
            if (sparks.length < 120 && Math.random() < 0.5) spawnRising();
            ctx.globalCompositeOperation = "lighter";
            for (let k = sparks.length - 1; k >= 0; k--) {
                const p = sparks[k];
                if (p.drag) { p.vx *= p.drag; p.vy *= p.drag; p.vy += 0.03; }
                p.x += p.vx; p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) { sparks.splice(k, 1); continue; }
                const d = (p.size * p.life + 0.5) * 6;
                ctx.globalAlpha = p.life;
                ctx.drawImage(p.hue ? SPRITE_GOLD : SPRITE_WHITE, p.x - d / 2, p.y - d / 2, d, d);
            }
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
        }

        (function loop() {
            if (visible) draw();
            requestAnimationFrame(loop);
        })();

        new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
            if (visible) { resize(); if (current < 0) go(0); else schedule(); }
            else clearTimeout(timer);
        }, { threshold: 0.2 }).observe(scene);

        if (reduceMotion) { visible = true; go(0); draw(); visible = false; }
    }


    /* ---------------------------------------------------------------
       6. PACKS : CARROUSEL 3D + MODE ÉVÉNEMENT / MODE DJ
    ---------------------------------------------------------------- */
    function initPacks3D(root) {
        if (root.dataset.ready) return;
        root.dataset.ready = "1";

        const section = root.closest("section");
        const stage   = root.querySelector("[data-pk-stage]");
        const track   = root.querySelector("[data-pk-track]");
        const cards   = [...root.querySelectorAll("[data-pk-card]")];
        const dotsBox = root.querySelector("[data-pk-dots]");
        const modeBtns = [...root.querySelectorAll("[data-pk-toggle] button")];
        const n = cards.length;
        let mode = "event";
        let active = Math.max(0, cards.findIndex(c => c.hasAttribute("data-event-pick")));
        let visible = false, swiped = false;

        dotsBox.innerHTML = cards.map((_, i) => `<button type="button" aria-label="Pack ${i + 1}"></button>`).join("");
        const dots = [...dotsBox.children];

        function layout() {
            const mobile = innerWidth < 640;
            const w = cards[0].offsetWidth;
            const spacing = mobile ? w * 0.58 : Math.min(w * 0.86, stage.clientWidth * 0.23);
            const angle = mode === "dj" ? 50 : 36;
            cards.forEach((c, i) => {
                const o = i - active, d = Math.abs(o);
                const x = o * spacing;
                const z = -d * (mobile ? 130 : 190);
                const ry = o === 0 ? 0 : (o < 0 ? angle : -angle);
                c.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`;
                c.style.zIndex = 10 - d;
                c.style.opacity = d > 2 ? 0 : 1 - d * 0.12;
                c.style.pointerEvents = d > 2 ? "none" : "";
                c.classList.toggle("active", o === 0);
                if (o !== 0) c.classList.remove("flipped");
            });
            dots.forEach((dt, i) => dt.classList.toggle("on", i === active));
        }
        function go(i) { active = (i + n) % n; layout(); }

        cards.forEach((c, i) => c.addEventListener("click", () => { if (i !== active) go(i); }));
        dots.forEach((dt, i) => dt.addEventListener("click", () => go(i)));
        root.querySelector("[data-pk-prev]").addEventListener("click", () => go(active - 1));
        root.querySelector("[data-pk-next]").addEventListener("click", () => go(active + 1));

        root.querySelectorAll("[data-pk-flip]").forEach(btn => btn.addEventListener("click", (e) => {
            const c = btn.closest("[data-pk-card]");
            if (cards.indexOf(c) !== active) return;
            e.stopPropagation();
            c.classList.toggle("flipped");
        }));

        // Glisser pour changer de pack
        let downX = null;
        stage.addEventListener("pointerdown", e => { downX = e.clientX; });
        stage.addEventListener("pointerup", e => {
            if (downX === null) return;
            const dx = e.clientX - downX;
            downX = null;
            if (Math.abs(dx) > 40) { swiped = true; go(active + (dx < 0 ? 1 : -1)); }
        });
        stage.addEventListener("click", e => {
            if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; }
        }, true);

        // Parallaxe souris
        if (canHover) {
            stage.addEventListener("pointermove", e => {
                const r = stage.getBoundingClientRect();
                track.style.setProperty("--ry", (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + "deg");
                track.style.setProperty("--rx", ((0.5 - (e.clientY - r.top) / r.height) * 6).toFixed(2) + "deg");
            });
            stage.addEventListener("mouseleave", () => {
                track.style.removeProperty("--ry");
                track.style.removeProperty("--rx");
            });
        }

        // Flèches du clavier
        document.addEventListener("keydown", e => {
            if (!visible || /input|textarea|select/i.test(document.activeElement.tagName)) return;
            if (e.key === "ArrowRight") go(active + 1);
            if (e.key === "ArrowLeft") go(active - 1);
        });

        // Mode Événement / Mode DJ
        function setMode(m) {
            if (m === mode) return;
            mode = m;
            fx.target = m === "dj" ? 1 : 0;
            section.classList.toggle("pk-dj", m === "dj");
            modeBtns.forEach(b => b.classList.toggle("on", b.dataset.mode === m));
            root.querySelectorAll("a[data-pack]").forEach(a => {
                if (m === "dj") a.dataset.type = "Soirée Club & DJ Set"; else delete a.dataset.type;
            });
            const pick = cards.findIndex(c => c.hasAttribute(m === "dj" ? "data-dj-pick" : "data-event-pick"));
            if (pick >= 0) active = pick;
            layout();
        }
        modeBtns.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

        window.addEventListener("resize", layout);
        layout();

        /* ---------- Canvas : lumières dorées / lasers DJ ---------- */
        const canvas = section.querySelector("[data-pk-fx]");
        const ctx = canvas.getContext("2d");
        const fx = { m: 0, target: 0 };
        let W = 0, H = 0, t = 0;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            W = section.clientWidth; H = section.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener("resize", resize);

        const bokehSprite = (() => {
            const c = document.createElement("canvas"); c.width = c.height = 64;
            const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
            g.addColorStop(0, "rgba(255,220,120,1)"); g.addColorStop(.45, "rgba(245,196,0,.45)"); g.addColorStop(1, "rgba(245,196,0,0)");
            x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
        })();
        const bokeh = Array.from({ length: 34 }, () => ({
            x: Math.random(), y: Math.random(), r: 8 + Math.random() * 34,
            vy: 0.00015 + Math.random() * 0.0004, a: 0.05 + Math.random() * 0.16, ph: Math.random() * 6.28
        }));
        const EQ = 56;
        const eqSp = Array.from({ length: EQ }, () => 2 + Math.random() * 4);
        const eqPh = Array.from({ length: EQ }, () => Math.random() * 6.28);
        const BEAT = 60 / 128;

        function draw() {
            t += 0.016;
            fx.m += (fx.target - fx.m) * 0.06;
            const m = fx.m, ev = 1 - m;
            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = "lighter";

            // ---- Mode Événement : bokeh doré + faisceaux chauds ----
            if (ev > 0.02) {
                bokeh.forEach(b => {
                    b.y -= b.vy; if (b.y < -0.1) { b.y = 1.1; b.x = Math.random(); }
                    const x = b.x * W + Math.sin(t * 0.4 + b.ph) * 20, y = b.y * H;
                    ctx.globalAlpha = b.a * ev * (0.7 + 0.3 * Math.sin(t + b.ph));
                    ctx.drawImage(bokehSprite, x - b.r, y - b.r, b.r * 2, b.r * 2);
                });
                ctx.globalAlpha = 1;
                [0.25, 0.75].forEach((ox, k) => {
                    const sway = Math.sin(t * 0.3 + k * 2) * 0.12;
                    const g = ctx.createLinearGradient(0, 0, 0, H * 0.9);
                    g.addColorStop(0, `rgba(255,214,102,${0.10 * ev})`);
                    g.addColorStop(1, "rgba(255,214,102,0)");
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.moveTo(W * ox - 10, 0); ctx.lineTo(W * ox + 10, 0);
                    ctx.lineTo(W * (ox + sway + 0.14), H * 0.9); ctx.lineTo(W * (ox + sway - 0.14), H * 0.9);
                    ctx.fill();
                });
            }

            // ---- Mode DJ : lasers + égaliseur + flash sur le temps ----
            if (m > 0.02) {
                const phase = (t % BEAT) / BEAT, flash = Math.exp(-phase * 5);
                const origins = [[0.06, 0], [0.5, 0], [0.94, 0]];
                let k = 0;
                origins.forEach(([ox, oy], oi) => {
                    for (let j = 0; j < 3; j++, k++) {
                        const base = oi === 0 ? 0.35 : oi === 2 ? -0.35 : 0;
                        const ang = Math.PI / 2 + base + Math.sin(t * (0.6 + j * 0.25) + k) * 0.55;
                        const x0 = ox * W, y0 = oy * H, len = H * 1.5;
                        const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
                        const hue = (t * 70 + k * 40) % 360;
                        ctx.strokeStyle = `hsla(${hue},100%,60%,${0.10 * m})`; ctx.lineWidth = 9;
                        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                        ctx.strokeStyle = `hsla(${hue},100%,70%,${(0.45 + 0.4 * flash) * m})`; ctx.lineWidth = 1.6;
                        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
                    }
                });

                const bw = W / EQ;
                for (let i = 0; i < EQ; i++) {
                    const h = (0.15 + 0.85 * Math.abs(Math.sin(t * eqSp[i] + eqPh[i]))) * (0.45 + 0.55 * flash) * H * 0.13;
                    const hue = (280 + i * 2.5 + t * 30) % 360;
                    ctx.fillStyle = `hsla(${hue},95%,60%,${0.45 * m})`;
                    ctx.fillRect(i * bw + 2, H - h, bw - 4, h);
                }

                const g = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.6);
                g.addColorStop(0, `rgba(217,70,239,${0.10 * flash * m})`);
                g.addColorStop(1, "rgba(217,70,239,0)");
                ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
            }
            ctx.globalCompositeOperation = "source-over";
        }

        (function loop() {
            if (visible && !reduceMotion) draw();
            requestAnimationFrame(loop);
        })();

        new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
            if (visible) { resize(); layout(); if (reduceMotion) draw(); }
        }, { threshold: 0.1 }).observe(section);
    }

    /* ---------------------------------------------------------------
       7. CATALOGUE : onglets par catégorie + liste de devis
    ---------------------------------------------------------------- */
    const CATALOGUE_SHOW_PRICES = false;   // mettre true pour afficher les prix de materiels.json

    function initCatalogue(root) {
        if (root.dataset.ready) return;
        root.dataset.ready = "1";

        const CATS = [
            { key: "Son",     label: "Son",          sub: "Enceintes, caissons, micros", icon: "fa-volume-high" },
            { key: "Lumière", label: "Lumière",      sub: "Projecteurs, lyres, effets",  icon: "fa-lightbulb" },
            { key: "LED",     label: "Écrans LED",   sub: "Indoor & outdoor",            icon: "fa-tv" },
            { key: "DJ",      label: "Matériel DJ",  sub: "Régies Pioneer",              icon: "fa-headphones" },
            { key: "Structure", label: "Structures", sub: "Ponts aluminium",             icon: "fa-archway" }
        ];
        const $ = sel => root.querySelector(sel);
        const catsBox = $("[data-ct-cats]"), grid = $("[data-ct-grid]"), title = $("[data-ct-title]");
        const subtitle = $("[data-ct-subtitle]"), count = $("[data-ct-count]"), search = $("[data-ct-search]");
        const bar = $("[data-ct-bar]"), barCount = $("[data-ct-bar-count]"), barList = $("[data-ct-bar-list]");
        const send = $("[data-ct-send]");
        const envBtns = [...root.querySelectorAll("[data-ct-env-val]")];

        const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        const norm = v => String(v ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

        let items = [], cat = "Son", env = "Tous", query = "";
        const picked = new Set();

        fetch("src/data/materiels.json")
            .then(r => r.json())
            .then(data => {
                items = data.filter(it => it.available !== false);
                const used = CATS.filter(c => items.some(it => it.category === c.key));
                cat = used.length ? used[0].key : "Son";
                renderCats(used);
                render();
            })
            .catch(() => { grid.innerHTML = '<p class="text-sm text-zinc-500">Le catalogue n\'a pas pu être chargé.</p>'; });

        function envOk(it) { return env === "Tous" || it.environment === "Tous" || it.environment === env; }

        function renderCats(used) {
            catsBox.innerHTML = used.map(c => {
                const n = items.filter(it => it.category === c.key && envOk(it)).length;
                return `<button type="button" class="ct-cat${c.key === cat && !query ? " on" : ""}" data-cat="${esc(c.key)}">
                    <span class="ct-cat-ico"><i class="fa-solid ${c.icon}"></i></span>
                    <span class="min-w-0"><span class="block text-sm font-bold text-white">${esc(c.label)}</span>
                    <span class="ct-cat-sub block truncate text-[10.5px] text-zinc-500">${esc(c.sub)}</span></span>
                    <span class="ct-count">${n}</span></button>`;
            }).join("");
            catsBox.querySelectorAll("[data-cat]").forEach(b => b.addEventListener("click", () => {
                cat = b.dataset.cat; query = ""; search.value = "";
                renderCats(used); render();
            }));
            catsBox._used = used;
        }

        function card(it, i) {
            const id = esc(it.name), sel = picked.has(it.name);
            const envLabel = it.environment === "Tous" ? "Indoor & outdoor" : it.environment;
            return `<article class="ct-item${sel ? " picked" : ""}" style="--i:${i}" data-name="${id}">
                <div class="ct-thumb">
                    <span class="ct-fallback"><i class="fa-solid fa-box"></i></span>
                    <img src="${esc(it.image)}" alt="${id}" loading="lazy" onerror="this.remove()">
                </div>
                <div class="flex min-w-0 flex-1 flex-col">
                    ${it.badge ? `<span><span class="ct-badge">${esc(it.badge)}</span></span>` : ""}
                    <h4 class="ct-name">${id}</h4>
                    <p class="ct-desc">${esc(it.description)}</p>
                    <div class="ct-meta">
                        ${CATALOGUE_SHOW_PRICES && it.price ? `<span class="ct-price">${esc(it.price)}</span>` : `<span class="ct-envchip"><i class="fa-solid fa-location-dot"></i> ${esc(envLabel)}</span>`}
                        <button type="button" class="ct-add" data-add="${id}">${sel ? '<i class="fa-solid fa-check"></i> Ajouté' : '<i class="fa-solid fa-plus"></i> Ajouter'}</button>
                    </div>
                </div>
            </article>`;
        }

        function render() {
            let list;
            if (query) {
                const q = norm(query);
                list = items.filter(it => envOk(it) && norm(it.name + " " + it.description + " " + it.category).includes(q));
                title.textContent = `Résultats pour « ${query} »`;
                subtitle.textContent = "Dans toutes les catégories";
            } else {
                const c = CATS.find(x => x.key === cat) || CATS[0];
                list = items.filter(it => it.category === cat && envOk(it));
                title.textContent = c.label;
                subtitle.textContent = c.sub;
            }
            count.textContent = `${list.length} équipement${list.length > 1 ? "s" : ""}`;
            grid.innerHTML = list.length
                ? list.map(card).join("")
                : '<p class="col-span-2 py-10 text-center text-sm text-zinc-500"><i class="fa-solid fa-magnifying-glass mb-2 block text-2xl text-zinc-700"></i>Aucun équipement ne correspond. Essayez un autre mot ou contactez-nous.</p>';
            grid.scrollLeft = 0;
        }

        function updateBar() {
            const names = [...picked];
            bar.classList.toggle("show", names.length > 0);
            barCount.textContent = `${names.length} équipement${names.length > 1 ? "s" : ""} dans votre liste`;
            barList.textContent = names.join(" · ");
            send.dataset.summary = "Matériel souhaité :\n" + names.map(n => "- " + n).join("\n");
        }

        grid.addEventListener("click", e => {
            const btn = e.target.closest("[data-add]");
            if (!btn) return;
            const name = btn.dataset.add, art = btn.closest(".ct-item");
            if (picked.has(name)) picked.delete(name); else picked.add(name);
            const on = picked.has(name);
            art.classList.toggle("picked", on);
            btn.innerHTML = on ? '<i class="fa-solid fa-check"></i> Ajouté' : '<i class="fa-solid fa-plus"></i> Ajouter';
            updateBar();
        });

        $("[data-ct-clear]").addEventListener("click", () => {
            picked.clear(); updateBar(); render();
        });

        let typing;
        search.addEventListener("input", () => {
            clearTimeout(typing);
            typing = setTimeout(() => {
                query = search.value.trim();
                renderCats(catsBox._used || []); render();
            }, 150);
        });

        envBtns.forEach(b => b.addEventListener("click", () => {
            env = b.dataset.ctEnvVal;
            envBtns.forEach(x => x.classList.toggle("on", x === b));
            renderCats(catsBox._used || []); render();
        }));
    }

    /* ---------------------------------------------------------------
       8. CONTACT : téléphone 3D + message WhatsApp en direct
    ---------------------------------------------------------------- */
    function initContact(root) {
        if (root.dataset.ready) return;
        root.dataset.ready = "1";

        const $ = id => document.getElementById(id);
        const F = { name: $("form-name"), phone: $("form-phone"), date: $("form-date"), location: $("form-location"), type: $("form-type"), details: $("form-details") };
        const stage = root.querySelector("[data-ph-stage]");
        const phone = root.querySelector("[data-ph]");
        const body  = root.querySelector("[data-ph-body]");
        const msg   = root.querySelector("[data-ph-msg]");
        const chat  = root.querySelector("[data-ph-chat]");
        const sub   = root.querySelector("[data-ph-sub]");
        const types = [...root.querySelectorAll(".fm-type")];
        const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
        let focused = null, replied = false;

        // Heure réelle sur le téléphone
        function clock() {
            const now = new Date(), hm = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
            root.querySelector("[data-ph-clock]").textContent = hm;
            root.querySelectorAll("[data-ph-t]").forEach(el => el.textContent = hm);
        }
        clock(); setInterval(clock, 30000);

        function line(key, label, value, empty) {
            const v = value ? esc(value) : `<span class="ph-empty">${empty}</span>`;
            return `<span class="ln${focused === key ? " hl" : ""}">${label} <b>${v}</b>${focused === key ? '<span class="caret"></span>' : ""}</span>`;
        }

        function render() {
            const date = F.date.value
                ? new Date(F.date.value + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                : "";
            body.innerHTML =
                `<span class="ln"><b>⚡ NOUVELLE DEMANDE DE PROJET</b></span>` +
                line("name", "👤 Nom :", F.name.value.trim(), "votre nom…") +
                line("phone", "📞 Tél :", F.phone.value.trim(), "votre numéro…") +
                line("type", "🎯 Prestation :", F.type.value, "") +
                line("date", "📅 Date :", date, "à préciser") +
                line("location", "📍 Lieu :", F.location.value.trim(), "à préciser") +
                line("details", "📝 Détails :", F.details.value.trim(), "…");
            sub.textContent = focused ? "vous écrivez…" : "en ligne";
            sub.classList.toggle("typing", !!focused);
        }

        Object.entries(F).forEach(([key, el]) => {
            if (!el) return;
            el.addEventListener("input", () => { msg.parentElement.classList.remove("sent"); render(); });
            el.addEventListener("change", () => { syncTypes(); render(); });
            el.addEventListener("focus", () => { focused = key; render(); });
            el.addEventListener("blur", () => { focused = null; render(); });
        });

        // Boutons visuels "Type de prestation" ⇄ select caché
        function syncTypes() { types.forEach(b => b.classList.toggle("on", b.dataset.value === F.type.value)); }
        types.forEach(b => b.addEventListener("click", () => {
            F.type.value = b.dataset.value;
            syncTypes();
            focused = "type"; render();
            setTimeout(() => { if (focused === "type") { focused = null; render(); } }, 1200);
        }));

        // Le téléphone suit la souris
        if (canHover) {
            root.addEventListener("pointermove", e => {
                const r = stage.getBoundingClientRect();
                const px = (e.clientX - (r.left + r.width / 2)) / innerWidth;
                const py = (e.clientY - (r.top + r.height / 2)) / innerHeight;
                phone.style.setProperty("--py", (-16 + px * 30).toFixed(1) + "deg");
                phone.style.setProperty("--px", (6 - py * 16).toFixed(1) + "deg");
            });
            root.addEventListener("mouseleave", () => { phone.style.removeProperty("--py"); phone.style.removeProperty("--px"); });
        }

        function confetti(x, y) {
            if (reduceMotion) return;
            const colors = ["#F5C400", "#25D366", "#ffffff", "#53bdeb", "#ff6b6b"];
            for (let i = 0; i < 46; i++) {
                const c = document.createElement("span");
                c.className = "confetti";
                c.style.left = x + "px"; c.style.top = y + "px";
                c.style.background = colors[i % colors.length];
                document.body.appendChild(c);
                const a = Math.random() * Math.PI * 2, v = 120 + Math.random() * 260;
                c.animate([
                    { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
                    { transform: `translate(${Math.cos(a) * v}px, ${Math.sin(a) * v - 140}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .6 },
                    { transform: `translate(${Math.cos(a) * v * 1.2}px, ${Math.sin(a) * v + 220}px) rotate(${Math.random() * 1080}deg)`, opacity: 0 }
                ], { duration: 1400 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => c.remove();
            }
        }

        // Envoi : vérification + animation (index.html ouvre WhatsApp)
        root.addEventListener("click", e => {
            const btn = e.target.closest("#btn-whatsapp-send");
            if (!btn) return;
            const missing = [F.name, F.phone].filter(el => !el.value.trim());
            if (missing.length) {
                missing.forEach(el => { el.classList.remove("fm-missing"); void el.offsetWidth; el.classList.add("fm-missing"); });
                phone.classList.remove("ph-shake"); void phone.offsetWidth; phone.classList.add("ph-shake");
                return;
            }
            const r = btn.getBoundingClientRect();
            confetti(r.left + r.width / 2, r.top + r.height / 2);
            msg.parentElement.classList.add("sent");
            msg.classList.remove("fly"); void msg.offsetWidth; msg.classList.add("fly");
            if (!replied) {
                replied = true;
                setTimeout(() => { sub.textContent = "écrit…"; sub.classList.add("typing"); }, 700);
                setTimeout(() => {
                    const first = esc(F.name.value.trim().split(" ")[0]);
                    const b = document.createElement("div");
                    b.className = "bub in";
                    b.innerHTML = `Merci ${first} ! 🙌 On regarde votre demande et on vous répond très vite.<span class="bub-time">${root.querySelector("[data-ph-clock]").textContent}</span>`;
                    chat.appendChild(b);
                    sub.textContent = "en ligne"; sub.classList.remove("typing");
                }, 2000);
            }
        });
        root.addEventListener("animationend", e => e.target.classList.remove("fm-missing", "ph-shake"));

        syncTypes();
        render();
    }

    /* ---------------------------------------------------------------
       DÉMARRAGE + SURVEILLANCE DES COMPOSANTS CHARGÉS PAR app.js
    ---------------------------------------------------------------- */
    function refresh() {
        if (!reduceMotion) applyStagger();
        document.querySelectorAll(".ring-stage").forEach(initRing);
        document.querySelectorAll("[data-process]").forEach(initProcess);
        document.querySelectorAll("[data-pk]").forEach(initPacks3D);
        document.querySelectorAll("[data-catalogue]").forEach(initCatalogue);
        document.querySelectorAll("[data-contact]").forEach(initContact);
    }

    let pending = false;
    new MutationObserver(() => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => { pending = false; refresh(); });
    }).observe(document.body, { childList: true, subtree: true });

    document.addEventListener("DOMContentLoaded", refresh);
    refresh();

    if (canHover && !reduceMotion) {
        startGlow();
        document.addEventListener("pointermove", onPointerMove, { passive: true });
        document.addEventListener("pointerleave", () => { resetTilt(); resetMag(); });
    }
})();

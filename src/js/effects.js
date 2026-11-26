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
        "#packs .snap-center",
        "#materiels-container > *",
        "#contact form > *",
        "#contact .space-y-3 > *"
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
        { sel: "#packs .snap-center",       max: 9, lift: 8 },
        { sel: "#materiels-container > *",  max: 7, lift: 6 },
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
       DÉMARRAGE + SURVEILLANCE DES COMPOSANTS CHARGÉS PAR app.js
    ---------------------------------------------------------------- */
    function refresh() {
        if (!reduceMotion) applyStagger();
        document.querySelectorAll(".ring-stage").forEach(initRing);
        document.querySelectorAll("[data-process]").forEach(initProcess);
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

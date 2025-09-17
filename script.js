// Pixel Eye — 8-bit grayscale tiles assembling into a human eye with eyelids
(function(){
    const canvas = document.getElementById('scene');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const aspect = 3/2; // canvas logical aspect
    function fitCanvas() {
        const boxW = canvas.clientWidth || 1200;
        const boxH = canvas.clientHeight || 800;
        canvas.width = Math.round(boxW * DPR);
        canvas.height = Math.round(boxH * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    // Grid config
    const grid = {
        cols: 96,
        rows: 64,
        size: 0, // computed
        originX: 0,
        originY: 0,
    };
    const FILL = 0.68; // fraction of cell occupied by tile (gutter creates spacing)

    function computeGrid() {
        const w = canvas.width / DPR;
        const h = canvas.height / DPR;
        grid.size = Math.floor(Math.min(w / grid.cols, h / grid.rows));
        const usedW = grid.size * grid.cols;
        const usedH = grid.size * grid.rows;
        grid.originX = Math.floor((w - usedW) / 2);
        grid.originY = Math.floor((h - usedH) / 2);
    }

    // 8-bit grayscale helper
    function gray(v){ const g = Math.max(0, Math.min(255, v|0)); return `rgb(${g},${g},${g})`; }

    // Offscreen render of target eye at grid resolution
    const off = document.createElement('canvas');
    const offCtx = off.getContext('2d');

    function renderTargetEye() {
        off.width = grid.cols;
        off.height = grid.rows;
        const cx = off.width / 2;
        const cy = off.height / 2;
        const eyeW = Math.min(off.width, off.height) * 0.95; // fuller eye width to occupy canvas
        const eyeHTop = eyeW * 0.22;   // upper lid arc height
        const eyeHBot = eyeW * 0.28;   // lower lid arc height
        const irisR = Math.min(off.width, off.height) * 0.20;
        const pupilR = irisR * 0.42;
        const image = offCtx.createImageData(off.width, off.height);
        const data = image.data;
        for (let y = 0; y < off.height; y++) {
            for (let x = 0; x < off.width; x++) {
                const u = (x - cx) / (eyeW * 0.5); // -1..1 across eye width
                let inEye = false;
                if (Math.abs(u) <= 1) {
                    const arc = Math.sqrt(1 - u*u);
                    const yTop = cy - eyeHTop * arc;
                    const yBot = cy + eyeHBot * arc;
                    inEye = (y >= yTop && y <= yBot);
                }
                let g8 = 0; // grayscale
                let a = 0;
                if (inEye) {
                    a = 255;
                    // sclera base
                    g8 = 210;
                    // iris shading
                    const dx = x - cx;
                    const dy = y - cy;
                    const d = Math.hypot(dx, dy);
                    const ring = d / irisR;
                    if (d <= irisR) {
                        const rings = 0.55 + 0.45 * Math.cos(ring * 14.0 + Math.atan2(dy, dx) * 3.0);
                        g8 = Math.round(130 + rings * 70); // darker iris
                        if (d < pupilR) g8 = 10; // pupil
                        // highlight
                        const hx = cx - irisR * 0.5;
                        const hy = cy - irisR * 0.5;
                        const hd = Math.hypot(x - hx, y - hy);
                        if (hd < irisR * 0.35 && d > pupilR * 1.1) {
                            const t = 1 - hd / (irisR * 0.35);
                            g8 = Math.min(255, Math.round(g8 + t * 80));
                        }
                    }
                    // eyelid shading near edges
                    if (inEye) {
                        const arc = Math.sqrt(1 - u*u);
                        const yTop = cy - eyeHTop * arc;
                        const yBot = cy + eyeHBot * arc;
                        const distTop = Math.max(0, y - yTop);
                        const distBot = Math.max(0, yBot - y);
                        const edge = Math.min(distTop, distBot);
                        const shade = Math.max(0, 1 - edge / (eyeHTop * 0.25));
                        g8 = Math.round(g8 * (1 - shade * 0.3));
                    }
                }
                const idx = (y * off.width + x) * 4;
                data[idx] = g8;
                data[idx+1] = g8;
                data[idx+2] = g8;
                data[idx+3] = a;
            }
        }
        offCtx.putImageData(image, 0, 0);
    }

    // Tiles: start scattered, animate to grid cells with quantized colors
    let tiles = [];
    function initTiles() {
        tiles = [];
        for (let y = 0; y < grid.rows; y++) {
            for (let x = 0; x < grid.cols; x++) {
                // read color from target
                const p = offCtx.getImageData(x, y, 1, 1).data;
                if (p[3] < 8) continue; // skip transparent
                const g8 = p[0];
                // scatter start
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * Math.max(grid.cols, grid.rows) * 2;
                const sx = grid.originX + (x + 0.5) * grid.size + Math.cos(angle) * radius * grid.size;
                const sy = grid.originY + (y + 0.5) * grid.size + Math.sin(angle) * radius * grid.size;
                tiles.push({
                    x0: sx, y0: sy,
                    x1: grid.originX + x * grid.size,
                    y1: grid.originY + y * grid.size,
                    x: sx, y: sy,
                    color: gray(g8),
                });
            }
        }
    }

    let mode = 'assemble';
    let t0 = 0;
    const duration = 1400;

    function draw(ts) {
        if (!t0) t0 = ts;
        const t = Math.min(1, (ts - t0) / duration);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // animate
        for (const tile of tiles) {
            const u = mode === 'assemble' ? t : (1 - t);
            const px = tile.x0 + (tile.x1 - tile.x0) * easeOutCubic(u);
            const py = tile.y0 + (tile.y1 - tile.y0) * easeOutCubic(u);
            ctx.fillStyle = tile.color;
            const s = grid.size * FILL;
            const ox = (grid.size - s) * 0.5;
            const oy = (grid.size - s) * 0.5;
            ctx.fillRect(px + ox, py + oy, s, s);
        }
        requestAnimationFrame(draw);
    }

    function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }

    function rebuild() {
        computeGrid();
        renderTargetEye();
        initTiles();
        // show assembled immediately on load
        t0 = performance.now() - duration;
    }

    // UI
    document.getElementById('assemble')?.addEventListener('click', () => { mode = 'assemble'; t0 = performance.now(); });
    document.getElementById('scatter')?.addEventListener('click', () => { mode = 'scatter'; t0 = performance.now(); });

    rebuild();
    requestAnimationFrame(draw);
})();



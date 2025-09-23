// Pixel Eye — 8-bit grayscale human eye with eyelids (glitchcore slices + static layered 3D)
(function(){
	const canvas = document.getElementById('scene');
	if (!canvas) return;
	const ctx = canvas.getContext('2d');

	const DPR = Math.min(window.devicePixelRatio || 1, 2);
	function fitCanvas() {
		const boxW = canvas.clientWidth || 1200;
		const boxH = canvas.clientHeight || 800;
		canvas.width = Math.round(boxW * DPR);
		canvas.height = Math.round(boxH * DPR);
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	}
	fitCanvas();
	window.addEventListener('resize', () => { fitCanvas(); rebuild(); });

	// Grid config - high density for detailed eye
	const grid = { cols: 160, rows: 120, size: 0, originX: 0, originY: 0 };
	const FILL = 0.75; // fraction of cell occupied by tile (gutter creates spacing)

	function computeGrid() {
		const w = canvas.width / DPR;
		const h = canvas.height / DPR;
		grid.size = Math.floor(Math.min(w / grid.cols, h / grid.rows));
		const usedW = grid.size * grid.cols;
		const usedH = grid.size * grid.rows;
		grid.originX = Math.floor((w - usedW) / 2);
		grid.originY = Math.floor((h - usedH) / 2);
	}

	// Helpers
	function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
	function gray(v){ const g = clamp(v|0, 0, 255); return `rgb(${g},${g},${g})`; }
	function smoothstep(edge0, edge1, x){ const t = clamp((x - edge0) / (edge1 - edge0), 0, 1); return t * t * (3 - 2 * t); }
	function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }
	function easeInOutSine(x){ return 0.5 * (1 - Math.cos(Math.PI * clamp(x,0,1))); }
	function lerp(a, b, t){ return a + (b - a) * t; }

	// Offscreen buffers: color (grayscale) + depth
	const off = document.createElement('canvas');
	const offCtx = off.getContext('2d');
	const depthOff = document.createElement('canvas');
	const depthCtx = depthOff.getContext('2d');
	// Pupil mask buffer (alpha marks pupil pixels)
	const pupilOff = document.createElement('canvas');
	const pupilCtx = pupilOff.getContext('2d');

	function renderTargetEye() {
		off.width = grid.cols;
		off.height = grid.rows;
		depthOff.width = grid.cols;
		depthOff.height = grid.rows;
		pupilOff.width = grid.cols;
		pupilOff.height = grid.rows;
		const cx = off.width / 2;
		const cy = off.height / 2;
		
		// Eye dimensions - larger and open
		const eyeW = Math.min(off.width, off.height) * 0.92;
		const eyeH = eyeW * 0.52;
		const irisR = eyeW * 0.2;
		const pupilR = irisR * 0.3;
		
		// Eyelid dimensions (more open fissure)
		const upperLidHeight = eyeH * 0.16;
		const lowerLidHeight = eyeH * 0.10;
		const fissureLift = eyeH * 0.08; // opens gap equally up/down
		const canthusTilt = eyeH * 0.04; // lateral canthus slightly higher
		const topBandMax = eyeH * 0.10;  // dark upper lid band thickness (max center)
		const botBandMax = eyeH * 0.06;  // light lower lid band thickness (max center)
		
		// Tear duct (inner corner)
		const tearDuctX = cx - eyeW * 0.45;
		const tearDuctY = cy;
		const tearDuctR = eyeW * 0.06;
		
		const image = offCtx.createImageData(off.width, off.height);
		const data = image.data;
		const depthImg = depthCtx.createImageData(depthOff.width, depthOff.height);
		const pupilImg = pupilCtx.createImageData(pupilOff.width, pupilOff.height);
		const depthData = depthImg.data;
		const pupilData = pupilImg.data;
		
		function almondTop(u){
			// Almond curve for upper lid: tapered corners, fuller center. Asymmetry to outer side
			const a = Math.pow(1 - Math.abs(u), 0.9);
			const outerBias = 0.08 * u; // slight pull towards outer canthus
			return upperLidHeight * (0.5 + 0.6 * a) - canthusTilt * u + outerBias * eyeH;
		}
		function almondBot(u){
			// Almond curve for lower lid: flatter than top
			const a = Math.pow(1 - Math.abs(u), 1.1);
			const outerBias = 0.05 * u;
			return lowerLidHeight * (0.35 + 0.5 * a) - canthusTilt * u + outerBias * eyeH * 0.5;
		}
		function bandTop(u){
			const a = Math.pow(1 - Math.abs(u), 0.7);
			return topBandMax * a;
		}
		function bandBot(u){
			const a = Math.pow(1 - Math.abs(u), 0.8);
			return botBandMax * a;
		}
		
		for (let y = 0; y < off.height; y++) {
			for (let x = 0; x < off.width; x++) {
				let g8 = 0;     // grayscale
				let a = 0;      // alpha
				let z = 0;      // depth 0..1 (0 = far, 1 = near)
				
				const dx = x - cx;
				const dy = y - cy;
				const u = dx / (eyeW * 0.5);
				
				let inEye = false;
				let isEyelid = false;
				let isEyelash = false;
				let isTearDuct = false;
				
				// Tear duct (inner corner)
				const tearDx = x - tearDuctX;
				const tearDy = y - tearDuctY;
				const tearD = Math.hypot(tearDx, tearDy);
				if (tearD < tearDuctR) {
					isTearDuct = true;
					g8 = 200; a = 255; z = 0.55;
				}
				
				// Eye shape with eyelids (almond/ocidental)
				if (Math.abs(u) <= 1) {
					const yTopCurve = cy - fissureLift - almondTop(u);
					const yBotCurve = cy + fissureLift + almondBot(u);
					
					// Eye opening
					if (y >= yTopCurve && y <= yBotCurve) {
						inEye = true;
						// Sclera
						g8 = 220; a = 255; z = 0.40;
						// Corneal dome influence (bulge)
						const rEyeX = (dx) / (eyeW * 0.5);
						const rEyeY = (dy) / (eyeH * 0.5);
						const dome = Math.sqrt(Math.max(0, 1 - (rEyeX*rEyeX + rEyeY*rEyeY)));
						z = Math.max(z, 0.40 + dome * 0.15);
						
						// Iris and pupil (static base colors/depth)
						const d = Math.hypot(dx, dy);
						if (d <= irisR) {
							const angle = Math.atan2(dy, dx);
							const radius = d / irisR;
							const rings = 0.4 + 0.6 * Math.cos(radius * 15 + angle * 3) * Math.sin(radius * 8 + angle * 2);
							g8 = Math.round(90 + rings * 70);
							z = Math.max(z, 0.50 + dome * 0.10);
						if (d < pupilR) { g8 = 5; z = 0.35; }
						}
						
						// Eyelid shadowing (softer)
						const distToTop = Math.max(0, y - yTopCurve);
						const distToBot = Math.max(0, yBotCurve - y);
						const edgeDist = Math.min(distToTop, distToBot);
						const shadow = Math.max(0, 1 - edgeDist / (upperLidHeight * 0.40));
						g8 = Math.round(g8 * (1 - shadow * 0.16));
					}
					
					// Eyelid bands (outside opening)
					const topBand = cy - fissureLift - almondTop(u) - bandTop(u);
					const botBand = cy + fissureLift + almondBot(u) + bandBot(u);
					if (y >= topBand && y < (cy - fissureLift - almondTop(u))) {
						isEyelid = true; g8 = 70; a = 255; z = 0.70;
					}
					if (y > (cy + fissureLift + almondBot(u)) && y <= botBand) {
						isEyelid = true; g8 = 180; a = 255; z = 0.60;
					}
				}
				
				// Upper eyelashes near top curve
				if (Math.abs(u) <= 0.9 && y < (cy - fissureLift - almondTop(u)) - 1) {
					if (Math.random() < 0.26) { isEyelash = true; g8 = 15; a = 255; z = 0.80; }
				}
				// Lower eyelashes near bottom curve
				if (Math.abs(u) <= 0.75 && y > (cy + fissureLift + almondBot(u)) + 1) {
					if (Math.random() < 0.16) { isEyelash = true; g8 = 15; a = 255; z = 0.78; }
				}
				
				// Write color
				const idx = (y * off.width + x) * 4;
				data[idx] = g8; data[idx+1] = g8; data[idx+2] = g8; data[idx+3] = a;
				// Write depth into alpha channel of depth buffer (scaled 0..255)
				const di = idx;
				const dz = clamp(Math.round(z * 255), 0, 255);
				depthData[di] = dz; depthData[di+1] = dz; depthData[di+2] = dz; depthData[di+3] = a;
				// Write pupil mask: alpha=255 only for pupil pixels
				const isPupilPx = a > 0 && (Math.hypot(dx, dy) < pupilR);
				pupilData[di] = 0; pupilData[di+1] = 0; pupilData[di+2] = 0; pupilData[di+3] = isPupilPx ? 255 : 0;
			}
		}
		offCtx.putImageData(image, 0, 0);
		depthCtx.putImageData(depthImg, 0, 0);
		pupilCtx.putImageData(pupilImg, 0, 0);
	}

	// Scene geometry for static 3D mapping
	let sceneCenterX = 0;
	let sceneCenterY = 0;
	let radiusX = 0;
	let radiusY = 0;
	let mouseX = 0;
	let mouseY = 0;
	let targetGazeX = 0;
	let targetGazeY = 0;
	let currentGazeX = 0;
	let currentGazeY = 0;
	
	function computeSceneGeometry(){
		const w = canvas.width / DPR;
		const h = canvas.height / DPR;
		sceneCenterX = w / 2;
		sceneCenterY = h / 2;
		radiusX = grid.size * grid.cols * 0.5;
		radiusY = grid.size * grid.rows * 0.5;
	}
	
	// Mouse tracking for eye gaze
	function updateGaze() {
		// map mouse to normalized offsets using drawn eye radius
		const nx = clamp((mouseX - sceneCenterX) / Math.max(1, radiusX), -1, 1);
		const ny = clamp((mouseY - sceneCenterY) / Math.max(1, radiusY), -1, 1);
		// realistic max angles (radians)
		const maxYaw = 0.6;   // left-right
		const maxPitch = 0.45; // up-down
		targetGazeX = nx * maxYaw;
		targetGazeY = ny * maxPitch;
		// faster smoothing for responsiveness
		currentGazeX += (targetGazeX - currentGazeX) * 0.25;
		currentGazeY += (targetGazeY - currentGazeY) * 0.25;
	}
	canvas.addEventListener('mousemove', (e) => {
		const rect = canvas.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
	});
	canvas.addEventListener('mouseleave', () => { targetGazeX = 0; targetGazeY = 0; });

	// Tiles: start scattered, then assemble to static 3D positions
	let tiles = [];
	let dispersing = false;
	let disperseStartMs = 0;
	const DISPERSE_DUR_MS = 2000;
	let disperseClickX = 0;
	let disperseClickY = 0;
	function initTiles() {
		tiles = [];
		for (let y = 0; y < grid.rows; y++) {
			for (let x = 0; x < grid.cols; x++) {
				const p = offCtx.getImageData(x, y, 1, 1).data;
				if (p[3] < 8) continue; // transparent -> skip
				const g8 = p[0];
				const dpx = depthCtx.getImageData(x, y, 1, 1).data;
				const z = dpx[0] / 255; // 0..1
				const mask = pupilCtx.getImageData(x, y, 1, 1).data;
				const isPupil = mask[3] > 0;
				// Base 2D cell center
				const baseX = grid.originX + x * grid.size + grid.size * 0.5;
				const baseY = grid.originY + y * grid.size + grid.size * 0.5;
				// Perspective based on depth (static)
				const f = 1.6;
				const depthScale = 0.9;
				const w = (z - 0.5) * 2; // -1..1 around center
				const persp = f / (f - w * depthScale);
				const targetCX = sceneCenterX + (baseX - sceneCenterX) * persp;
				const targetCY = sceneCenterY + (baseY - sceneCenterY) * persp;
				const targetX = targetCX - grid.size * 0.5;
				const targetY = targetCY - grid.size * 0.5;
				// scatter start
				const angle = Math.random() * Math.PI * 2;
				const radius = Math.random() * Math.max(grid.cols, grid.rows) * 2;
				const sx = targetX + grid.size * 0.5 + Math.cos(angle) * radius * grid.size;
				const sy = targetY + grid.size * 0.5 + Math.sin(angle) * radius * grid.size;
				// per-tile timing for smoother assembly
				const delayMs = Math.random() * 300; // 0..300ms
				const durMs = 1200 + Math.random() * 1000; // 1.2s..2.2s
				tiles.push({ x0: sx, y0: sy, x1: targetX, y1: targetY, g: g8, z, delayMs, durMs, isPupil, screenX: 0, screenY: 0, screenS: 0, dispDx: 0, dispDy: 0 });
			}
		}
	}

	function draw(ts) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		updateGaze();
		const ax = -currentGazeY; // pitch (up/down) inverted so up=up
		const ay = currentGazeX; // yaw (left/right)
		const f = 1.8; // focal length
		const depthScale = 0.9;

		let allAssembled = true;
		for (const tile of tiles) {
			const localT = clamp((ts - startAtMs - tile.delayMs) / tile.durMs, 0, 1);
			const eased = easeInOutSine(localT);
			if (localT < 1) allAssembled = false;

			// Compute 3D rotation around the eye center using sphere mapping
			const baseCX = tile.x1 + grid.size * 0.5;
			const baseCY = tile.y1 + grid.size * 0.5;
			const u = (baseCX - sceneCenterX) / Math.max(1, radiusX); // -1..1
			const v = (baseCY - sceneCenterY) / Math.max(1, radiusY); // -1..1
			const zSph = Math.sqrt(Math.max(0, 1 - u*u - v*v));
			// mix sphere with depth map for relief
			const wRelief = (tile.z - 0.4) * 1.2; // roughly -0.48..0.72
			let x3 = u;
			let y3 = v;
			let z3 = clamp(0.6 * zSph + 0.4 * wRelief, -1, 1);
			// rotate around X (ax) and Y (ay)
			const cosX = Math.cos(ax), sinX = Math.sin(ax);
			let yx = y3 * cosX - z3 * sinX;
			let zx = y3 * sinX + z3 * cosX;
			const cosY = Math.cos(ay), sinY = Math.sin(ay);
			let xy = x3 * cosY + zx * sinY;
			let zy = -x3 * sinY + zx * cosY;
			// perspective
			const persp = f / (f - zy * depthScale);
			const rotCX = sceneCenterX + xy * radiusX * persp;
			const rotCY = sceneCenterY + yx * radiusY * persp;
			const rotX = rotCX - grid.size * 0.5;
			const rotY = rotCY - grid.size * 0.5;

			// assemble interpolation from scatter to rotated target
			let px = lerp(tile.x0, rotX, eased);
			let py = lerp(tile.y0, rotY, eased);

			const shade = 0.4 + 0.6 * tile.z;
			ctx.fillStyle = gray(tile.g * shade);
			const s = grid.size * FILL * persp;
			const ox = (grid.size - s) * 0.5;
			const oy = (grid.size - s) * 0.5;
			// Save screen rect for hit testing
			tile.screenX = px + ox;
			tile.screenY = py + oy;
			tile.screenS = s;
			// Apply dispersion offset if active
			if (dispersing) {
				const tDisp = clamp((ts - disperseStartMs) / DISPERSE_DUR_MS, 0, 1);
				const eDisp = easeInOutSine(tDisp);
				px += tile.dispDx * eDisp;
				py += tile.dispDy * eDisp;
				
				// Only render tiles that are still visible on screen
				const finalX = px + ox;
				const finalY = py + oy;
				const w = canvas.width / DPR;
				const h = canvas.height / DPR;
				
				// Skip rendering if tile is completely outside screen bounds
				if (finalX + s < 0 || finalX > w || finalY + s < 0 || finalY > h) {
					continue;
				}
			}
			ctx.fillRect(px + ox, py + oy, s, s);
		}
		// Glitch only after assembled to keep animation fluid
		if (!dispersing && allAssembled && Math.random() < 0.015) {
			const bands = 2;
			for (let i = 0; i < bands; i++) {
				const y = Math.random() * (canvas.height - 4) | 0;
				const h = (Math.random() * 10 + 2) | 0;
				const dx = ((Math.random() - 0.5) * 10) | 0;
				ctx.drawImage(canvas, 0, y, canvas.width, h, dx, y, canvas.width, h);
			}
		}
		// Redirect to search page after dispersion completes
		if (dispersing) {
			const done = (ts - disperseStartMs) >= DISPERSE_DUR_MS;
			if (done) {
				// Add glitch effect before redirect
				document.body.style.filter = 'hue-rotate(180deg) brightness(1.5)';
				setTimeout(() => {
					window.location.href = 'search.html';
				}, 300);
				return;
			}
		}
		requestAnimationFrame(draw);
	}

	let startAtMs = 0;
	function rebuild() {
		computeGrid();
		computeSceneGeometry();
		renderTargetEye();
		initTiles();
		startAtMs = performance.now();
	}

	function triggerDisperse(cx, cy) {
		dispersing = true;
		disperseStartMs = performance.now();
		disperseClickX = cx;
		disperseClickY = cy;
		for (const tile of tiles) {
			const centerX = tile.screenX + tile.screenS * 0.5;
			const centerY = tile.screenY + tile.screenS * 0.5;
			const vx = centerX - cx;
			const vy = centerY - cy;
			const len = Math.hypot(vx, vy) || 1;
			const nx = vx / len;
			const ny = vy / len;
			const mag = (grid.size * Math.max(grid.cols, grid.rows)) * (2.5 + Math.random() * 1.5);
			tile.dispDx = nx * mag;
			tile.dispDy = ny * mag;
		}
	}

	rebuild();
	requestAnimationFrame(draw);

	// Click detection on pupil region (accounts for current eye motion via stored screen rects)
	canvas.addEventListener('click', (e) => {
		const rect = canvas.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;
		// if already dispersing, ignore
		if (dispersing) return;
		// Check if click intersects any tile marked as pupil
		let hit = false;
		for (const t of tiles) {
			if (!t.isPupil) continue;
			if (mx >= t.screenX && mx <= (t.screenX + t.screenS) && my >= t.screenY && my <= (t.screenY + t.screenS)) { hit = true; break; }
		}
		if (hit) { triggerDisperse(mx, my); }
	});
})();



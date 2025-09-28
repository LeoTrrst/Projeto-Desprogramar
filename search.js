// Search Page — Same aesthetic as index.html but forming search page
(function(){
	const canvas = document.getElementById('searchCanvas');
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

	// Grid config - same as index
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

	// Helpers - same as index
	function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }
	function gray(v){ const g = clamp(v|0, 0, 255); return `rgb(${g},${g},${g})`; }
	function smoothstep(edge0, edge1, x){ const t = clamp((x - edge0) / (edge1 - edge0), 0, 1); return t * t * (3 - 2 * t); }
	function easeOutCubic(x){ return 1 - Math.pow(1 - x, 3); }
	function easeInOutSine(x){ return 0.5 * (1 - Math.cos(Math.PI * clamp(x,0,1))); }
	function lerp(a, b, t){ return a + (b - a) * t; }

	// Offscreen buffers: color (grayscale) + depth - same as index
	const off = document.createElement('canvas');
	const offCtx = off.getContext('2d');
	const depthOff = document.createElement('canvas');
	const depthCtx = depthOff.getContext('2d');

	function renderSearchPage() {
		off.width = grid.cols;
		off.height = grid.rows;
		depthOff.width = grid.cols;
		depthOff.height = grid.rows;
		const cx = off.width / 2;
		const cy = off.height / 2;
		
		// Search page dimensions
		const pageW = Math.min(off.width, off.height) * 0.9;
		const pageH = pageW * 0.8;
		
		// Logo area
		const logoW = pageW * 0.8;
		const logoH = pageH * 0.25;
		const logoY = cy - pageH * 0.3;
		
		// Search bar
		const searchW = pageW * 0.7;
		const searchH = pageH * 0.15;
		const searchY = cy + pageH * 0.1;
		
		// Buttons
		const buttonW = pageW * 0.15;
		const buttonH = pageH * 0.12;
		const buttonY = cy + pageH * 0.4;
		
		const image = offCtx.createImageData(off.width, off.height);
		const data = image.data;
		const depthImg = depthCtx.createImageData(depthOff.width, depthOff.height);
		const depthData = depthImg.data;
		
		for (let y = 0; y < off.height; y++) {
			for (let x = 0; x < off.width; x++) {
				let g8 = 0;     // grayscale
				let a = 0;      // alpha
				let z = 0;      // depth 0..1 (0 = far, 1 = near)
				
				const dx = x - cx;
				const dy = y - cy;
				
				// Logo area
				if (Math.abs(dx) <= logoW/2 && Math.abs(dy - (logoY - cy)) <= logoH/2) {
					// Create PIXELSEARCH text pattern
					const logoX = dx + logoW/2;
					const logoY_local = dy - (logoY - cy) + logoH/2;
					
					// Simple text pattern (PIXELSEARCH)
					const textPattern = [
						"██████╗ ██╗██╗  ██╗███████╗██╗     ███████╗███████╗ █████╗ ██████╗  ██████╗██╗  ██╗",
						"██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██║  ██║",
						"██████╔╝██║ ╚███╔╝ █████╗  ██║     █████╗  ███████╗███████║██████╔╝██║     ███████║",
						"██╔══██╗██║ ██╔██╗ ██╔══╝  ██║     ██╔══╝  ╚════██║██╔══██║██╔══██╗██║     ██╔══██║",
						"██║  ██║██║██╔╝ ██╗███████╗███████╗███████╗███████║██║  ██║██║  ██║╚██████╗██║  ██║",
						"╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝"
					];
					
					const charWidth = logoW / textPattern[0].length;
					const charHeight = logoH / textPattern.length;
					const charX = Math.floor(logoX / charWidth);
					const charY = Math.floor(logoY_local / charHeight);
					
					if (charY >= 0 && charY < textPattern.length && charX >= 0 && charX < textPattern[charY].length) {
						if (textPattern[charY][charX] !== ' ') {
							g8 = 200; a = 255; z = 0.6;
						}
					}
				}
				
				// Search bar
				if (Math.abs(dx) <= searchW/2 && Math.abs(dy - (searchY - cy)) <= searchH/2) {
					const searchX = dx + searchW/2;
					const searchY_local = dy - (searchY - cy) + searchH/2;
					
					// Search bar pattern
					const barPattern = [
						"┌──────────────────────────────────────────────────────────────┐",
						"│                                                              │",
						"│  Search the web...                                          │",
						"│                                                              │",
						"└──────────────────────────────────────────────────────────────┘"
					];
					
					const charWidth = searchW / barPattern[0].length;
					const charHeight = searchH / barPattern.length;
					const charX = Math.floor(searchX / charWidth);
					const charY = Math.floor(searchY_local / charHeight);
					
					if (charY >= 0 && charY < barPattern.length && charX >= 0 && charX < barPattern[charY].length) {
						if (barPattern[charY][charX] !== ' ') {
							g8 = 180; a = 255; z = 0.5;
						}
					}
				}
				
				// Buttons
				const button1X = dx - buttonW * 0.3;
				const button2X = dx + buttonW * 0.3;
				const buttonY_local = dy - (buttonY - cy);
				
				if ((Math.abs(button1X) <= buttonW/2 || Math.abs(button2X) <= buttonW/2) && Math.abs(buttonY_local) <= buttonH/2) {
					const buttonPattern = [
						"┌─────────────┐    ┌─────────────────────┐",
						"│   Search    │    │  I'm Feeling Lucky  │",
						"└─────────────┘    └─────────────────────┘"
					];
					
					const charWidth = buttonW / 15;
					const charHeight = buttonH / buttonPattern.length;
					
					let charX, charY;
					if (Math.abs(button1X) <= buttonW/2) {
						charX = Math.floor((button1X + buttonW/2) / charWidth);
						charY = Math.floor((buttonY_local + buttonH/2) / charHeight);
					} else {
						charX = Math.floor((button2X + buttonW/2) / charWidth) + 15;
						charY = Math.floor((buttonY_local + buttonH/2) / charHeight);
					}
					
					if (charY >= 0 && charY < buttonPattern.length && charX >= 0 && charX < buttonPattern[charY].length) {
						if (buttonPattern[charY][charX] !== ' ') {
							g8 = 160; a = 255; z = 0.7;
						}
					}
				}
				
				// Write color
				const idx = (y * off.width + x) * 4;
				data[idx] = g8; data[idx+1] = g8; data[idx+2] = g8; data[idx+3] = a;
				// Write depth into alpha channel of depth buffer (scaled 0..255)
				const di = idx;
				const dz = clamp(Math.round(z * 255), 0, 255);
				depthData[di] = dz; depthData[di+1] = dz; depthData[di+2] = dz; depthData[di+3] = a;
			}
		}
		offCtx.putImageData(image, 0, 0);
		depthCtx.putImageData(depthImg, 0, 0);
	}

	// Static positioning - no 3D movement

	// Tiles: start scattered, then assemble to static positions
	let tiles = [];
	function initTiles() {
		tiles = [];
		for (let y = 0; y < grid.rows; y++) {
			for (let x = 0; x < grid.cols; x++) {
				const p = offCtx.getImageData(x, y, 1, 1).data;
				if (p[3] < 8) continue; // transparent -> skip
				const g8 = p[0];
				const dpx = depthCtx.getImageData(x, y, 1, 1).data;
				const z = dpx[0] / 255; // 0..1
				// Static 2D position
				const targetX = grid.originX + x * grid.size;
				const targetY = grid.originY + y * grid.size;
				// scatter start
				const angle = Math.random() * Math.PI * 2;
				const radius = Math.random() * Math.max(grid.cols, grid.rows) * 2;
				const sx = targetX + grid.size * 0.5 + Math.cos(angle) * radius * grid.size;
				const sy = targetY + grid.size * 0.5 + Math.sin(angle) * radius * grid.size;
				// per-tile timing for smoother assembly
				const delayMs = Math.random() * 300; // 0..300ms
				const durMs = 1200 + Math.random() * 1000; // 1.2s..2.2s
				tiles.push({ x0: sx, y0: sy, x1: targetX, y1: targetY, g: g8, z, delayMs, durMs });
			}
		}
	}

	function draw(ts) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		let allAssembled = true;
		for (const tile of tiles) {
			const localT = clamp((ts - startAtMs - tile.delayMs) / tile.durMs, 0, 1);
			const eased = easeInOutSine(localT);
			if (localT < 1) allAssembled = false;

			// Simple 2D interpolation from scatter to target position
			const px = lerp(tile.x0, tile.x1, eased);
			const py = lerp(tile.y0, tile.y1, eased);

			// Static shading based on depth
			const shade = 0.4 + 0.6 * tile.z;
			ctx.fillStyle = gray(tile.g * shade);
			const s = grid.size * FILL;
			const ox = (grid.size - s) * 0.5;
			const oy = (grid.size - s) * 0.5;
			ctx.fillRect(px + ox, py + oy, s, s);
		}
		// Glitch only after assembled to keep animation fluid
		if (allAssembled && Math.random() < 0.015) {
			const bands = 2;
			for (let i = 0; i < bands; i++) {
				const y = Math.random() * (canvas.height - 4) | 0;
				const h = (Math.random() * 10 + 2) | 0;
				const dx = ((Math.random() - 0.5) * 10) | 0;
				ctx.drawImage(canvas, 0, y, canvas.width, h, dx, y, canvas.width, h);
			}
		}
		requestAnimationFrame(draw);
	}

	let startAtMs = 0;
	function rebuild() {
		computeGrid();
		renderSearchPage();
		initTiles();
		startAtMs = performance.now();
	}

	rebuild();
	requestAnimationFrame(draw);
})();
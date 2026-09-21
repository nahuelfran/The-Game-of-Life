/**
 * Juego de la Vida de Conway - Conway's Game of Life
 * Implementación optimizada en Canvas HTML5 con JS Moderno
 *
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Francis
 * Licencia libre: usa, modifica y distribuye este código como quieras.
 */

class GameOfLife {
    constructor() {
        // Elementos DOM
        this.canvas = document.getElementById('life-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Contadores
        this.genCounter = document.getElementById('gen-counter');
        this.aliveCounter = document.getElementById('alive-counter');
        this.fpsCounter = document.getElementById('fps-counter');
        this.genCounterMobile = document.getElementById('gen-counter-mobile');
        this.aliveCounterMobile = document.getElementById('alive-counter-mobile');

        // Controles UI
        this.btnPlay = document.getElementById('btn-play');
        this.btnStep = document.getElementById('btn-step');
        this.btnRandom = document.getElementById('btn-random');
        this.btnClear = document.getElementById('btn-clear');
        this.btnPresets = document.getElementById('btn-presets');
        this.presetsPanel = document.getElementById('presets-panel');
        this.closePresets = document.getElementById('close-presets');

        // Sliders y Toggles
        this.sliderSpeed = document.getElementById('slider-speed');
        this.speedLabel = document.getElementById('speed-label');
        this.sliderSize = document.getElementById('slider-size');
        this.sizeLabel = document.getElementById('size-label');
        this.btnToggleGrid = document.getElementById('btn-toggle-grid');
        this.btnToggleGlow = document.getElementById('btn-toggle-glow');
        this.btnTheme = document.getElementById('btn-theme');
        this.btnInfo = document.getElementById('btn-info');
        this.modalInfo = document.getElementById('modal-info');
        this.closeInfo = document.getElementById('close-info');

        // Configuración de la Simulación
        this.cellSize = parseInt(this.sliderSize.value) || 10;
        this.cols = 0;
        this.rows = 0;
        this.grid = null;       // Uint8Array para rendimiento óptimo
        this.nextGrid = null;   // Buffering secundario
        this.trails = null;     // Float32Array para efectos de estela/desvanecimiento

        // Estado del Juego
        this.isRunning = false;
        this.generation = 0;
        this.aliveCount = 0;
        this.targetFps = parseInt(this.sliderSpeed.value) || 25;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.actualFps = 0;

        // Visuales
        this.showGrid = true;
        this.showGlow = true;
        this.themeIndex = 0;
        this.themes = [
            {
                name: 'Emerald Neon',
                alive: '#22c55e',
                glow: 'rgba(34, 197, 94, 0.4)',
                trail: 'rgba(16, 185, 129, 0.25)',
                grid: 'rgba(255, 255, 255, 0.04)'
            },
            {
                name: 'Cyber Cyan',
                alive: '#06b6d4',
                glow: 'rgba(6, 182, 212, 0.4)',
                trail: 'rgba(2, 132, 199, 0.25)',
                grid: 'rgba(255, 255, 255, 0.04)'
            },
            {
                name: 'Violet Glow',
                alive: '#a855f7',
                glow: 'rgba(168, 85, 247, 0.4)',
                trail: 'rgba(139, 92, 246, 0.25)',
                grid: 'rgba(255, 255, 255, 0.04)'
            },
            {
                name: 'Amber Solar',
                alive: '#f59e0b',
                glow: 'rgba(245, 158, 11, 0.4)',
                trail: 'rgba(217, 119, 6, 0.25)',
                grid: 'rgba(255, 255, 255, 0.04)'
            },
            {
                name: 'Monochrome Minimal',
                alive: '#f8fafc',
                glow: 'rgba(248, 250, 252, 0.3)',
                trail: 'rgba(148, 163, 184, 0.2)',
                grid: 'rgba(255, 255, 255, 0.05)'
            }
        ];

        // Estado del ratón/interacción
        this.isDrawing = false;
        this.drawMode = 1; // 1 = Dibujar célula viva, 0 = Errores/Borrar
        this.lastX = -1;
        this.lastY = -1;
        this.hoverX = -1;
        this.hoverY = -1;

        // Inicialización
        this.init();
    }

    /**
     * Inicialización del Canvas, eventos y grilla
     */
    init() {
        this.resizeCanvas();
        this.randomizeGrid(0.18); // Semilla inicial vistosa
        this.setupEventListeners();
        this.updateStats();

        // Iniciar loop de renderizado
        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    /**
     * Ajusta el tamaño del canvas al contenedor padre considerando High DPI displays
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const width = container.clientWidth - 32;  // Padding de margen
        const height = container.clientHeight - 32;

        const dpr = window.devicePixelRatio || 1;
        this.cols = Math.floor(width / this.cellSize);
        this.rows = Math.floor(height / this.cellSize);

        const canvasWidth = this.cols * this.cellSize;
        const canvasHeight = this.rows * this.cellSize;

        this.canvas.width = canvasWidth * dpr;
        this.canvas.height = canvasHeight * dpr;
        this.canvas.style.width = `${canvasWidth}px`;
        this.canvas.style.height = `${canvasHeight}px`;

        this.ctx.scale(dpr, dpr);

        // Recrear buffers manteniendo estado si existe
        const totalCells = this.cols * this.rows;
        const newGrid = new Uint8Array(totalCells);
        
        if (this.grid) {
            // Copiar las células anteriores centradas
            const oldCols = Math.floor(this.grid.length / (this.rows || 1));
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const idx = r * this.cols + c;
                    if (r < this.rows && c < oldCols) {
                        newGrid[idx] = this.grid[idx] || 0;
                    }
                }
            }
        }

        this.grid = newGrid;
        this.nextGrid = new Uint8Array(totalCells);
        this.trails = new Float32Array(totalCells);

        this.draw();
    }

    /**
     * Ciclo principal de animación sincronizado con requestAnimationFrame
     */
    loop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const elapsed = timestamp - this.lastFrameTime;
        const frameInterval = 1000 / this.targetFps;

        // Cálculo de FPS
        if (timestamp - this.lastFpsUpdate >= 500) {
            this.actualFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            this.fpsCounter.textContent = this.actualFps;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
        }

        // Si la simulación está activa y ha pasado el intervalo adecuado de FPS
        if (this.isRunning && elapsed >= frameInterval) {
            this.step();
            this.lastFrameTime = timestamp - (elapsed % frameInterval);
            this.frameCount++;
        } else if (!this.isRunning) {
            this.frameCount++;
        }

        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Calcula la siguiente generación aplicando las 4 reglas del Juego de la Vida
     */
    step() {
        let alive = 0;
        const cols = this.cols;
        const rows = this.rows;

        for (let r = 0; r < rows; r++) {
            const rAbove = (r - 1 + rows) % rows;
            const rBelow = (r + 1) % rows;

            for (let c = 0; c < cols; c++) {
                const cLeft = (c - 1 + cols) % cols;
                const cRight = (c + 1) % cols;

                const idx = r * cols + c;

                // Contar vecinos vivos (toroidal/wrap-around)
                const neighbors =
                    this.grid[rAbove * cols + cLeft] +
                    this.grid[rAbove * cols + c] +
                    this.grid[rAbove * cols + cRight] +
                    this.grid[r * cols + cLeft] +
                    this.grid[r * cols + cRight] +
                    this.grid[rBelow * cols + cLeft] +
                    this.grid[rBelow * cols + c] +
                    this.grid[rBelow * cols + cRight];

                const currentState = this.grid[idx];
                let nextState = 0;

                // Reglas de Conway:
                // 1. Célula viva con 2 o 3 vecinas sobrevive.
                // 2. Célula muerta con exactamente 3 vecinas nace.
                if (currentState === 1) {
                    nextState = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    nextState = (neighbors === 3) ? 1 : 0;
                }

                this.nextGrid[idx] = nextState;

                if (nextState === 1) {
                    alive++;
                    this.trails[idx] = 1.0; // Intensidad máxima de estela
                } else if (this.trails[idx] > 0) {
                    this.trails[idx] *= 0.82; // Desvanecimiento progresivo
                    if (this.trails[idx] < 0.05) this.trails[idx] = 0;
                }
            }
        }

        // Intercambiar buffers
        const temp = this.grid;
        this.grid = this.nextGrid;
        this.nextGrid = temp;

        this.generation++;
        this.aliveCount = alive;
        this.updateStats();
    }

    /**
     * Renderiza la grilla y las células en el Canvas
     */
    draw() {
        const width = this.cols * this.cellSize;
        const height = this.rows * this.cellSize;
        const currentTheme = this.themes[this.themeIndex];

        // Limpiar fondo
        this.ctx.fillStyle = '#030712';
        this.ctx.fillRect(0, 0, width, height);

        // Dibuja la cuadrícula sutil si está habilitada
        if (this.showGrid && this.cellSize >= 6) {
            this.ctx.strokeStyle = currentTheme.grid;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();

            for (let c = 0; c <= this.cols; c++) {
                const x = c * this.cellSize;
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, height);
            }
            for (let r = 0; r <= this.rows; r++) {
                const y = r * this.cellSize;
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(width, y);
            }
            this.ctx.stroke();
        }

        // Renderizado de estelas (fade out de células muertas)
        if (this.showGlow) {
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const idx = r * this.cols + c;
                    const trailIntensity = this.trails[idx];

                    if (trailIntensity > 0.05 && this.grid[idx] === 0) {
                        const x = c * this.cellSize;
                        const y = r * this.cellSize;
                        this.ctx.fillStyle = currentTheme.trail;
                        this.ctx.globalAlpha = trailIntensity;
                        this.ctx.fillRect(x + 1, y + 1, this.cellSize - 1, this.cellSize - 1);
                    }
                }
            }
            this.ctx.globalAlpha = 1.0;
        }

        // Renderizado de células vivas con brillo radiante
        this.ctx.fillStyle = currentTheme.alive;

        // Efecto de resplandor sutil (glow)
        if (this.showGlow) {
            this.ctx.shadowColor = currentTheme.alive;
            this.ctx.shadowBlur = this.cellSize > 8 ? 8 : 4;
        } else {
            this.ctx.shadowBlur = 0;
        }

        const padding = this.cellSize > 6 ? 1 : 0;
        const size = this.cellSize - (padding * 2);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const idx = r * this.cols + c;
                if (this.grid[idx] === 1) {
                    const x = c * this.cellSize + padding;
                    const y = r * this.cellSize + padding;

                    if (this.cellSize > 12) {
                        // Bordes ligeramente redondeados para estilo moderno
                        this.drawRoundedRect(this.ctx, x, y, size, size, 3);
                    } else {
                        this.ctx.fillRect(x, y, size, size);
                    }
                }
            }
        }

        // Resetear sombra para hover
        this.ctx.shadowBlur = 0;

        // Indicador de Cursor Hover
        if (this.hoverX >= 0 && this.hoverX < this.cols && this.hoverY >= 0 && this.hoverY < this.rows) {
            this.ctx.strokeStyle = currentTheme.alive;
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(
                this.hoverX * this.cellSize + 0.5,
                this.hoverY * this.cellSize + 0.5,
                this.cellSize - 1,
                this.cellSize - 1
            );
        }
    }

    /**
     * Dibuja un rectángulo con esquinas redondeadas
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Llena la grilla de forma aleatoria según la densidad indicada
     */
    randomizeGrid(density = 0.2) {
        let alive = 0;
        const total = this.cols * this.rows;
        for (let i = 0; i < total; i++) {
            const val = Math.random() < density ? 1 : 0;
            this.grid[i] = val;
            this.trails[i] = val ? 1.0 : 0;
            if (val) alive++;
        }
        this.generation = 0;
        this.aliveCount = alive;
        this.updateStats();
        this.draw();
    }

    /**
     * Limpia completamente la grilla
     */
    clearGrid() {
        this.grid.fill(0);
        this.nextGrid.fill(0);
        this.trails.fill(0);
        this.generation = 0;
        this.aliveCount = 0;
        this.updateStats();
        this.draw();
    }

    /**
     * Actualiza las estadísticas mostradas en UI
     */
    updateStats() {
        const genText = this.generation.toLocaleString();
        const aliveText = this.aliveCount.toLocaleString();

        if (this.genCounter) this.genCounter.textContent = genText;
        if (this.aliveCounter) this.aliveCounter.textContent = aliveText;
        if (this.genCounterMobile) this.genCounterMobile.textContent = genText;
        if (this.aliveCounterMobile) this.aliveCounterMobile.textContent = aliveText;
    }

    /**
     * Alterna la simulación entre Play / Pausa
     */
    togglePlay() {
        this.isRunning = !this.isRunning;
        this.btnPlay.innerHTML = this.isRunning
            ? `<i data-lucide="pause" class="w-6 h-6 fill-current"></i>`
            : `<i data-lucide="play" class="w-6 h-6 fill-current"></i>`;
        
        lucide.createIcons();

        if (this.isRunning) {
            this.btnPlay.classList.remove('bg-emerald-500', 'hover:bg-emerald-400');
            this.btnPlay.classList.add('bg-amber-500', 'hover:bg-amber-400');
        } else {
            this.btnPlay.classList.remove('bg-amber-500', 'hover:bg-amber-400');
            this.btnPlay.classList.add('bg-emerald-500', 'hover:bg-emerald-400');
        }
    }

    /**
     * Carga un patrón famoso en el centro de la grilla
     */
    loadPattern(patternName) {
        this.clearGrid();
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);

        let coords = [];

        switch (patternName) {
            case 'glider':
                coords = [
                    [0, -1], [1, 0], [-1, 1], [0, 1], [1, 1]
                ];
                break;

            case 'gosperGun':
                coords = [
                    [-18, 0], [-17, 0], [-18, 1], [-17, 1],
                    [-8, 0], [-8, 1], [-8, 2], [-7, -1], [-7, 3], [-6, -2], [-6, 4], [-5, -2], [-5, 4], [-4, 1], [-3, -1], [-3, 3], [-2, 0], [-2, 1], [-2, 2], [-1, 1],
                    [2, -2], [2, -1], [2, 0], [3, -2], [3, -1], [3, 0], [4, -3], [4, 1], [6, -4], [6, -3], [6, 1], [6, 2],
                    [16, -2], [16, -1], [17, -2], [17, -1]
                ];
                break;

            case 'pulsar':
                coords = [
                    // Quadrant 1
                    [-2, -4], [-3, -4], [-4, -4], [-2, -9], [-3, -9], [-4, -9],
                    [-4, -2], [-4, -3], [-4, -4], [-9, -2], [-9, -3], [-9, -4],
                    // Quadrant 2
                    [2, -4], [3, -4], [4, -4], [2, -9], [3, -9], [4, -9],
                    [4, -2], [4, -3], [4, -4], [9, -2], [9, -3], [9, -4],
                    // Quadrant 3
                    [-2, 4], [-3, 4], [-4, 4], [-2, 9], [-3, 9], [-4, 9],
                    [-4, 2], [-4, 3], [-4, 4], [-9, 2], [-9, 3], [-9, 4],
                    // Quadrant 4
                    [2, 4], [3, 4], [4, 4], [2, 9], [3, 9], [4, 9],
                    [4, 2], [4, 3], [4, 4], [9, 2], [9, 3], [9, 4]
                ];
                break;

            case 'lwss': // Lightweight Spaceship
                coords = [
                    [-1, -1], [2, -1], [-2, 0], [-2, 1], [2, 1], [-2, 2], [-1, 2], [0, 2], [1, 2]
                ];
                break;

            case 'pentadecathlon':
                coords = [
                    [-1, -4], [0, -4], [1, -4],
                    [-1, -3], [1, -3],
                    [-1, -2], [0, -2], [1, -2],
                    [-1, -1], [0, -1], [1, -1],
                    [-1, 0], [0, 0], [1, 0],
                    [-1, 1], [0, 1], [1, 1],
                    [-1, 2], [1, 2],
                    [-1, 3], [0, 3], [1, 3]
                ];
                break;

            case 'acorn':
                coords = [
                    [-3, -1], [-2, -1], [-2, 1], [0, 0], [1, -1], [2, -1], [3, -1]
                ];
                break;
        }

        let alive = 0;
        coords.forEach(([dx, dy]) => {
            const x = centerX + dx;
            const y = centerY + dy;
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                const idx = y * this.cols + x;
                this.grid[idx] = 1;
                this.trails[idx] = 1.0;
                alive++;
            }
        });

        this.aliveCount = alive;
        this.generation = 0;
        this.updateStats();
        this.draw();
    }

    /**
     * Interpola una línea entre dos coordenadas de ratón (Algoritmo de Bresenham)
     * Evita huecos cuando el usuario arrastra el ratón rápidamente
     */
    drawCellLine(x0, y0, x1, y1, state) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let currX = x0;
        let currY = y0;

        while (true) {
            if (currX >= 0 && currX < this.cols && currY >= 0 && currY < this.rows) {
                const idx = currY * this.cols + currX;
                if (this.grid[idx] !== state) {
                    this.grid[idx] = state;
                    this.trails[idx] = state ? 1.0 : 0;
                    this.aliveCount += state ? 1 : -1;
                }
            }

            if (currX === x1 && currY === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                currX += sx;
            }
            if (e2 < dx) {
                err += dx;
                currY += sy;
            }
        }
        this.updateStats();
    }

    /**
     * Configuración de Listeners de Eventos (Mouse, Touch, Teclado, UI)
     */
    setupEventListeners() {
        // Redimensionamiento de ventana
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Eventos de Mouse / Touch sobre el Canvas
        const getCanvasCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            const x = Math.floor((clientX - rect.left) / this.cellSize);
            const y = Math.floor((clientY - rect.top) / this.cellSize);
            return { x, y };
        };

        const handleStart = (e) => {
            const { x, y } = getCanvasCoords(e);
            if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
                this.isDrawing = true;
                const idx = y * this.cols + x;
                
                // Determinar si vamos a dibujar o borrar basado en la célula inicial
                this.drawMode = this.grid[idx] === 1 ? 0 : 1;
                this.drawCellLine(x, y, x, y, this.drawMode);
                this.lastX = x;
                this.lastY = y;
                this.draw();
            }
        };

        const handleMove = (e) => {
            const { x, y } = getCanvasCoords(e);
            this.hoverX = x;
            this.hoverY = y;

            if (this.isDrawing) {
                if (this.lastX !== -1 && this.lastY !== -1) {
                    this.drawCellLine(this.lastX, this.lastY, x, y, this.drawMode);
                }
                this.lastX = x;
                this.lastY = y;
            }
            this.draw();
        };

        const handleEnd = () => {
            this.isDrawing = false;
            this.lastX = -1;
            this.lastY = -1;
        };

        // Eventos Canvas
        this.canvas.addEventListener('mousedown', handleStart);
        this.canvas.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleStart(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleMove(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', handleEnd);

        this.canvas.addEventListener('mouseleave', () => {
            this.hoverX = -1;
            this.hoverY = -1;
            this.draw();
        });

        // Botones Principales de Control
        this.btnPlay.addEventListener('click', () => this.togglePlay());
        
        this.btnStep.addEventListener('click', () => {
            if (this.isRunning) this.togglePlay();
            this.step();
            this.draw();
        });

        this.btnRandom.addEventListener('click', () => {
            this.randomizeGrid(0.2);
        });

        this.btnClear.addEventListener('click', () => {
            this.clearGrid();
        });

        // Desplegable de Patrones Famosos
        this.btnPresets.addEventListener('click', () => {
            this.presetsPanel.classList.toggle('hidden');
        });

        this.closePresets.addEventListener('click', () => {
            this.presetsPanel.classList.add('hidden');
        });

        document.querySelectorAll('.preset-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const pattern = e.currentTarget.getAttribute('data-pattern');
                this.loadPattern(pattern);
                this.presetsPanel.classList.add('hidden');
            });
        });

        // Sliders
        this.sliderSpeed.addEventListener('input', (e) => {
            this.targetFps = parseInt(e.target.value);
            this.speedLabel.innerHTML = `${this.targetFps}<span class="text-[10px]">fps</span>`;
        });

        this.sliderSize.addEventListener('input', (e) => {
            this.cellSize = parseInt(e.target.value);
            this.sizeLabel.innerHTML = `${this.cellSize}<span class="text-[10px]">px</span>`;
            this.resizeCanvas();
        });

        // Toggles
        this.btnToggleGrid.addEventListener('click', () => {
            this.showGrid = !this.showGrid;
            this.btnToggleGrid.classList.toggle('bg-emerald-500/10', this.showGrid);
            this.btnToggleGrid.classList.toggle('text-emerald-400', this.showGrid);
            this.btnToggleGrid.classList.toggle('bg-slate-800', !this.showGrid);
            this.btnToggleGrid.classList.toggle('text-slate-500', !this.showGrid);
            this.draw();
        });

        this.btnToggleGlow.addEventListener('click', () => {
            this.showGlow = !this.showGlow;
            this.btnToggleGlow.classList.toggle('bg-emerald-500/10', this.showGlow);
            this.btnToggleGlow.classList.toggle('text-emerald-400', this.showGlow);
            this.btnToggleGlow.classList.toggle('bg-slate-800', !this.showGlow);
            this.btnToggleGlow.classList.toggle('text-slate-500', !this.showGlow);
            this.draw();
        });

        // Cambio de Tema
        this.btnTheme.addEventListener('click', () => {
            this.themeIndex = (this.themeIndex + 1) % this.themes.length;
            this.draw();
        });

        // Modal de Información
        this.btnInfo.addEventListener('click', () => {
            this.modalInfo.classList.remove('hidden');
        });

        this.closeInfo.addEventListener('click', () => {
            this.modalInfo.classList.add('hidden');
        });

        this.modalInfo.addEventListener('click', (e) => {
            if (e.target === this.modalInfo) {
                this.modalInfo.classList.add('hidden');
            }
        });

        // Atajos de Teclado
        window.addEventListener('keydown', (e) => {
            // Ignorar si el usuario está escribiendo en un input
            if (e.target.tagName === 'INPUT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowRight':
                case 'KeyN':
                    e.preventDefault();
                    if (this.isRunning) this.togglePlay();
                    this.step();
                    this.draw();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.randomizeGrid(0.2);
                    break;
                case 'KeyC':
                    e.preventDefault();
                    this.clearGrid();
                    break;
                case 'Escape':
                    this.modalInfo.classList.add('hidden');
                    this.presetsPanel.classList.add('hidden');
                    break;
            }
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos Lucide
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Crear instancia del Juego de la Vida
    window.game = new GameOfLife();
});

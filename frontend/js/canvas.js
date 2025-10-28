/**
 * Canvas Drawing Handler
 * Manages all drawing functionality on the canvas
 */

let canvas = null;
let ctx = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';
let currentBrushSize = 3;
let isEraser = false;

// Initialize canvas
function initializeCanvas() {
    canvas = document.getElementById('drawingCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    ctx = canvas.getContext('2d');
    
    // Set canvas properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Setup event listeners
    setupCanvasEventListeners();
    setupDrawingTools();
    
    console.log('✅ Canvas initialized');
}

// ==================== EVENT LISTENERS ====================

function setupCanvasEventListeners() {
    // Mouse events
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);
}

function setupDrawingTools() {
    // Color picker
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.addEventListener('change', (e) => {
            currentColor = e.target.value;
            isEraser = false;
            updateCursor();
        });
    }
    
    // Brush size
    const brushSize = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    if (brushSize) {
        brushSize.addEventListener('input', (e) => {
            currentBrushSize = parseInt(e.target.value);
            if (brushSizeValue) {
                brushSizeValue.textContent = currentBrushSize;
            }
            updateCursor();
        });
    }
    
    // Eraser button
    const eraserBtn = document.getElementById('eraserBtn');
    if (eraserBtn) {
        eraserBtn.addEventListener('click', () => {
            isEraser = !isEraser;
            eraserBtn.classList.toggle('active', isEraser);
            eraserBtn.style.background = isEraser 
                ? 'linear-gradient(135deg, #4facfe, #00f2fe)' 
                : 'linear-gradient(135deg, #f093fb, #f5576c)';
            updateCursor();
        });
    }
    
    // Clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear the entire canvas?')) {
                clearDrawingCanvas();
                if (window.socketClient) {
                    window.socketClient.clearCanvas();
                }
            }
        });
    }
}

// ==================== MOUSE EVENTS ====================

function handleMouseDown(e) {
    if (!window.socketClient || !window.socketClient.isDrawer()) {
        return;
    }
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Draw a dot for single click
    drawDot(lastX, lastY);
}

function handleMouseMove(e) {
    if (!isDrawing || !window.socketClient || !window.socketClient.isDrawer()) {
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    drawLine(lastX, lastY, x, y);
    
    // Send drawing data to server
    if (window.socketClient) {
        window.socketClient.sendDrawing({
            type: 'line',
            x1: lastX,
            y1: lastY,
            x2: x,
            y2: y,
            color: isEraser ? '#FFFFFF' : currentColor,
            size: currentBrushSize
        });
    }
    
    lastX = x;
    lastY = y;
}

function handleMouseUp() {
    isDrawing = false;
}

// ==================== TOUCH EVENTS ====================

function handleTouchStart(e) {
    if (!window.socketClient || !window.socketClient.isDrawer()) {
        return;
    }
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = (touch.clientX - rect.left) * (canvas.width / rect.width);
    lastY = (touch.clientY - rect.top) * (canvas.height / rect.height);
    isDrawing = true;
    
    drawDot(lastX, lastY);
}

function handleTouchMove(e) {
    if (!isDrawing || !window.socketClient || !window.socketClient.isDrawer()) {
        return;
    }
    
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
    
    drawLine(lastX, lastY, x, y);
    
    if (window.socketClient) {
        window.socketClient.sendDrawing({
            type: 'line',
            x1: lastX,
            y1: lastY,
            x2: x,
            y2: y,
            color: isEraser ? '#FFFFFF' : currentColor,
            size: currentBrushSize
        });
    }
    
    lastX = x;
    lastY = y;
}

function handleTouchEnd() {
    isDrawing = false;
}

// ==================== DRAWING FUNCTIONS ====================

function drawLine(x1, y1, x2, y2, color = null, size = null) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color || (isEraser ? '#FFFFFF' : currentColor);
    ctx.lineWidth = size || currentBrushSize;
    ctx.stroke();
    ctx.closePath();
}

function drawDot(x, y, color = null, size = null) {
    ctx.beginPath();
    ctx.arc(x, y, (size || currentBrushSize) / 2, 0, Math.PI * 2);
    ctx.fillStyle = color || (isEraser ? '#FFFFFF' : currentColor);
    ctx.fill();
    ctx.closePath();
}

function drawOnCanvas(data) {
    if (data.type === 'line') {
        drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size);
    } else if (data.type === 'dot') {
        drawDot(data.x, data.y, data.color, data.size);
    }
}

function clearDrawingCanvas() {
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function updateCursor() {
    if (canvas) {
        if (isEraser) {
            canvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\'><rect x=\'2\' y=\'2\' width=\'20\' height=\'20\'/></svg>") 12 12, auto';
        } else {
            canvas.style.cursor = 'crosshair';
        }
    }
}

// ==================== DRAWING INTERFACE CONTROL ====================

function showDrawingInterface(word, category) {
    const wordDisplay = document.getElementById('wordDisplay');
    const currentWord = document.getElementById('currentWord');
    const categoryDisplay = document.getElementById('currentCategory');
    const drawingTools = document.getElementById('drawingTools');
    const statusMessage = document.getElementById('statusMessage');
    
    if (wordDisplay && currentWord) {
        currentWord.textContent = word;
        wordDisplay.style.display = 'block';
    }
    
    if (categoryDisplay) {
        categoryDisplay.textContent = category;
    }
    
    if (drawingTools) {
        drawingTools.style.display = 'block';
    }
    
    if (statusMessage) {
        statusMessage.style.display = 'none';
    }
    
    // Enable canvas for drawing
    if (canvas) {
        canvas.style.pointerEvents = 'auto';
    }
}

function hideDrawingInterface() {
    const wordDisplay = document.getElementById('wordDisplay');
    const drawingTools = document.getElementById('drawingTools');
    const statusMessage = document.getElementById('statusMessage');
    
    if (wordDisplay) {
        wordDisplay.style.display = 'none';
    }
    
    if (drawingTools) {
        drawingTools.style.display = 'none';
    }
    
    if (statusMessage) {
        const statusText = statusMessage.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Watch and guess what the artist is drawing!';
        }
        statusMessage.style.display = 'flex';
    }
    
    // Disable canvas for drawing (view only)
    if (canvas) {
        canvas.style.pointerEvents = 'none';
    }
}

// Initialize canvas when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCanvas);
} else {
    initializeCanvas();
}
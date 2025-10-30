/**
 * Drawing Permissions Handler
 * Manages drawing permissions and canvas state
 */

function enableDrawing() {
    window.isDrawer = true;
    const canvas = document.getElementById('drawingCanvas');
    if (canvas) {
        canvas.style.cursor = 'crosshair';
    }
    
    // Show drawing tools
    const drawingTools = document.getElementById('drawingTools');
    if (drawingTools) {
        drawingTools.style.display = 'flex';
    }
}

function disableDrawing() {
    window.isDrawer = false;
    const canvas = document.getElementById('drawingCanvas');
    if (canvas) {
        canvas.style.cursor = 'not-allowed';
    }
    
    // Hide drawing tools
    const drawingTools = document.getElementById('drawingTools');
    if (drawingTools) {
        drawingTools.style.display = 'none';
    }
}

// Export functions for use in other modules
window.enableDrawing = enableDrawing;
window.disableDrawing = disableDrawing;
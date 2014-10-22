var gol         = null;
var golAnimator = null;
var golUI       = null;

window.onerror = function(errorMessage) {
    GOLUIPanelSupport.show(true, errorMessage, false, gol);
};

$(document).ready(function() {

    var canvas   = document.getElementById("golCanvas");
    var cellSize = 4;

    // Set cell size from query string (if supplied)
    var qsMatches = window.location.search.match(/^\?cs=(\d+)$/);
    if (qsMatches !== null) {
        var qsCellSize = parseInt(qsMatches[1]);
        if (qsCellSize >= 1 && qsCellSize <= 20) {
            cellSize = qsCellSize;
        }
    }

    // Resize canvas to fill the window
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Seems necessary to prevent window scrollbars appearing
    canvas.height -= 6;

    try {
        gol = new GOL(canvas, cellSize);
    } catch (e) {
        // Error when starting WebGL
        GOLUIPanelSupport.show(true, e.message, true, null);
        return;
    }

    try {
        gol.init();
    } catch (e) {
        // Error when: fetching shader source code,
        // compiling/linking WebGLProgram, rendering, etc
        GOLUIPanelSupport.show(true, e.message, false, gol);
        return;
    }

    golAnimator = new GOLAnimator(gol, "divActualFramerate");

    golUI = new GOLUI(gol, golAnimator);
    golUI.init();

    golAnimator.start();

});

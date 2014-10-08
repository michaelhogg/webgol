window.onerror = function(errorMessage) {
    alert("Something went wrong :(\n\n" + errorMessage);
};

var gol         = null;
var golAnimator = null;
var golUI       = null;

$(document).ready(function() {

    var canvas   = document.getElementById('golCanvas');
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

    gol = new GOL(canvas, cellSize);
    gol.init();
    gol.randomiseState();
    gol.renderState();

    var targetFPS = 15;

    golAnimator = new GOLAnimator(gol, targetFPS, "divActualFramerate");
    golAnimator.start();

    golUI = new GOLUI(gol, golAnimator);
    golUI.init(cellSize, targetFPS);

});

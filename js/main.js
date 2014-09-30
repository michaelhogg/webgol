window.onerror = function(errorMessage) {
    alert("Something went wrong :(\n\n" + errorMessage);
};

var gol         = null;
var golAnimator = null;
var golUI       = null;

$(document).ready(function() {

    var canvas   = document.getElementById('golCanvas');
    var cellSize = 4;

    // Resize canvas to fill the window
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Seems necessary to prevent window scrollbars appearing
    canvas.height -= 6;

    gol = new GOL(canvas, cellSize);
    gol.setRandom();
    gol.draw();

    var targetFPS = 15;

    golAnimator = new GOLAnimator(gol, targetFPS, "divActualFramerate");
    golAnimator.start();

    $(document).on('keyup', function(event) {
        switch (event.which) {
            case 82: /* r */
                gol.setRandom();
                gol.draw();
                break;
            case 80: /* p */
                golAnimator.toggle();
                break;
            case 83: /* s */
                if (!golAnimator.isRunning()) {
                    gol.stepAndDraw();
                }
                break;
        }
    });

    golUI = new GOLUI(gol, golAnimator);
    golUI.init(targetFPS);

});

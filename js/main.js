/* Initialize everything. */
var gol = null, controller = null;
$(document).ready(function() {
    var $canvas = $('#life');
    gol = new GOL($canvas[0]).draw().start();
    controller = new Controller(gol);
});

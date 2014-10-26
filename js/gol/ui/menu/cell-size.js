/**
 * Game Of Life user interface: Cell Size menu
 *
 * @param {GOL} gol
 */
function GOLUIMenuCellSize(gol) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

}

/**
 * Initialise
 */
GOLUIMenuCellSize.prototype.init = function() {

    var cellSizes = [];

    for (var i = 1; i <= 20; i++) {
        cellSizes.push(i);
    }

    GOLUIUtils.populateMenuWithValues(
        $("#selectCellSize"),
        cellSizes,
        this.gol.CELL_SIZE
    );

    $("#selectCellSize").on("change", function() {
        var cellSize = parseInt($(this).val());
        window.location.href = "index.html?cs=" + cellSize;
    });

};

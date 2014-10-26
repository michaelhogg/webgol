/**
 * Game Of Life user interface: Random mode: Randomise button
 *
 * @param {GOL} gol
 */
function GOLUIButtonRandomModeRandomise(gol) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

}

/**
 * Initialise
 */
GOLUIButtonRandomModeRandomise.prototype.init = function() {

    var _this = this;

    $("#buttonRandomModeRandomise").on("click", function() {
        _this.gol.randomiseState();
        _this.gol.renderState();
    });

};

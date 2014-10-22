/**
 * Game Of Life user interface: Switchery for the "wrapping" checkbox
 *
 * @param {GOL} gol
 */
function GOLUISwitcheryWrapping(gol) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

    /**
     * @type {(Switchery|null)}
     */
    this.switchery = null;

}

/**
 * Initialise
 */
GOLUISwitcheryWrapping.prototype.init = function() {

    this.switchery = GOLUIUtils.createSwitchery("checkboxSwitcheryWrapping");

    var _this = this;

    $("#checkboxSwitcheryWrapping").on("change", function() {
        _this.gol.toggleWrapping();
        GOLUIUtils.updateSwitcheryState(_this.switchery, _this.gol.enableWrapping);
    });

    GOLUIUtils.updateSwitcheryState(this.switchery, this.gol.enableWrapping);

};

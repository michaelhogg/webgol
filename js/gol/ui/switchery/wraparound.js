/**
 * Game Of Life user interface: Switchery for the "wraparound" checkbox
 *
 * @param {GOL} gol
 */
function GOLUISwitcheryWraparound(gol) {

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
GOLUISwitcheryWraparound.prototype.init = function() {

    this.switchery = GOLUIUtils.createSwitchery("checkboxSwitcheryWraparound");

    var _this = this;

    $("#checkboxSwitcheryWraparound").on("change", function() {
        _this.gol.toggleWraparound();
        GOLUIUtils.updateSwitcheryState(_this.switchery, _this.gol.enableWraparound);
    });

    GOLUIUtils.updateSwitcheryState(this.switchery, this.gol.enableWraparound);

};

/**
 * Game Of Life user interface: Switchery for the "mutation" checkbox
 *
 * @param {GOL} gol
 */
function GOLUISwitcheryMutation(gol) {

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
GOLUISwitcheryMutation.prototype.init = function() {

    this.switchery = GOLUIUtils.createSwitchery("checkboxSwitcheryRandomModeMutation");

    var _this = this;

    $("#checkboxSwitcheryRandomModeMutation").on("change", function() {
        _this.gol.toggleMutation();
        GOLUIUtils.updateSwitcheryState(_this.switchery, _this.gol.enableMutation);
    });

    GOLUIUtils.updateSwitcheryState(this.switchery, this.gol.enableMutation);

};

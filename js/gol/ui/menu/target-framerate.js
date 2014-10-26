/**
 * Game Of Life user interface: Target Framerate menu
 *
 * @param {GOLAnimator} golAnimator
 */
function GOLUIMenuTargetFramerate(golAnimator) {

    /**
     * @type {GOLAnimator}
     */
    this.golAnimator = golAnimator;

}

/**
 * Initialise
 */
GOLUIMenuTargetFramerate.prototype.init = function() {

    var framerates = [
        0.25, 0.5, 1, 2, 4, 6, 8, 10, 15, 20, 25, 30, 40, 50, 60
    ];

    GOLUIUtils.populateMenuWithValues(
        $("#selectTargetFramerate"),
        framerates,
        this.golAnimator.targetFPS
    );

    var _this = this;

    $("#selectTargetFramerate").on("change", function() {
        var framerate = parseFloat($(this).val());
        _this.golAnimator.changeTargetFramerate(framerate);
    });

};

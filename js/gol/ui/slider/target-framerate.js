/**
 * Game Of Life user interface: Target Framerate slider
 *
 * @param {GOLAnimator} golAnimator
 */
function GOLUISliderTargetFramerate(golAnimator) {

    /**
     * @type {GOLAnimator}
     */
    this.golAnimator = golAnimator;

}

/**
 * Initialise
 */
GOLUISliderTargetFramerate.prototype.init = function() {

    $("#sliderTargetFramerate").val(this.golAnimator.targetFPS);
    $("#divTargetFramerate").text(this.golAnimator.targetFPS);

    var _this = this;

    $("#sliderTargetFramerate").on("input", function() {
        var framerate = parseInt($(this).val());
        _this.golAnimator.changeTargetFramerate(framerate);
        $("#divTargetFramerate").text(framerate);
    });

};

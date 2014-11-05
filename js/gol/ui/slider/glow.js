/**
 * Game Of Life user interface: Glow slider
 *
 * @param {GOLGPU} gpu
 */
function GOLUISliderGlow(gpu) {

    /**
     * @type {GOLGPU}
     */
    this.gpu = gpu;

}

/**
 * Initialise
 */
GOLUISliderGlow.prototype.init = function() {

    $("#sliderGlow").val(this.gpu.blurBrighteningFactor * 10);
    $("#divGlow").text(this.gpu.blurBrighteningFactor * 10);

    var _this = this;

    $("#sliderGlow").on("input", function() {
        var glow = parseInt($(this).val());
        _this.gpu.blurBrighteningFactor = glow / 10;
        $("#divGlow").text(glow);
    });

};

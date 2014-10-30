/* ---- JSHint ----- */
/* exported GOLUtils */

/**
 * Game Of Life utilities
 */
var GOLUtils = {

    /**
     * Get WebGL info
     *
     * @param   {GOL} gol
     * @returns {string[]}
     */
    getWebglInfo: function(gol) {

        var gl   = gol.gl;
        var info = [
            "Vendor = "                   + gl.getParameter(gl.VENDOR),
            "Renderer = "                 + gl.getParameter(gl.RENDERER),
            "Version = "                  + gl.getParameter(gl.VERSION),
            "Shading language version = " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
        ];

        // gl.getSupportedExtensions() could also be added to info

        gl.getError();  // Clear any error (in case a parameter could not be found)

        return info;

    },

    /**
     * Get WebGL warnings
     *
     * @param   {GOL} gol
     * @returns {string[]}
     */
    getWebglWarnings: function(gol) {

        var gl       = gol.gl;
        var warnings = [];

        if (!(gol.igloo.canvas.getContext("webgl"             ) instanceof WebGLRenderingContext) &&
             (gol.igloo.canvas.getContext("experimental-webgl") instanceof WebGLRenderingContext))
        {
            warnings.push(
                "Browser indicates WebGL support is experimental; not all WebGL " +
                "functionality may be supported, and content may not run as expected"
            );
        }

        if (gl.getParameter(gl.RED_BITS  ) !== gol.BITS_PER_PIXEL_CHANNEL ||
            gl.getParameter(gl.GREEN_BITS) !== gol.BITS_PER_PIXEL_CHANNEL ||
            gl.getParameter(gl.BLUE_BITS ) !== gol.BITS_PER_PIXEL_CHANNEL ||
            gl.getParameter(gl.ALPHA_BITS) !== gol.BITS_PER_PIXEL_CHANNEL)
        {
            warnings.push(
                "The number of bits per pixel channel should be " +
                gol.BITS_PER_PIXEL_CHANNEL + ", but are actually: " +
                "red = "     + gl.getParameter(gl.RED_BITS  ) +
                ", green = " + gl.getParameter(gl.GREEN_BITS) +
                ", blue = "  + gl.getParameter(gl.BLUE_BITS ) +
                ", alpha = " + gl.getParameter(gl.ALPHA_BITS)
            );
        }

        var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        if (gol.STATE_WIDTH > maxTextureSize || gol.STATE_HEIGHT > maxTextureSize) {
            warnings.push(
                "Required texture size is "           + gol.STATE_WIDTH + " x " + gol.STATE_HEIGHT +
                " but max supported texture size is " + maxTextureSize  + " x " + maxTextureSize
            );
        }

        var maxViewportDimensions = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
        var viewportDetails       = gl.getParameter(gl.VIEWPORT);

        if (gol.VIEW_WIDTH > maxViewportDimensions[0] || gol.VIEW_HEIGHT > maxViewportDimensions[1]) {
            warnings.push(
                "Required viewport size for canvas is " + gol.VIEW_WIDTH           + " x " + gol.VIEW_HEIGHT          +
                " but max supported viewport size is "  + maxViewportDimensions[0] + " x " + maxViewportDimensions[1] +
                " and current viewport size is "        + viewportDetails[2]       + " x " + viewportDetails[3]
            );
        }

        gl.getError();  // Clear any error (in case a parameter could not be found)

        return warnings;

    }

};

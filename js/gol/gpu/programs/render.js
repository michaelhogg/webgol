/**
 * Game Of Life GPU program: Render
 *
 * Render the GOL state to a texture, using interpolated colours
 *
 * @extends GOLGPUProgram
 * @param {GOLGPU} gpu
 * @param {string} vertexSourceCode
 * @param {string} fragmentSourceCode
 * @throws Error if compiling or linking fails
 */
function GOLGPUProgramRender(gpu, vertexSourceCode, fragmentSourceCode) {

    // Call parent constructor
    GOLGPUProgram.call(this, gpu, vertexSourceCode, fragmentSourceCode);

}

/**
 * Run
 *
 * @param {Igloo.Texture} textureIn
 * @param {Igloo.Texture} textureOut
 * @throws Error if something goes wrong
 */
GOLGPUProgramRender.prototype.run = function(textureIn, textureOut) {

    // Render to the off-screen framebuffer
    // and write the rendered image to the textureOut texture
    this.gpu.offscreenFramebuffer.attach(textureOut);

    this.gpu.setViewport(this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT);

    var inputTextures = [
        { samplerName: "uSampler", texture: textureIn }
    ];

    var floatUniforms = [
        { name: "uColourTopLeft",     value: this.gol.cornerColours.topLeft     },
        { name: "uColourTopRight",    value: this.gol.cornerColours.topRight    },
        { name: "uColourBottomLeft",  value: this.gol.cornerColours.bottomLeft  },
        { name: "uColourBottomRight", value: this.gol.cornerColours.bottomRight }
    ];

    var intUniforms = [];

    // Throws an error if something goes wrong
    GOLGPUProgram.prototype.run.call(this, inputTextures, floatUniforms, intUniforms);

};

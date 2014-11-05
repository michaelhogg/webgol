/**
 * Game Of Life GPU program: Blur
 *
 * Apply a Gaussian blur filter in one direction (horizontal or vertical)
 *
 * @extends GOLGPUProgram
 * @param {GOLGPU} gpu
 * @param {string} vertexSourceCode
 * @param {string} fragmentSourceCode
 * @throws Error if compiling or linking fails
 */
function GOLGPUProgramBlur(gpu, vertexSourceCode, fragmentSourceCode) {

    // Call parent constructor
    GOLGPUProgram.call(this, gpu, vertexSourceCode, fragmentSourceCode);

}

/**
 * Run
 *
 * @param {Igloo.Texture} textureIn
 * @param {Igloo.Texture} textureOut
 * @param {boolean}       doVerticalBlur    - If false, do horizontal blur
 * @param {number}        brighteningFactor - 1.0 means no brightening
 * @throws Error if something goes wrong
 */
GOLGPUProgramBlur.prototype.run = function(textureIn, textureOut, doVerticalBlur, brighteningFactor) {

    var blurDirection = (
        doVerticalBlur               ?
        new Float32Array([0.0, 1.0]) :
        new Float32Array([1.0, 0.0])
    );

    // Render to the off-screen framebuffer
    // and write the rendered image to the textureOut texture
    this.gpu.offscreenFramebuffer.attach(textureOut);

    this.gpu.setViewport(this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT);

    var inputTextures = [
        { samplerName: "uSampler", texture: textureIn }
    ];

    var floatUniforms = [
        { name: "uDimensions",        value: new Float32Array([this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT]) },
        { name: "uBlurDirection",     value: blurDirection                                                   },
        { name: "uBrighteningFactor", value: brighteningFactor                                               }
    ];

    var intUniforms = [];

    // Throws an error if something goes wrong
    GOLGPUProgram.prototype.run.call(this, inputTextures, floatUniforms, intUniforms);

};

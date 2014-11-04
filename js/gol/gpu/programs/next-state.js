/**
 * Game Of Life GPU program: Next state
 *
 * Step the GOL state on the GPU, without rendering anything to the screen/canvas
 *
 * @extends GOLGPUProgram
 * @param {GOLGPU} gpu
 * @param {string} vertexSourceCode
 * @param {string} fragmentSourceCode
 * @throws Error if compiling or linking fails
 */
function GOLGPUProgramNextState(gpu, vertexSourceCode, fragmentSourceCode) {

    // Call parent constructor
    GOLGPUProgram.call(this, gpu, vertexSourceCode, fragmentSourceCode);

}

/**
 * Run
 *
 * @throws Error if something goes wrong
 */
GOLGPUProgramNextState.prototype.run = function() {

    // Render to the off-screen framebuffer
    // and write the rendered image to the temp texture
    this.gpu.offscreenFramebuffer.attach(this.gpu.textures.temp);

    this.gpu.setViewport(this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT);

    var inputTextures = [
        { samplerName: "uSampler", texture: this.gpu.textures.state }
    ];

    var floatUniforms = [
        { name: "uStateDimensions", value: new Float32Array([this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT]) }
    ];

    var intUniforms = [
        { name: "uEnableWrapping", value: (this.gol.enableWrapping ? 1 : 0) }
    ];

    // Throws an error if something goes wrong
    GOLGPUProgram.prototype.run.call(this, inputTextures, floatUniforms, intUniforms);

};

/**
 * Game Of Life GPU program: Add and display
 *
 * Add two textures together, and display the result on the user's screen/canvas
 *
 * @extends GOLGPUProgram
 * @param {GOLGPU} gpu
 * @param {string} vertexSourceCode
 * @param {string} fragmentSourceCode
 * @throws Error if compiling or linking fails
 */
function GOLGPUProgramAddAndDisplay(gpu, vertexSourceCode, fragmentSourceCode) {

    // Call parent constructor
    GOLGPUProgram.call(this, gpu, vertexSourceCode, fragmentSourceCode);

}

/**
 * Run
 *
 * @param {Igloo.Texture} textureInA
 * @param {Igloo.Texture} textureInB
 * @throws Error if something goes wrong
 */
GOLGPUProgramAddAndDisplay.prototype.run = function(textureInA, textureInB) {

    // Bind the default framebuffer (the user's screen/canvas) for rendering
    this.gpu.bindDefaultFramebuffer();

    this.gpu.setViewport(this.gol.VIEW_WIDTH, this.gol.VIEW_HEIGHT);

    var inputTextures = [
        { samplerName: "uSamplerA", texture: textureInA },
        { samplerName: "uSamplerB", texture: textureInB }
    ];

    var floatUniforms = [];
    var intUniforms   = [];

    // Throws an error if something goes wrong
    GOLGPUProgram.prototype.run.call(this, inputTextures, floatUniforms, intUniforms);

};

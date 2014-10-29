/**
 * Game Of Life GPU program: Render
 *
 * Render the GOL state (stored on the GPU) to the user's screen/canvas
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
 * @throws Error if something goes wrong
 */
GOLGPUProgramRender.prototype.run = function() {

    // Bind the default framebuffer (the user's screen/canvas) for rendering
    this.gpu.bindDefaultFramebuffer();

    this.gpu.setViewport(this.gol.VIEW_WIDTH, this.gol.VIEW_HEIGHT);

    var inputTexture = this.gpu.textures.stateMain;

    var floatUniforms = [
        { name: "viewDimensions",    value: new Float32Array([this.gol.VIEW_WIDTH, this.gol.VIEW_HEIGHT]) },
        { name: "colourTopLeft",     value: this.gol.cornerColours.topLeft                                },
        { name: "colourTopRight",    value: this.gol.cornerColours.topRight                               },
        { name: "colourBottomLeft",  value: this.gol.cornerColours.bottomLeft                             },
        { name: "colourBottomRight", value: this.gol.cornerColours.bottomRight                            }
    ];

    var intUniforms = [];

    // Throws an error if something goes wrong
    GOLGPUProgram.prototype.run.call(this, inputTexture, floatUniforms, intUniforms);

};

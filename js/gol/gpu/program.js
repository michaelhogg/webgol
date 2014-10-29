/**
 * Game Of Life GPU program
 *
 * @param {GOLGPU} gpu
 * @param {string} vertexSourceCode
 * @param {string} fragmentSourceCode
 * @throws Error if compiling or linking fails
 */
function GOLGPUProgram(gpu, vertexSourceCode, fragmentSourceCode) {

    /**
     * @type {GOLGPU}
     */
    this.gpu = gpu;

    /**
     * @type {GOL}
     */
    this.gol = gpu.gol;

    /**
     * Igloo-wrapped WebGLProgram object
     * @type {Igloo.Program}
     * @throws Error if compiling or linking fails
     */
    this.program = new Igloo.Program(gpu.gl, vertexSourceCode, fragmentSourceCode);

}

/**
 * Run
 *
 * @param {Igloo.Texture} inputTexture
 * @param {object[]}      floatUniforms
 * @param {object[]}      intUniforms
 * @throws Error if drawing fails
 */
GOLGPUProgram.prototype.run = function(inputTexture, floatUniforms, intUniforms) {

    var textureUnitIndex = 0;  // Evaluates to TextureUnit TEXTURE0
    var i;

    // Make the specified texture unit active, and bind the inputTexture to it
    inputTexture.bind(textureUnitIndex);

    // Make the program active
    this.program.use();

    // Make the triangle strip's vertex attribute data available to the vertex shader
    this.program.attrib(
        "quad",
        this.gpu.triangleStrip.vertexBuffer,
        this.gpu.triangleStrip.componentsPerVertexAttribute
    );

    // Specify the texture unit to be used by the sampler in the fragment shaders
    // (this makes the inputTexture accessible in the shaders via the sampler)
    this.program.uniformi("sampler", textureUnitIndex);

    // Set the float uniform variables
    for (i = 0; i < floatUniforms.length; i++) {
        this.program.uniform(
            floatUniforms[i].name,
            floatUniforms[i].value
        );
    }

    // Set the int uniform variables
    for (i = 0; i < intUniforms.length; i++) {
        this.program.uniformi(
            intUniforms[i].name,
            intUniforms[i].value
        );
    }

    // Render the triangle strip
    // (throws an error if something goes wrong)
    this.program.draw(
        this.gpu.triangleStrip.primitivesMode,
        this.gpu.triangleStrip.totalVertices
    );

};

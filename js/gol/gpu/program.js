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
 * @param {object[]} inputTextures
 * @param {object[]} floatUniforms
 * @param {object[]} intUniforms
 * @throws Error if something goes wrong
 */
GOLGPUProgram.prototype.run = function(inputTextures, floatUniforms, intUniforms) {

    if (inputTextures.length > this.gpu.MAX_TEXTURE_UNITS) {
        throw new Error(
            "Too many texture units requested " +
            "(available: " + this.gpu.MAX_TEXTURE_UNITS + ", " +
            "requested: "  + inputTextures.length       + ")"
        );
    }

    var i;

    // Bind the textures to the texture units, where i is:
    // * the index into the inputTextures array, and
    // * the TextureUnit number (TEXTURE0, TEXTURE1, TEXTURE2, etc)
    for (i = 0; i < inputTextures.length; i++) {
        inputTextures[i].texture.bind(i);
    }

    // Make the program active
    this.program.use();

    // Make the triangle strip's vertex attribute data available to the vertex shader
    this.program.attrib(
        "aVertex",
        this.gpu.triangleStrip.vertexBuffer,
        this.gpu.triangleStrip.componentsPerVertexAttribute
    );

    // Map the texture units to uniform sampler variables in the fragment shader, where i is:
    // * the index into the inputTextures array, and
    // * the TextureUnit number (TEXTURE0, TEXTURE1, TEXTURE2, etc)
    for (i = 0; i < inputTextures.length; i++) {
        this.program.uniformi(
            inputTextures[i].samplerName,
            i
        );
    }

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

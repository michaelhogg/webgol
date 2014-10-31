/**
 * Game Of Life GPU
 *
 * @param {GOL} gol
 */
function GOLGPU(gol) {

    /**
     * @type {GOL}
     */
    this.gol = gol;

    /**
     * @type {Igloo}
     */
    this.igloo = gol.igloo;

    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = gol.gl;

}

/**
 * Initialise
 *
 * @throws Error if something goes wrong
 */
GOLGPU.prototype.init = function() {

    try {
        /**
         * GOLGPUProgram-wrapped WebGLProgram objects
         * @type {GOLGPUProgram}
         */
        this.gpuPrograms = {
            // Throws an error if compiling or linking fails
            nextState: new GOLGPUProgramNextState(this, GOLShaderSources.vNextState, GOLShaderSources.fNextState),
            render:    new GOLGPUProgramRender(   this, GOLShaderSources.vRender,    GOLShaderSources.fRender   )
        };
    } catch (e) {
        throw new Error("Error compiling or linking WebGLProgram: " + e.message);
    }

    /**
     * Triangle strip data for the vertex shader
     * @type {object}
     */
    this.triangleStrip = {

        /**
         * Type of primitives to render
         * @type {number}
         */
        primitivesMode: this.gl.TRIANGLE_STRIP,

        /**
         * Igloo-wrapped WebGLBuffer object holding vertex attribute data
         * of a triangle strip which fills the entire render area
         * @type {Igloo.Buffer}
         */
        vertexBuffer: this.igloo.array(
            new Float32Array([
                -1, -1,  // Normalised XY coords
                 1, -1,
                -1,  1,
                 1,  1
            ])
        ),

        /**
         * Number of components per vertex attribute
         * @type {number}
         */
        componentsPerVertexAttribute: 2,

        /**
         * Total number of vertices
         * @type {number}
         */
        totalVertices: 4

    };

    /**
     * Igloo-wrapped WebGLTexture objects
     * @type {Igloo.Texture}
     */
    this.textures = {
        stateMain: this.createTexture(),
        stateTemp: this.createTexture()
    };

    /**
     * Igloo-wrapped off-screen WebGLFramebuffer for rendering and reading texture data
     * @type {Igloo.Framebuffer}
     */
    this.offscreenFramebuffer = this.igloo.framebuffer();

};

/**
 * Create a new blank 2D texture
 *
 * @returns {Igloo.Texture}
 * @throws Error if something goes wrong
 */
GOLGPU.prototype.createTexture = function() {

    // ArrayBufferView, ImageData, HTMLImageElement, HTMLCanvasElement or HTMLVideoElement
    var imageSource = null;

    // TextureWrapMode enum -- must be CLAMP_TO_EDGE to support textures with NPOT dimensions (non-power-of-two)
    var wrapMode = this.gl.CLAMP_TO_EDGE;

    // TextureMinFilter and TextureMagFilter enums
    var minifyMagnifyFilter = this.gl.NEAREST;

    // Create texture
    var texture = this.igloo.texture(imageSource, this.gol.TEXTURE_PIXELFORMAT, wrapMode, minifyMagnifyFilter);

    // Set size and fill with 0
    texture.blank(this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT);

    switch (this.gl.getError()) {
        case this.gl.NO_ERROR:
            break;
        case this.gl.INVALID_VALUE:
            throw new Error("Failed to create texture (requested texture size " + this.gol.STATE_WIDTH + " x " + this.gol.STATE_HEIGHT + " was probably too big)");
        default:
            throw new Error("Failed to create texture (unknown error)");
    }

    return texture;

};

/**
 * Get state pixels
 *
 * @returns {Uint8Array}
 */
GOLGPU.prototype.getStatePixels = function() {

    var rgba = new Uint8Array(this.gol.TOTAL_CELLS * this.gol.CHANNELS_PER_PIXEL);

    // Make the off-screen framebuffer active
    // and attach the stateMain texture for readPixels() to read
    this.offscreenFramebuffer.attach(this.textures.stateMain);

    this.gl.readPixels(
        0,                             // x
        0,                             // y
        this.gol.STATE_WIDTH,          // width
        this.gol.STATE_HEIGHT,         // height
        this.gol.TEXTURE_PIXELFORMAT,  // PixelFormat
        this.gol.TEXTURE_PIXELTYPE,    // PixelType
        rgba                           // array to receive pixel data
    );

    return rgba;

};

/**
 * Set state pixels
 *
 * @param {Uint8Array} rgba
 */
GOLGPU.prototype.setStatePixels = function(rgba) {

    this.textures.stateMain.subset(rgba, 0, 0, this.gol.STATE_WIDTH, this.gol.STATE_HEIGHT);

};

/**
 * Set a state pixel
 *
 * @param {number}     x
 * @param {number}     y
 * @param {Uint8Array} rgba
 * @throws Error if x or y is invalid
 */
GOLGPU.prototype.setStatePixel = function(x, y, rgba) {

    if (x < 0)  throw new Error("Invalid X coord: " + x);
    if (y < 0)  throw new Error("Invalid Y coord: " + y);

    if (x >= this.gol.STATE_WIDTH)   throw new Error("Invalid X coord: " + x + " (state width is "  + this.gol.STATE_WIDTH  + ")");
    if (y >= this.gol.STATE_HEIGHT)  throw new Error("Invalid Y coord: " + y + " (state height is " + this.gol.STATE_HEIGHT + ")");

    this.textures.stateMain.subset(rgba, x, y, 1, 1);

};

/**
 * Set the viewport
 *
 * @param {number} width
 * @param {number} height
 */
GOLGPU.prototype.setViewport = function(width, height) {

    this.gl.viewport(0, 0, width, height);

};

/**
 * Bind the default framebuffer (the user's screen/canvas) for rendering
 */
GOLGPU.prototype.bindDefaultFramebuffer = function() {

    this.igloo.defaultFramebuffer.bind();

};

/**
 * Swap the state textures
 */
GOLGPU.prototype.swapStateTextures = function() {

    var tmp = this.textures.stateMain;

    this.textures.stateMain = this.textures.stateTemp;
    this.textures.stateTemp = tmp;

};

/**
 * Step the GOL state on the GPU, without rendering anything to the screen/canvas
 *
 * @throws Error if program execution fails
 */
GOLGPU.prototype.calculateNextState = function() {

    this.gpuPrograms.nextState.run();

    this.swapStateTextures();

};

/**
 * Render the GOL state (stored on the GPU) to the user's screen/canvas
 *
 * @throws Error if program execution fails
 */
GOLGPU.prototype.renderState = function() {

    this.gpuPrograms.render.run();

};

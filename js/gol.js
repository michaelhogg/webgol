/**
 * Game of Life simulation and display.
 *
 * @param {HTMLCanvasElement} canvas   - Render target
 * @param {number}            cellSize - Size of each cell (in pixels)
 */
function GOL(canvas, cellSize) {

    /**
     * Size of each cell (in pixels)
     * @type {number}
     */
    this.cellSize = cellSize;

    /**
     * Igloo object (WebGL wrapper API)
     * @type {Igloo}
     */
    this.igloo = new Igloo(canvas);

    /**
     * WebGL rendering context associated with the canvas
     * @type {WebGLRenderingContext}
     */
    this.gl = this.igloo.gl;

    if (!(this.gl instanceof WebGLRenderingContext)) {
        throw new Error("Failed to initialise WebGL");
    }

    /**
     * Width of the view (canvas)
     * @type {number}
     */
    this.viewWidth = canvas.width;

    /**
     * Height of the view (canvas)
     * @type {number}
     */
    this.viewHeight = canvas.height;

    /**
     * Width of the GOL state (number of cells)
     * @type {number}
     */
    this.stateWidth = canvas.width / cellSize;

    /**
     * Height of the GOL state (number of cells)
     * @type {number}
     */
    this.stateHeight = canvas.height / cellSize;

    /**
     * Total number of cells in the GOL state
     * @type {number}
     */
    this.totalCells = this.stateWidth * this.stateHeight;

    /**
     * Should the GOL state wrap horizontally and vertically?
     * @type {boolean}
     */
    this.enableStateWrapping = true;

    /**
     * Unix timestamp (in seconds) of the latest GOL state update
     * @type {number}
     */
    this.lasttick = GOL.now();

    /**
     * Measured frames-per-second (only valid when the animation is running)
     * @type {number}
     */
    this.fps = 0;

    /**
     * Igloo-wrapped WebGLProgram objects
     * @type {Igloo.Program}
     */
    this.programs = {
        copy: this.igloo.program('glsl/quad.vert', 'glsl/copy.frag'),
        gol:  this.igloo.program('glsl/quad.vert', 'glsl/gol.frag')
    };

    /**
     * Triangle strip data for the vertex shader
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
        front: this.createTexture(),
        back:  this.createTexture()
    };

    /**
     * Igloo-wrapped off-screen WebGLFramebuffer for rendering and reading texture data
     * @type {Igloo.Framebuffer}
     */
    this.offscreenFramebuffer = this.igloo.framebuffer();

    /**
     * Colours of the four corners, in RGBA format
     * @type {Float32Array}
     */
    this.cornerColours = {
        topLeft:     new Float32Array([1.0, 1.0, 0.0, 1.0]),  // Yellow
        topRight:    new Float32Array([1.0, 0.0, 0.0, 1.0]),  // Red
        bottomLeft:  new Float32Array([0.0, 1.0, 0.0, 1.0]),  // Green
        bottomRight: new Float32Array([0.3, 0.3, 1.0, 1.0])   // Blue
    };

    /**
     * PixelType of textures created by Igloo
     * @constant {number}
     */
    this.TEXTURE_PIXELTYPE = this.gl.UNSIGNED_BYTE;  // Corresponds to JavaScript's Uint8Array

    /**
     * PixelFormat to use for textures
     * @constant {number}
     */
    this.TEXTURE_PIXELFORMAT = this.gl.RGBA;

    /**
     * Maximum value that a pixel's channel can have
     * @constant {number}
     */
    this.PIXEL_CHANNEL_MAX_VALUE = 255;  // PixelType is UNSIGNED_BYTE

}

/**
 * @returns {number} The epoch in integer seconds
 */
GOL.now = function() {

    return Math.floor(Date.now() / 1000);

};

/**
 * Create a new blank 2D texture to hold a GOL simulation state
 *
 * @returns {Igloo.Texture}
 */
GOL.prototype.createTexture = function() {

    // ArrayBufferView, ImageData, HTMLImageElement, HTMLCanvasElement or HTMLVideoElement
    var imageSource = null;

    // TextureWrapMode enum -- must be CLAMP_TO_EDGE to support textures with NPOT dimensions (non-power-of-two)
    var wrapMode = this.gl.CLAMP_TO_EDGE;

    // TextureMinFilter and TextureMagFilter enums
    var minifyMagnifyFilter = this.gl.NEAREST;

    // Create texture
    var texture = this.igloo.texture(imageSource, this.TEXTURE_PIXELFORMAT, wrapMode, minifyMagnifyFilter);

    // Set size and fill with 0
    texture.blank(this.stateWidth, this.stateHeight);

    return texture;

};

/**
 * Get the simulation state.
 *
 * @returns {boolean[]}
 */
GOL.prototype.get = function() {

    var rgba  = new Uint8Array(this.totalCells * 4);
    var state = [];
    var i, ii, r;

    // Make the off-screen framebuffer active
    // and attach the "front" texture for readPixels() to read
    this.offscreenFramebuffer.attach(this.textures.front);

    this.gl.readPixels(
        0,  // x
        0,  // y
        this.stateWidth,   // width
        this.stateHeight,  // height
        this.TEXTURE_PIXELFORMAT,  // PixelFormat
        this.TEXTURE_PIXELTYPE,    // PixelType
        rgba  // array to receive pixel data
    );

    for (i = 0; i < this.totalCells; i++) {

        ii = i * 4;
        r  = rgba[ii + 0];

        // This matches getCellState() in the shaders
        state[i] = (r === this.PIXEL_CHANNEL_MAX_VALUE);

    }

    return state;

};

/**
 * Set the simulation state.
 *
 * @param {boolean[]} state
 */
GOL.prototype.set = function(state) {

    var rgba = new Uint8Array(this.totalCells * 4);
    var i, ii;

    for (i = 0; i < state.length; i++) {

        ii = i * 4;

        // This matches COLOUR_ALIVE and COLOUR_DEAD in the shaders
        rgba[ii + 0] = (state[i] ? this.PIXEL_CHANNEL_MAX_VALUE : 0);  // red
        rgba[ii + 1] = 0;  // green
        rgba[ii + 2] = 0;  // blue
        rgba[ii + 3] = this.PIXEL_CHANNEL_MAX_VALUE;  // alpha

    }

    this.textures.front.subset(rgba, 0, 0, this.stateWidth, this.stateHeight);

};

/**
 * Fill the simulation state with random values.
 */
GOL.prototype.setRandom = function() {

    var aliveProbability = 0.5;

    var rand = [];

    for (var i = 0; i < this.totalCells; i++) {
        rand[i] = Math.random() < aliveProbability ? true : false;
    }

    this.set(rand);

};

/**
 * Clear the simulation state (all cells dead).
 */
GOL.prototype.setEmpty = function() {

    var state = [];

    for (var i = 0; i < this.totalCells; i++) {
        state[i] = false;
    }

    this.set(state);

};

/**
 * Swap the texture buffers.
 */
GOL.prototype.swap = function() {

    var tmp = this.textures.front;

    this.textures.front = this.textures.back;
    this.textures.back  = tmp;

};

/**
 * Run a program
 *
 * @param {Igloo.Program} program
 * @param {Igloo.Texture} inputTexture
 * @param {object[]}      floatUniforms
 * @param {object[]}      intUniforms
 */
GOL.prototype.runProgram = function(program, inputTexture, floatUniforms, intUniforms) {

    var textureUnitIndex = 0;  // Evaluates to TextureUnit TEXTURE0
    var i;

    // Make the specified texture unit active, and bind the inputTexture to it
    inputTexture.bind(textureUnitIndex);

    // Make the program active
    program.use();

    // Make the triangle strip's vertex attribute data available to the vertex shader
    program.attrib(
        'quad',
        this.triangleStrip.vertexBuffer,
        this.triangleStrip.componentsPerVertexAttribute
    );

    // Specify the texture unit to be used by the sampler in the fragment shaders
    // (this makes the inputTexture accessible in the shaders via the sampler)
    program.uniformi('sampler', textureUnitIndex);

    // Set the float uniform variables
    for (i = 0; i < floatUniforms.length; i++) {
        program.uniform(
            floatUniforms[i].name,
            floatUniforms[i].value
        );
    }

    // Set the int uniform variables
    for (i = 0; i < intUniforms.length; i++) {
        program.uniformi(
            intUniforms[i].name,
            intUniforms[i].value
        );
    }

    // Render the triangle strip
    program.draw(
        this.triangleStrip.primitivesMode,
        this.triangleStrip.totalVertices
    );

};

/**
 * Step the Game of Life state on the GPU without rendering anything.
 */
GOL.prototype.step = function() {

    if (GOL.now() != this.lasttick) {
        $('.fps').text(this.fps + ' FPS');
        this.lasttick = GOL.now();
        this.fps = 0;
    } else {
        this.fps++;
    }

    // Render to the off-screen framebuffer
    // and write the rendered image to the "back" texture
    this.offscreenFramebuffer.attach(this.textures.back);

    this.gl.viewport(0, 0, this.stateWidth, this.stateHeight);

    var floatUniforms = [
        { name: 'stateDimensions', value: new Float32Array([this.stateWidth, this.stateHeight]) }
    ];

    var intUniforms = [
        { name: 'enableWrapping', value: (this.enableStateWrapping ? 1 : 0) }
    ];

    this.runProgram(this.programs.gol, this.textures.front, floatUniforms, intUniforms);

    this.swap();

};

/**
 * Render the Game of Life state stored on the GPU.
 */
GOL.prototype.draw = function() {

    // Render to the default framebuffer (the user's screen)
    this.igloo.defaultFramebuffer.bind();

    this.gl.viewport(0, 0, this.viewWidth, this.viewHeight);

    var floatUniforms = [
        { name: 'viewDimensions',    value: new Float32Array([this.viewWidth, this.viewHeight]) },
        { name: 'colourTopLeft',     value: this.cornerColours.topLeft                          },
        { name: 'colourTopRight',    value: this.cornerColours.topRight                         },
        { name: 'colourBottomLeft',  value: this.cornerColours.bottomLeft                       },
        { name: 'colourBottomRight', value: this.cornerColours.bottomRight                      }
    ];

    var intUniforms = [];

    this.runProgram(this.programs.copy, this.textures.front, floatUniforms, intUniforms);

};

/**
 * Step the GOL state on the GPU, and then render it
 */
GOL.prototype.stepAndDraw = function() {

    this.step();
    this.draw();

};

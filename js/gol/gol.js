/**
 * Game Of Life
 *
 * @param {HTMLCanvasElement} canvas   - Render target
 * @param {number}            cellSize - Size of each cell (in pixels)
 * @throws Error if WebGL fails to initialise
 */
function GOL(canvas, cellSize) {

    if (!window.WebGLRenderingContext) {
        throw new Error("Browser does not support WebGLRenderingContext");
    }

    /**
     * Size of each cell (in pixels)
     * @constant {number}
     */
    this.CELL_SIZE = cellSize;

    /**
     * Igloo object (WebGL wrapper API)
     * @type {Igloo}
     */
    this.igloo = new Igloo(canvas);

    if (!(this.igloo.gl instanceof WebGLRenderingContext)) {
        throw new Error("Browser does support WebGLRenderingContext, but failed to initialise WebGL");
    }

    /**
     * WebGL rendering context associated with the canvas
     * @type {WebGLRenderingContext}
     */
    this.gl = this.igloo.gl;

    /**
     * Width of the view (canvas)
     * @constant {number}
     */
    this.VIEW_WIDTH = canvas.width;

    /**
     * Height of the view (canvas)
     * @constant {number}
     */
    this.VIEW_HEIGHT = canvas.height;

    /**
     * Width of the GOL state (number of cells)
     * @constant {number}
     */
    this.STATE_WIDTH = Math.floor(canvas.width / cellSize);

    /**
     * Height of the GOL state (number of cells)
     * @constant {number}
     */
    this.STATE_HEIGHT = Math.floor(canvas.height / cellSize);

    /**
     * Total number of cells in the GOL state
     * @constant {number}
     */
    this.TOTAL_CELLS = this.STATE_WIDTH * this.STATE_HEIGHT;

    /**
     * Should the GOL state wrap horizontally and vertically?
     * @type {boolean}
     */
    this.enableWrapping = true;

    /**
     * Should cells be randomly mutated? (only applicable in Random mode)
     * @type {boolean}
     */
    this.enableMutation = true;

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
     * Number of channels per pixel
     * @constant {number}
     */
    this.CHANNELS_PER_PIXEL = 4;  // RGBA

    /**
     * Maximum value that a pixel's channel can have
     * @constant {number}
     */
    this.PIXEL_CHANNEL_MAX_VALUE = 255;  // PixelType is UNSIGNED_BYTE

    /**
     * Number of bits per pixel channel
     * @constant {number}
     */
    this.BITS_PER_PIXEL_CHANNEL = 8;  // PixelType is UNSIGNED_BYTE

    /**
     * State colour of a dead cell (this matches COLOUR_DEAD in the fragment shaders)
     * @constant {Uint8Array}
     */
    this.COLOUR_DEAD = new Uint8Array([
        0,                            // red
        0,                            // green
        0,                            // blue
        this.PIXEL_CHANNEL_MAX_VALUE  // alpha
    ]);

    /**
     * State colour of a live cell (this matches COLOUR_ALIVE in the fragment shaders)
     * @constant {Uint8Array}
     */
    this.COLOUR_ALIVE = new Uint8Array([
        this.PIXEL_CHANNEL_MAX_VALUE,  // red
        0,                             // green
        0,                             // blue
        this.PIXEL_CHANNEL_MAX_VALUE   // alpha
    ]);

    /**
     * Constant representing Random mode
     * @constant {number}
     */
    this.MODE_RANDOM = 1;

    /**
     * Constant representing Patterns mode
     * @constant {number}
     */
    this.MODE_PATTERNS = 2;

    /**
     * Constant representing Custom mode
     * @constant {number}
     */
    this.MODE_CUSTOM = 3;

    /**
     * Number of cells to mutate per step (only applicable in Random mode)
     * @constant {number}
     */
    this.MUTATION_RATE = Math.ceil(0.00001 * this.TOTAL_CELLS);

}

/**
 * Initialise
 *
 * @throws Error if something goes wrong
 */
GOL.prototype.init = function() {

    var shaderSources = {
        // Throws an error if source code fetch fails
        vertex:            GOLUtils.fetchShaderSourceCode("glsl/triangle-strip.vert"),
        nextStateFragment: GOLUtils.fetchShaderSourceCode("glsl/next-state.frag"    ),
        renderFragment:    GOLUtils.fetchShaderSourceCode("glsl/render.frag"        )
    };

    /**
     * Igloo-wrapped WebGLProgram objects
     * @type {Igloo.Program}
     */
    try {
        this.programs = {
            // Throws an error if compiling or linking fails
            nextState: new Igloo.Program(this.gl, shaderSources.vertex, shaderSources.nextStateFragment),
            render:    new Igloo.Program(this.gl, shaderSources.vertex, shaderSources.renderFragment   )
        };
    } catch (e) {
        throw new Error("Error compiling or linking WebGLProgram: " + e.message);
    }

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
     * Current mode
     * @type {number}
     */
    this.currentMode = this.MODE_RANDOM;

    this.randomiseState();
    this.renderState();

};

/**
 * Create a new blank 2D texture to hold a GOL state
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
    texture.blank(this.STATE_WIDTH, this.STATE_HEIGHT);

    switch (this.gl.getError()) {
        case this.gl.NO_ERROR:
            break;
        case this.gl.INVALID_VALUE:
            throw new Error("Failed to create texture (requested texture size " + this.STATE_WIDTH + " x " + this.STATE_HEIGHT + " was probably too big)");
        default:
            throw new Error("Failed to create texture (unknown error)");
    }

    return texture;

};

/**
 * Iterate over all the cells in the GOL state
 *
 * @param {function} callback - Called for each cell
 */
GOL.prototype.iterateOverAllCells = function(callback) {

    var x        = 0;
    var y        = 0;
    var flippedY = this.STATE_HEIGHT - 1;
    var i, cellIndex, pixelIndex;

    for (i = 0; i < this.TOTAL_CELLS; i++) {

        // Flip vertically (state coord origin is top-left, but WebGL coord origin is bottom-left)
        cellIndex = (flippedY * this.STATE_WIDTH) + x;

        pixelIndex = i * this.CHANNELS_PER_PIXEL;

        callback.call(this, cellIndex, pixelIndex);

        x++;

        if (x >= this.STATE_WIDTH) {
            y++;
            x        = 0;
            flippedY = (this.STATE_HEIGHT - 1) - y;
        }

    }

};

/**
 * Get the GOL state as a GOLGrid object
 *
 * @returns {GOLGrid}
 */
GOL.prototype.getStateAsGOLGrid = function() {

    var golGrid = GOLGridFactory.createEmpty(this.STATE_WIDTH, this.STATE_HEIGHT);
    var rgba    = new Uint8Array(this.TOTAL_CELLS * this.CHANNELS_PER_PIXEL);
    var redChannel, cellState;

    // Make the off-screen framebuffer active
    // and attach the "front" texture for readPixels() to read
    this.offscreenFramebuffer.attach(this.textures.front);

    this.gl.readPixels(
        0,                         // x
        0,                         // y
        this.STATE_WIDTH,          // width
        this.STATE_HEIGHT,         // height
        this.TEXTURE_PIXELFORMAT,  // PixelFormat
        this.TEXTURE_PIXELTYPE,    // PixelType
        rgba                       // array to receive pixel data
    );

    this.iterateOverAllCells(function(cellIndex, pixelIndex) {

        // This matches getCellState() in the fragment shaders
        redChannel = rgba[pixelIndex + 0];
        cellState  = (redChannel === this.PIXEL_CHANNEL_MAX_VALUE);

        golGrid.cellData[cellIndex] = cellState;

    });

    return golGrid;

};

/**
 * Set the GOL state using a GOLGrid object
 *
 * @param {GOLGrid} golGrid
 */
GOL.prototype.setStateUsingGOLGrid = function(golGrid) {

    if (golGrid.width  !== this.STATE_WIDTH )  throw new Error("Grid width "  + golGrid.width  + " does not match GOL state width "  + this.STATE_WIDTH);
    if (golGrid.height !== this.STATE_HEIGHT)  throw new Error("Grid height " + golGrid.height + " does not match GOL state height " + this.STATE_HEIGHT);

    var rgba = new Uint8Array(this.TOTAL_CELLS * this.CHANNELS_PER_PIXEL);
    var cellState, pixelColour, c;

    this.iterateOverAllCells(function(cellIndex, pixelIndex) {

        cellState   = golGrid.cellData[cellIndex];
        pixelColour = (cellState ? this.COLOUR_ALIVE : this.COLOUR_DEAD);

        for (c = 0; c < this.CHANNELS_PER_PIXEL; c++) {
            rgba[pixelIndex + c] = pixelColour[c];
        }

    });

    this.textures.front.subset(rgba, 0, 0, this.STATE_WIDTH, this.STATE_HEIGHT);

};

/**
 * Fill the GOL state with random values
 */
GOL.prototype.randomiseState = function() {

    this.setStateUsingGOLGrid(
        GOLGridFactory.createRandomised(
            this.STATE_WIDTH,
            this.STATE_HEIGHT
        )
    );

};

/**
 * Clear the GOL state (all cells dead)
 */
GOL.prototype.clearState = function() {

    this.setStateUsingGOLGrid(
        GOLGridFactory.createEmpty(
            this.STATE_WIDTH,
            this.STATE_HEIGHT
        )
    );

};

/**
 * Set the state of one cell
 *
 * @param {number}  x
 * @param {number}  y
 * @param {boolean} state
 */
GOL.prototype.setCellState = function(x, y, state) {

    if (x < 0)  throw new Error("Invalid X coord: " + x);
    if (y < 0)  throw new Error("Invalid Y coord: " + y);

    if (x >= this.STATE_WIDTH)   throw new Error("Invalid X coord: " + x + " (width of state is "  + this.STATE_WIDTH  + ")");
    if (y >= this.STATE_HEIGHT)  throw new Error("Invalid Y coord: " + y + " (height of state is " + this.STATE_HEIGHT + ")");

    var rgba = (state ? this.COLOUR_ALIVE : this.COLOUR_DEAD);

    this.textures.front.subset(rgba, x, y, 1, 1);

};

/**
 * Mutate a random cell
 */
GOL.prototype.mutateRandomCell = function() {

    var x = Math.floor(Math.random() * this.STATE_WIDTH);
    var y = Math.floor(Math.random() * this.STATE_HEIGHT);

    this.setCellState(x, y, true);

};

/**
 * Toggle the wrapping of the GOL state
 */
GOL.prototype.toggleWrapping = function() {

    this.enableWrapping = !this.enableWrapping;

};

/**
 * Toggle whether cells should be randomly mutated (only applicable in Random mode)
 */
GOL.prototype.toggleMutation = function() {

    this.enableMutation = !this.enableMutation;

};

/**
 * Swap the texture buffers
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
 * @throws Error if drawing fails
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
        "quad",
        this.triangleStrip.vertexBuffer,
        this.triangleStrip.componentsPerVertexAttribute
    );

    // Specify the texture unit to be used by the sampler in the fragment shaders
    // (this makes the inputTexture accessible in the shaders via the sampler)
    program.uniformi("sampler", textureUnitIndex);

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
    // (throws an error if something goes wrong)
    program.draw(
        this.triangleStrip.primitivesMode,
        this.triangleStrip.totalVertices
    );

};

/**
 * Step the GOL state on the GPU, without rendering anything to the screen
 *
 * @throws Error if program drawing fails
 */
GOL.prototype.calculateNextState = function() {

    // Render to the off-screen framebuffer
    // and write the rendered image to the "back" texture
    this.offscreenFramebuffer.attach(this.textures.back);

    this.gl.viewport(0, 0, this.STATE_WIDTH, this.STATE_HEIGHT);

    var floatUniforms = [
        { name: "stateDimensions", value: new Float32Array([this.STATE_WIDTH, this.STATE_HEIGHT]) }
    ];

    var intUniforms = [
        { name: "enableWrapping", value: (this.enableWrapping ? 1 : 0) }
    ];

    this.runProgram(this.programs.nextState, this.textures.front, floatUniforms, intUniforms);

    this.swap();

};

/**
 * Render the GOL state (stored on the GPU) to the user's screen (canvas)
 *
 * @throws Error if program drawing fails
 */
GOL.prototype.renderState = function() {

    // Render to the default framebuffer (the user's screen)
    this.igloo.defaultFramebuffer.bind();

    this.gl.viewport(0, 0, this.VIEW_WIDTH, this.VIEW_HEIGHT);

    var floatUniforms = [
        { name: "viewDimensions",    value: new Float32Array([this.VIEW_WIDTH, this.VIEW_HEIGHT]) },
        { name: "colourTopLeft",     value: this.cornerColours.topLeft                            },
        { name: "colourTopRight",    value: this.cornerColours.topRight                           },
        { name: "colourBottomLeft",  value: this.cornerColours.bottomLeft                         },
        { name: "colourBottomRight", value: this.cornerColours.bottomRight                        }
    ];

    var intUniforms = [];

    this.runProgram(this.programs.render, this.textures.front, floatUniforms, intUniforms);

};

/**
 * Calculate the next GOL state, and render it to the screen
 *
 * @throws Error if program drawing fails
 */
GOL.prototype.calculateAndRenderNextState = function() {

    this.calculateNextState();

    if (this.currentMode === this.MODE_RANDOM && this.enableMutation) {
        for (var i = 0; i < this.MUTATION_RATE; i++) {
            this.mutateRandomCell();
        }
    }

    this.renderState();

};

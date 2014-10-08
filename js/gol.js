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
     * @type {number}
     */
    this.cellSize = cellSize;

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
    this.stateWidth = Math.floor(canvas.width / cellSize);

    /**
     * Height of the GOL state (number of cells)
     * @type {number}
     */
    this.stateHeight = Math.floor(canvas.height / cellSize);

    /**
     * Total number of cells in the GOL state
     * @type {number}
     */
    this.totalCells = this.stateWidth * this.stateHeight;

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
    this.MUTATION_RATE = Math.ceil(0.00001 * this.totalCells);

}

/**
 * Initialise
 *
 * @throws Error if something goes wrong in Igloo
 */
GOL.prototype.init = function() {

    /**
     * Current mode
     * @type {number}
     */
    this.currentMode = this.MODE_RANDOM;

    /**
     * Igloo-wrapped WebGLProgram objects
     * @type {Igloo.Program}
     */
    this.programs = {
        // Throws an error if compiling or linking fails
        copy: this.igloo.program("glsl/quad.vert", "glsl/copy.frag"),
        gol:  this.igloo.program("glsl/quad.vert", "glsl/gol.frag")
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
    texture.blank(this.stateWidth, this.stateHeight);

    return texture;

};

/**
 * Get the GOL state as a GOLGrid object
 *
 * @returns {GOLGrid}
 */
GOL.prototype.getStateAsGOLGrid = function() {

    var golGrid  = GOLGridFactory.createEmpty(this.stateWidth, this.stateHeight);
    var rgba     = new Uint8Array(this.totalCells * this.CHANNELS_PER_PIXEL);
    var x        = 0;
    var y        = 0;
    var flippedY = this.stateHeight - 1;
    var i, ii, redChannel, cellState, cellIndex;

    // Make the off-screen framebuffer active
    // and attach the "front" texture for readPixels() to read
    this.offscreenFramebuffer.attach(this.textures.front);

    this.gl.readPixels(
        0,                         // x
        0,                         // y
        this.stateWidth,           // width
        this.stateHeight,          // height
        this.TEXTURE_PIXELFORMAT,  // PixelFormat
        this.TEXTURE_PIXELTYPE,    // PixelType
        rgba                       // array to receive pixel data
    );

    for (i = 0; i < this.totalCells; i++) {

        // This matches getCellState() in the fragment shaders
        ii         = i * this.CHANNELS_PER_PIXEL;
        redChannel = rgba[ii + 0];
        cellState  = (redChannel === this.PIXEL_CHANNEL_MAX_VALUE);

        // Flip vertically (grid coord origin is top-left, but WebGL coord origin is bottom-left)
        cellIndex = (flippedY * this.stateWidth) + x;

        golGrid.cellData[cellIndex] = cellState;

        x++;

        if (x >= this.stateWidth) {
            y++;
            x        = 0;
            flippedY = (this.stateHeight - 1) - y;
        }

    }

    return golGrid;

};

/**
 * Set the GOL state using a GOLGrid object
 *
 * @param {GOLGrid} golGrid
 */
GOL.prototype.setStateUsingGOLGrid = function(golGrid) {

    if (golGrid.width  !== this.stateWidth )  throw new Error("Grid width "  + golGrid.width  + " does not match GOL state width "  + this.stateWidth);
    if (golGrid.height !== this.stateHeight)  throw new Error("Grid height " + golGrid.height + " does not match GOL state height " + this.stateHeight);

    var rgba     = new Uint8Array(this.totalCells * this.CHANNELS_PER_PIXEL);
    var x        = 0;
    var y        = 0;
    var flippedY = this.stateHeight - 1;
    var i, ii, cellIndex, cellState, pixelColour, c;

    for (i = 0; i < this.totalCells; i++) {

        // Flip vertically (grid coord origin is top-left, but WebGL coord origin is bottom-left)
        cellIndex = (flippedY * this.stateWidth) + x;

        cellState   = golGrid.cellData[cellIndex];
        pixelColour = (cellState ? this.COLOUR_ALIVE : this.COLOUR_DEAD);
        ii          = i * this.CHANNELS_PER_PIXEL;

        for (c = 0; c < this.CHANNELS_PER_PIXEL; c++) {
            rgba[ii + c] = pixelColour[c];
        }

        x++;

        if (x >= this.stateWidth) {
            y++;
            x        = 0;
            flippedY = (this.stateHeight - 1) - y;
        }

    }

    this.textures.front.subset(rgba, 0, 0, this.stateWidth, this.stateHeight);

};

/**
 * Fill the GOL state with random values
 */
GOL.prototype.randomiseState = function() {

    this.setStateUsingGOLGrid(
        GOLGridFactory.createRandomised(
            this.stateWidth,
            this.stateHeight
        )
    );

};

/**
 * Clear the GOL state (all cells dead)
 */
GOL.prototype.clearState = function() {

    this.setStateUsingGOLGrid(
        GOLGridFactory.createEmpty(
            this.stateWidth,
            this.stateHeight
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

    var rgba = (state ? this.COLOUR_ALIVE : this.COLOUR_DEAD);

    this.textures.front.subset(rgba, x, y, 1, 1);

};

/**
 * Mutate a random cell
 */
GOL.prototype.mutateRandomCell = function() {

    var x = Math.floor(Math.random() * this.stateWidth);
    var y = Math.floor(Math.random() * this.stateHeight);

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

    this.gl.viewport(0, 0, this.stateWidth, this.stateHeight);

    var floatUniforms = [
        { name: "stateDimensions", value: new Float32Array([this.stateWidth, this.stateHeight]) }
    ];

    var intUniforms = [
        { name: "enableWrapping", value: (this.enableWrapping ? 1 : 0) }
    ];

    this.runProgram(this.programs.gol, this.textures.front, floatUniforms, intUniforms);

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

    this.gl.viewport(0, 0, this.viewWidth, this.viewHeight);

    var floatUniforms = [
        { name: "viewDimensions",    value: new Float32Array([this.viewWidth, this.viewHeight]) },
        { name: "colourTopLeft",     value: this.cornerColours.topLeft                          },
        { name: "colourTopRight",    value: this.cornerColours.topRight                         },
        { name: "colourBottomLeft",  value: this.cornerColours.bottomLeft                       },
        { name: "colourBottomRight", value: this.cornerColours.bottomRight                      }
    ];

    var intUniforms = [];

    this.runProgram(this.programs.copy, this.textures.front, floatUniforms, intUniforms);

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

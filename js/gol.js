/**
 * Game of Life simulation and display.
 *
 * @param {HTMLCanvasElement} canvas   - Render target
 * @param {number}            cellSize - Size of each cell in pixels (power of 2)
 */
function GOL(canvas, cellSize) {

    /**
     * Size of each cell in pixels (power of 2)
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
        alert('Could not initialise WebGL!');
        throw new Error('No WebGL');
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
     * Unix timestamp (in seconds) of the latest GOL state update
     * @type {number}
     */
    this.lasttick = GOL.now();

    /**
     * Measured frames-per-second (only valid when the animation is running)
     * @type {number}
     */
    this.fps = 0;

    this.gl.disable(this.gl.DEPTH_TEST);

    /**
     * Igloo-wrapped WebGLProgram objects
     * @type {Igloo.Program}
     */
    this.programs = {
        copy: this.igloo.program('glsl/quad.vert', 'glsl/copy.frag'),
        gol:  this.igloo.program('glsl/quad.vert', 'glsl/gol.frag')
    };

    /**
     * Igloo-wrapped WebGLBuffer objects
     * @type {Igloo.Buffer}
     */
    this.buffers = {
        quad: this.igloo.array(Igloo.QUAD2)
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

    var imageSource         = null;             // ArrayBufferView, ImageData, HTMLImageElement, HTMLCanvasElement or HTMLVideoElement
    var wrapMode            = this.gl.REPEAT;   // TextureWrapMode enum
    var minifyMagnifyFilter = this.gl.NEAREST;  // TextureMinFilter and TextureMagFilter enums

    var texture = this.igloo.texture(imageSource, this.TEXTURE_PIXELFORMAT, wrapMode, minifyMagnifyFilter);

    texture.blank(this.stateWidth, this.stateHeight);  // Set size and fill with 0

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
    var i, ii, r, g, b, channelsSum;

    // Make the off-screen framebuffer active
    // and attach the "front" texture for readPixels() to read
    this.offscreenFramebuffer.attach(this.textures.front);

    this.gl.readPixels(0, 0, this.stateWidth, this.stateHeight, this.TEXTURE_PIXELFORMAT, this.TEXTURE_PIXELTYPE, rgba);

    for (i = 0; i < this.totalCells; i++) {

        ii = i * 4;
        r  = rgba[ii + 0];
        g  = rgba[ii + 1];
        b  = rgba[ii + 2];

        // This matches getCellState() in the GOL shader
        channelsSum = r + g + b;
        state[i]    = (channelsSum > 0) ? true : false;

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

    for (var i = 0; i < state.length; i++) {
        var ii = i * 4;
        rgba[ii + 0] = rgba[ii + 1] = rgba[ii + 2] = state[i] ? 255 : 0;
        rgba[ii + 3] = 255;
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

    var textureUnitIndex = 0;

    // Render to the off-screen framebuffer
    // and write the rendered image to the "back" texture
    this.offscreenFramebuffer.attach(this.textures.back);

    // Make the specified texture unit active, and bind the "front" texture to it
    this.textures.front.bind(textureUnitIndex);

    this.gl.viewport(0, 0, this.stateWidth, this.stateHeight);

    this.programs.gol.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('sampler', textureUnitIndex)
        .uniform('stateDimensions', new Float32Array([this.stateWidth, this.stateHeight]))
        .draw(this.gl.TRIANGLE_STRIP, 4);

    this.swap();

};

/**
 * Render the Game of Life state stored on the GPU.
 */
GOL.prototype.draw = function() {

    var textureUnitIndex = 0;

    // Render to the default framebuffer (the user's screen)
    this.igloo.defaultFramebuffer.bind();

    // Make the specified texture unit active, and bind the "front" texture to it
    this.textures.front.bind(textureUnitIndex);

    this.gl.viewport(0, 0, this.viewWidth, this.viewHeight);

    this.programs.copy.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('sampler', textureUnitIndex)
        .uniform('viewDimensions', new Float32Array([this.viewWidth, this.viewHeight]))
        .uniform('colourTopLeft',     this.cornerColours.topLeft)
        .uniform('colourTopRight',    this.cornerColours.topRight)
        .uniform('colourBottomLeft',  this.cornerColours.bottomLeft)
        .uniform('colourBottomRight', this.cornerColours.bottomRight)
        .draw(this.gl.TRIANGLE_STRIP, 4);

};

/**
 * Step the GOL state on the GPU, and then render it
 */
GOL.prototype.stepAndDraw = function() {

    this.step();
    this.draw();

};

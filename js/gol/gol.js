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
     * GOLGPU object (responsible for all GPU-related functionality)
     * @type {GOLGPU}
     */
    this.gpu = new GOLGPU(this);

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
        topLeft:     new Float32Array([1.0, 1.0, 0.1, 1.0]),  // Yellow
        topRight:    new Float32Array([1.0, 0.1, 0.1, 1.0]),  // Red
        bottomLeft:  new Float32Array([0.1, 1.0, 0.1, 1.0]),  // Green
        bottomRight: new Float32Array([0.1, 0.1, 1.0, 1.0])   // Blue
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
     * Current mode
     * @type {number}
     */
    this.currentMode = this.MODE_RANDOM;

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

    this.gpu.init();

    this.randomiseState();

    this.gpu.renderState();

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

    var rgba    = this.gpu.getStatePixels();
    var golGrid = GOLGridFactory.createEmpty(this.STATE_WIDTH, this.STATE_HEIGHT);
    var redChannel, cellState;

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
 * @throws Error if grid dimensions do not match GOL state dimensions
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

    this.gpu.setStatePixels(rgba);

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
 * @throws Error if x or y is invalid
 */
GOL.prototype.setCellState = function(x, y, state) {

    var rgba = (state ? this.COLOUR_ALIVE : this.COLOUR_DEAD);

    this.gpu.setStatePixel(x, y, rgba);

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
 * Calculate the next GOL state, and render it to the screen
 *
 * @throws Error if something goes wrong
 */
GOL.prototype.calculateAndRenderNextState = function() {

    this.gpu.calculateNextState();

    if (this.currentMode === this.MODE_RANDOM && this.enableMutation) {
        for (var i = 0; i < this.MUTATION_RATE; i++) {
            this.mutateRandomCell();
        }
    }

    this.gpu.renderState();

};

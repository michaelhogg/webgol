/**
 * Game of Life simulation and display.
 *
 * @param {HTMLCanvasElement} canvas   - Render target
 * @param {number}            cellSize - Size of each cell in pixels (power of 2)
 */
function GOL(canvas, cellSize) {

    this.cellSize = cellSize;
    this.igloo    = new Igloo(canvas);
    this.gl       = this.igloo.gl;

    if (this.gl == null) {
        alert('Could not initialise WebGL!');
        throw new Error('No WebGL');
    }

    var w = canvas.width,
        h = canvas.height;

    this.viewsize  = new Float32Array([w, h]);
    this.statesize = new Float32Array([w / cellSize, h / cellSize]);
    this.timer     = null;
    this.lasttick  = GOL.now();
    this.fps       = 0;

    this.gl.disable(this.gl.DEPTH_TEST);

    this.programs = {
        copy: this.igloo.program('glsl/quad.vert', 'glsl/copy.frag'),
        gol:  this.igloo.program('glsl/quad.vert', 'glsl/gol.frag')
    };

    this.buffers = {
        quad: this.igloo.array(Igloo.QUAD2)
    };

    this.textures = {
        front: this.igloo.texture(null, this.gl.RGBA, this.gl.REPEAT, this.gl.NEAREST).blank(this.statesize[0], this.statesize[1]),
        back:  this.igloo.texture(null, this.gl.RGBA, this.gl.REPEAT, this.gl.NEAREST).blank(this.statesize[0], this.statesize[1])
    };

    this.framebuffers = {
        step: this.igloo.framebuffer()
    };

    this.setRandom();

}

/**
 * @returns {number} The epoch in integer seconds
 */
GOL.now = function() {

    return Math.floor(Date.now() / 1000);

};

/**
 * Set the entire simulation state at once.
 *
 * @param {Object} state - Boolean array-like
 */
GOL.prototype.set = function(state) {

    var rgba = new Uint8Array(this.statesize[0] * this.statesize[1] * 4);

    for (var i = 0; i < state.length; i++) {
        var ii = i * 4;
        rgba[ii + 0] = rgba[ii + 1] = rgba[ii + 2] = state[i] ? 255 : 0;
        rgba[ii + 3] = 255;
    }

    this.textures.front.subset(rgba, 0, 0, this.statesize[0], this.statesize[1]);

};

/**
 * Fill the entire state with random values.
 *
 * @param {number} [p] - Chance of a cell being alive (0.0 to 1.0)
 */
GOL.prototype.setRandom = function(p) {

    var size = this.statesize[0] * this.statesize[1];

    p = p == null ? 0.5 : p;

    var rand = new Uint8Array(size);

    for (var i = 0; i < size; i++) {
        rand[i] = Math.random() < p ? 1 : 0;
    }

    this.set(rand);

};

/**
 * Clear the simulation state to empty.
 */
GOL.prototype.setEmpty = function() {

    this.set(new Uint8Array(this.statesize[0] * this.statesize[1]));

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

    this.framebuffers.step.attach(this.textures.back);
    this.textures.front.bind(0);

    this.gl.viewport(0, 0, this.statesize[0], this.statesize[1]);

    this.programs.gol.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('state', 0)
        .uniform('scale', this.statesize)
        .draw(this.gl.TRIANGLE_STRIP, 4);

    this.swap();

};

/**
 * Render the Game of Life state stored on the GPU.
 */
GOL.prototype.draw = function() {

    this.igloo.defaultFramebuffer.bind();
    this.textures.front.bind(0);

    this.gl.viewport(0, 0, this.viewsize[0], this.viewsize[1]);

    this.programs.copy.use()
        .attrib('quad', this.buffers.quad, 2)
        .uniformi('state', 0)
        .uniform('scale', this.viewsize)
        .draw(this.gl.TRIANGLE_STRIP, 4);

};

/**
 * @returns {Object} Boolean array-like of the simulation state
 */
GOL.prototype.get = function() {

    var w = this.statesize[0],
        h = this.statesize[1];

    this.framebuffers.step.attach(this.textures.front);

    var rgba = new Uint8Array(w * h * 4);

    this.gl.readPixels(0, 0, w, h, this.gl.RGBA, this.gl.UNSIGNED_BYTE, rgba);

    var state = new Uint8Array(w * h);

    for (var i = 0; i < w * h; i++) {
        state[i] = rgba[i * 4] > 128 ? 1 : 0;
    }

    return state;

};

/**
 * Run the simulation automatically on a timer.
 */
GOL.prototype.start = function() {

    if (this.timer == null) {
        this.timer = setInterval(function(){
            gol.step();
            gol.draw();
        }, 60);
    }

};

/**
 * Stop animating the simulation.
 */
GOL.prototype.stop = function() {

    clearInterval(this.timer);

    this.timer = null;

};

/**
 * Toggle the animation state.
 */
GOL.prototype.toggle = function() {

    if (this.timer == null) {
        this.start();
    } else {
        this.stop();
    }

};

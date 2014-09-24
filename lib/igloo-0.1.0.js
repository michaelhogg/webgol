/*---------------------------------------- vecn.js ----------------------------------------*/

/**
 * Fast, immutable vector implementations via metaprogramming.
 * @namespace
 * @constructor
 */
var VecN = VecN || function() {};

VecN.FIELDS = 'xyzwabcdefghijklmnopqrstuv'.split('');

VecN.make = function(n) {
    if (n > VecN.FIELDS.length) {
        throw new Error('VecN limited to ' + VecN.FIELDS.length);
    }

    function func(params, body) {
        var args = params.slice(0);
        args.push(body);
        args.unshift(null);
        var factory = Function.bind.apply(Function, args);
        return new factory();
    }

    var fields = VecN.FIELDS.slice(0, n);

    /**
     * @constructor
     */
    var Vec = func(fields, fields.map(function(field) {
        return 'this.' + field + ' = ' + field + ';';
    }).join('\n'));

    Vec.prototype = Object.create(VecN.prototype);
    Vec.prototype.constructor = Vec;
    Vec.prototype.length = n;
    Vec.prototype.VecN = this;

    Vec.prototype.toString
        = func([], 'return "[Vec' + n + ' (" + ' +
               fields.map(function(field) {
                   return 'this.' + field;
               }).join(' + ", " + ') + ' + ")]";');

    function create(f, constructor) {
        constructor = constructor || 'this.constructor';
        return 'return new ' + constructor +
            '(' + fields.map(f).join(', ') + ');';
    }

    function opWith(operator) {
        return func(['vec'], create(function(field) {
            return 'this.' + field + ' ' + operator + ' vec.' + field;
        }));
    }

    /**
     * @method
     */
    Vec.prototype.add = opWith('+');

    /**
     * @method
     */
    Vec.prototype.subtract = opWith('-');

    /**
     * @method
     */
    Vec.prototype.multiply = opWith('*');

    /**
     * @method
     */
    Vec.prototype.divide = opWith('/');

    function op(operator) {
        return func(['scalar'], create(function(field) {
            return 'this.' + field + ' ' + operator + ' scalar';
        }));
    }

    /**
     * @method
     */
    Vec.prototype.fadd = op('+');

    /**
     * @method
     */
    Vec.prototype.fsubtract = op('-');

    /**
     * @method
     */
    Vec.prototype.fmultiply = op('*');

    /**
     * @method
     */
    Vec.prototype.fdivide = op('/');

    /**
     * @method
     */
    Vec.prototype.magnitude =
        func([], 'return Math.sqrt(' + fields.map(function(f) {
            return 'this.' + f + ' * this.' + f;
        }).join(' + ') + ');');

    function apply(name, params) {
        params = params || [];
        return func(params, create(function(f) {
            var args = params.slice(0);
            args.unshift('this.' + f);
            return name + '(' + args.join(', ') + ')';
        }));
    };

    /**
     * @method
     */
    Vec.prototype.floor = apply('Math.floor');

    /**
     * @method
     */
    Vec.prototype.ceil = apply('Math.ceil');

    /**
     * @method
     */
    Vec.prototype.abs = apply('Math.abs');

    /**
     * @method
     */
    Vec.prototype.negate = apply('-1 * ');

    /**
     * @method
     */
    Vec.prototype.pow = apply('Math.pow', ['expt']);

    /**
     * @method
     */
    Vec.prototype.pow2 = func([], create(function(f) {
        return 'this.' + f + ' * this.' + f;
    }));

    /**
     * @method
     */
    Vec.prototype.pow3 = func([], create(function(f) {
        return 'this.' + f + ' * this.' + f + ' * this.' + f;
    }));

    /**
     * @method
     */
    Vec.prototype.product = func([], 'return ' + fields.map(function(f) {
        return 'this.' + f;
    }).join(' * ') + ';');


    /**
     * @method
     */
    Vec.prototype.sum = func([], 'return ' + fields.map(function(f) {
        return 'this.' + f;
    }).join(' + ') + ';');

    /**
     * @method
     */
    Vec.prototype.normalize = function normalize() {
        return this.fdivide(this.magnitude());
    };

    /**
     * @method
     */
    Vec.prototype.dot = function dot(vec) {
        return this.multiply(vec).sum();
    };

    /**
     * @method
     */
    Vec.prototype.toArray = func([], 'return [' + fields.map(function(field) {
            return 'this.' + field;
        }).join(', ') + ']');

    /* Setup swizzling. */

    function swizzle(fields) {
        var args = fields.map(function(field) {
            return 'this.' + field;
        }).join(', ');
        Object.defineProperty(Vec.prototype, fields.join(''), {
            get: new Function('return new this.VecN.Vec' + fields.length +
                              '(' + args + ');')
        });
    }

    function swizzleRec(stack, count) {
        fields.forEach(function(field) {
            stack.push(field);
            if (count === 1) {
                swizzle(stack);
            } else {
                swizzleRec(stack, count - 1);
            }
            stack.pop();
        });
    }

    if (n <= 6) { // stop at 7,776
        for (var i = 2; i <= n; i++) {
            swizzleRec([], i);
        }
    }

    Vec.random = func([], create(function() {
        return 'Math.random()';
    }, 'this'));

    return Vec;
};
(10);

/**
 * Create a convenience constructor function.
 * @param {Number} n
 * @returns {Function}
 */
VecN.convenience = function(n) {
    return function() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg.toArray) {
                args.push.apply(args, arg.toArray());
            } else {
                args.push(arg);
            }
        }
        var Vec = VecN['Vec' + n];
        var vec = Object.create(Vec.prototype);
        Vec.apply(vec, args);
        return vec;
    };
};

/* Now create vectors of lengths 2, 3, and 4. */
VecN.Vec2 = VecN.make(2);
VecN.Vec3 = VecN.make(3);
VecN.Vec4 = VecN.make(4);
var vec2 = VecN.convenience(2);
var vec3 = VecN.convenience(3);
var vec4 = VecN.convenience(4);



/*---------------------------------------- igloo.js ----------------------------------------*/

/**
 * @version 0.1.0
 */

/**
 * Wrap WebGLRenderingContext objects with useful behavior.
 * @param {WebGLRenderingContext|HTMLCanvasElement} gl
 * @returns {Igloo}
 * @namespace
 */
function Igloo(gl) {
    var canvas;
    if (gl instanceof HTMLCanvasElement) {
        canvas = gl;
        gl = Igloo.getContext(gl, true);
    } else {
        canvas = gl.canvas;
    }
    this.gl = gl;
    this.canvas = canvas;
    this.defaultFramebuffer = new Igloo.Framebuffer(gl, null);
}

/**
 * Asynchronously or synchronously fetch data from the server.
 * @param {string} url
 * @param {Function} [callback] if provided, call is asynchronous
 * @returns {string}
 */
Igloo.fetch = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, Boolean(callback));
    if (callback != null) {
        xhr.onload = function() {
            callback(xhr.responseText);
        };
    }
    xhr.send();
    return xhr.responseText;
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} [error] If true, throw an error rather than return null
 * @returns {?WebGLRenderingContext} a WebGL rendering context.
 */
Igloo.getContext = function(canvas, noerror) {
    var gl;
    try {
        gl = canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');
    } catch (e) {
        gl = null;
    }
    if (gl == null && !noerror) {
        throw new Error('Could not create WebGL context.');
    } else {
        return gl;
    }
};

/**
 * To be used in a vec2 GL_TRIANGLE_STRIP draw.
 * @type {Float32Array}
 * @constant
 */
Igloo.QUAD2 = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

/**
 * @param {string} string
 * @returns {boolean} True if the string looks like a URL
 */
Igloo.looksLikeURL = function(string) {
    return /^[\w+:\/\/]/.exec(string) != null;
};

/**
 * Creates a program from a program configuration.
 *
 * @param {string} vertex URL or source of the vertex shader
 * @param {string} fragment URL or source of the fragment shader
 * @param {Function} [transform] Transforms the shaders before compilation
 * @returns {Igloo.Program}
 */
Igloo.prototype.program = function(vertex, fragment, transform) {
    if (Igloo.looksLikeURL(vertex)) vertex = Igloo.fetch(vertex);
    if (Igloo.looksLikeURL(fragment)) fragment = Igloo.fetch(fragment);
    if (transform != null) {
        vertex = transform(vertex);
        fragment = transform(fragment);
    }
    return new Igloo.Program(this.gl, vertex, fragment);
};

/**
 * Create a new GL_ARRAY_BUFFER with optional data.
 * @param {ArrayBuffer|ArrayBufferView} [data]
 * @param {GLenum} [usage]
 * @returns {Igloo.Buffer}
 */
Igloo.prototype.array = function(data, usage) {
    var gl = this.gl,
        buffer = new Igloo.Buffer(gl, gl.ARRAY_BUFFER);
    if (data != null) {
        buffer.update(data, usage == null ? gl.STATIC_DRAW : usage);
    }
    return buffer;
};

/**
 * Create a new GL_ELEMENT_ARRAY_BUFFER with optional data.
 * @param {ArrayBuffer|ArrayBufferView} [data]
 * @param {GLenum} [usage]
 * @returns {Igloo.Buffer}
 */
Igloo.prototype.elements = function(data, usage) {
    var gl = this.gl,
        buffer = new Igloo.Buffer(gl, gl.ELEMENT_ARRAY_BUFFER);
    if (data != null) {
        buffer.update(data, usage == null ? gl.STATIC_DRAW : usage);
    }
    return buffer;
};

/**
 * @param {TexImageSource} [source]
 * @param {GLenum} [format=GL_RGBA]
 * @param {GLenum} [wrap=GL_CLAMP_TO_EDGE]
 * @param {GLenum} [filter=GL_LINEAR]
 * @returns {Igloo.Texture}
 */
Igloo.prototype.texture = function(source, format, wrap, filter) {
    var texture = new Igloo.Texture(this.gl, format, wrap, filter);
    if (source != null) {
        texture.set(source);
    }
    return texture;
};

/**
 * @param {Igloo.Texture} [texture]
 * @returns {Igloo.Framebuffer}
 */
Igloo.prototype.framebuffer = function(texture) {
    var framebuffer = new Igloo.Framebuffer(this.gl);
    if (texture != null) framebuffer.attach(texture);
    return framebuffer;
};

/**
 * Fluent WebGLProgram wrapper for managing variables and data. The
 * constructor compiles and links a program from a pair of shaders.
 * Throws an exception if compiling or linking fails.
 * @param {WebGLRenderingContext} gl
 * @param {string} vertex Shader source
 * @param {string} fragment Shader source
 * @constructor
 */
Igloo.Program = function(gl, vertex, fragment) {
    this.gl = gl;
    var p = this.program = gl.createProgram();
    gl.attachShader(p, this.makeShader(gl.VERTEX_SHADER, vertex));
    gl.attachShader(p, this.makeShader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(p));
    }
    this.vars = {};
};

/**
 * Compile a shader from source.
 * @param {number} type
 * @param {string} source
 * @returns {WebGLShader}
 */
Igloo.Program.prototype.makeShader = function(type, source) {
    var gl = this.gl;
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        throw new Error(gl.getShaderInfoLog(shader));
    }
};

/**
 * Tell WebGL to use this program right now.
 * @returns {Igloo.Program} this
 */
Igloo.Program.prototype.use = function() {
    this.gl.useProgram(this.program);
    return this;
};

/**
 * Declare/set a uniform or set a uniform's data.
 * @param {string} name uniform variable name
 * @param {number|VecN} [value]
 * @param {boolean|number} [i] size, or if true use the integer version
 * @returns {Igloo.Program} this
 */
Igloo.Program.prototype.uniform = function(name, value, i) {
    if (value == null) {
        this.vars[name] = this.gl.getUniformLocation(this.program, name);
    } else {
        if (this.vars[name] == null) this.uniform(name);
        var v = this.vars[name];
        if (value instanceof VecN) {
            switch (value.length) {
            case 2:
                if (i)
                    this.gl.uniform2i(v, value.x, value.y);
                else
                    this.gl.uniform2f(v, value.x, value.y);
                break;
            case 3:
                if (i)
                    this.gl.uniform3i(v, value.x, value.y, value.z);
                else
                    this.gl.uniform3f(v, value.x, value.y, value.z);
                break;
            case 4:
                if (i)
                    this.gl.uniform4i(v, value.x, value.y, value.z, value.w);
                else
                    this.gl.uniform4f(v, value.x, value.y, value.z, value.w);
                break;
            default:
                throw new Error('Invalid vector length');
            }
        } else if (value instanceof Float32Array) {
            this.gl['uniform' + value.length + 'fv'](v, value);
        } else if (value instanceof Int32Array) {
            this.gl['uniform' + value.length + 'iv'](v, value);
        } else if (i) {
            this.gl.uniform1i(v, value);
        } else {
            this.gl.uniform1f(v, value);
        }
    }
    return this;
};

/**
 * Like the uniform() method, but using integers.
 * @returns {Igloo.Program} this
 */
Igloo.Program.prototype.uniformi = function(name, value) {
    return this.uniform(name, value, true);
};

/**
 * Declare an attrib or set an attrib's buffer.
 * @param {string} name attrib variable name
 * @param {WebGLBuffer} [value]
 * @param {number} [size] element size (required if value is provided)
 * @param {number} [stride=0]
 * @returns {Igloo.Program} this
 */
Igloo.Program.prototype.attrib = function(name, value, size, stride) {
    var gl = this.gl;
    if (value == null) {
        this.vars[name] = gl.getAttribLocation(this.program, name);
    } else {
        if (this.vars[name] == null) this.attrib(name); // get location
        value.bind();
        gl.enableVertexAttribArray(this.vars[name]);
        gl.vertexAttribPointer(this.vars[name], size, gl.FLOAT,
                               false, stride == null ? 0 : stride, 0);
    }
    return this;
};

/**
 * Call glDrawArrays or glDrawElements with this program.
 * @param {number} mode
 * @param {number} count the number of vertex attribs to render
 * @param {GLenum} [type] use glDrawElements of this type
 * @returns {Igloo.Program} this
 */
Igloo.Program.prototype.draw = function(mode, count, type) {
    var gl = this.gl;
    if (type == null) {
        gl.drawArrays(mode, 0, count);
    } else {
        gl.drawElements(mode, count, type, 0);
    }
    if (gl.getError() !== gl.NO_ERROR) {
        throw new Error('WebGL rendering error');
    }
    return this;
};

/**
 * Disables all attribs from this program.
 * @returns {Igloo.Program} this
 */
Igloo.Program.prototype.disable = function() {
    for (var attrib in this.vars) {
        var location = this.vars[attrib];
        if (this.vars.hasOwnProperty(attrib)) {
            if (typeof location === 'number') {
                this.gl.disableVertexAttribArray(location);
            }
        }
    }
    return this;
};

/**
 * Fluent WebGLBuffer wrapper.
 * @param {WebGLRenderingContext} gl
 * @param {GLenum} [target] either GL_ARRAY_BUFFER or GL_ELEMENT_ARRAY_BUFFER
 * @returns {WebGLProgram}
 * @constructor
 */
Igloo.Buffer = function(gl, target) {
    this.gl = gl;
    this.buffer = gl.createBuffer();
    this.target = (target == null ? gl.ARRAY_BUFFER : target);
    this.size = -1;
};

/**
 * Binds this buffer to ARRAY_BUFFER.
 * @returns {Igloo.Buffer} this
 */
Igloo.Buffer.prototype.bind = function() {
    this.gl.bindBuffer(this.target, this.buffer);
    return this;
};

/**
 * @param
 * @param {ArrayBuffer|ArrayBufferView} data
 * @param {GLenum} [usage]
 * @returns {Igloo.Buffer} this
 */
Igloo.Buffer.prototype.update = function(data, usage) {
    var gl = this.gl;
    if (data instanceof Array) {
        data = new Float32Array(data);
    }
    usage = usage == null ? gl.DYNAMIC_DRAW : usage;
    this.bind();
    if (this.size !== data.byteLength) {
        gl.bufferData(this.target, data, usage);
        this.size = data.byteLength;
    } else {
        gl.bufferSubData(this.target, 0, data);
    }
    return this;
};

/**
 * Create a new texture, optionally filled blank.
 * @param {WebGLRenderingContext} gl
 * @param {GLenum} [format=GL_RGBA]
 * @param {GLenum} [wrap=GL_CLAMP_TO_EDGE]
 * @param {GLenum} [filter=GL_LINEAR]
 * @returns {Igloo.Texture}
 */
Igloo.Texture = function(gl, format, wrap, filter) {
    this.gl = gl;
    var texture = this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    wrap = wrap == null ? gl.CLAMP_TO_EDGE : wrap;
    filter = filter == null ? gl.LINEAR : filter;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    this.format = format = format == null ? gl.RGBA : format;
};

/**
 * @param {number} [unit] active texture unit to bind
 * @returns {Igloo.Texture}
 */
Igloo.Texture.prototype.bind = function(unit) {
    var gl = this.gl;
    if (unit != null) {
        gl.activeTexture(gl.TEXTURE0 + unit);
    }
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    return this;
};

/**
 * Set texture to particular size, filled with vec4(0, 0, 0, 1).
 * @param {number} width
 * @param {number} height
 * @returns {Igloo.Texture}
 */
Igloo.Texture.prototype.blank = function(width, height) {
    var gl = this.gl;
    this.bind();
    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height,
                  0, this.format, gl.UNSIGNED_BYTE, null);
    return this;
};


/**
 * Set the texture to a particular image.
 * @param {Array|ArrayBufferView|TexImageSource} source
 * @param {number} [width]
 * @param {number} [height]
 * @returns {Igloo.Texture}
 */
Igloo.Texture.prototype.set = function(source, width, height) {
    var gl = this.gl;
    this.bind();
    if (source instanceof Array) source = new Uint8Array(source);
    if (width != null || height != null) {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0,
                      gl.UNSIGNED_BYTE, source);
    } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format,
                      this.format, gl.UNSIGNED_BYTE, source);
    }
    return this;
};

/**
 * Set part of the texture to a particular image.
 * @param {Array|ArrayBufferView|TexImageSource} source
 * @param {number} xoff
 * @param {number} yoff
 * @param {number} [width]
 * @param {number} [height]
 * @returns {Igloo.Texture}
 */
Igloo.Texture.prototype.subset = function(source, xoff, yoff, width, height) {
    var gl = this.gl;
    this.bind();
    if (source instanceof Array) source = new Uint8Array(source);
    if (width != null || height != null) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, xoff, yoff,
                         width, height,
                         this.format, gl.UNSIGNED_BYTE, source);
    } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, xoff, yoff,
                         this.format, gl.UNSIGNED_BYTE, source);
    }
    return this;
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLFramebuffer} [framebuffer] to be wrapped (null for default)
 * @returns {Igloo.Framebuffer}
 */
Igloo.Framebuffer = function(gl, framebuffer) {
    this.gl = gl;
    this.framebuffer =
        arguments.length == 2 ? framebuffer : gl.createFramebuffer();
    this.renderbuffer = null;
};

/**
 * @returns {Igloo.Framebuffer}
 */
Igloo.Framebuffer.prototype.bind = function() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    return this;
};

/**
 * @returns {Igloo.Framebuffer}
 */
Igloo.Framebuffer.prototype.unbind = function() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    return this;
};

/**
 * @param {Igloo.Texture} texture
 * @returns {Igloo.Framebuffer}
 */
Igloo.Framebuffer.prototype.attach = function(texture) {
    var gl = this.gl;
    this.bind();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                            gl.TEXTURE_2D, texture.texture, 0);
    return this;
};

/**
 * Attach a renderbuffer as a depth buffer for depth-tested rendering.
 * @param {number} width
 * @param {number} height
 * @returns {Igloo.Framebuffer}
 */
Igloo.Framebuffer.prototype.attachDepth = function(width, height) {
    var gl = this.gl;
    this.bind();
    if (this.renderbuffer == null) {
        this.renderbuffer = gl.createRenderbuffer();
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
                               width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                                   gl.RENDERBUFFER, this.renderbuffer);
    }
    return this;
};

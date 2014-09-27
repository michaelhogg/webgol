#ifdef GL_ES
precision mediump float;
#endif

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

#define COLOUR_DEAD  vec4(0.0, 0.0, 0.0, 1.0)
#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)

uniform sampler2D sampler;
uniform vec2      viewDimensions;

uniform vec4 colourTopLeft;
uniform vec4 colourTopRight;
uniform vec4 colourBottomLeft;
uniform vec4 colourBottomRight;

/**
 * Get the cell's state
 */
int getCellState() {

    vec2 coord  = gl_FragCoord.xy / viewDimensions;  // Normalise to range 0-1
    vec4 colour = texture2D(sampler, coord);

    return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);

}

/**
 * Calculate the cell's colour using linear interpolation
 */
vec4 calculateInterpolatedColour() {

    vec2 fraction = gl_FragCoord.xy / viewDimensions;

    vec4 colourTop    = mix(colourTopLeft,    colourTopRight,    fraction.x);
    vec4 colourBottom = mix(colourBottomLeft, colourBottomRight, fraction.x);

    return mix(colourBottom, colourTop, fraction.y);

}

/**
 * Set frag colour
 */
void setFragColour(int cellState, vec4 interpolatedColour) {

    gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? interpolatedColour : COLOUR_DEAD);

}

/**
 * Main
 */
void main() {

    int  cellState          = getCellState();
    vec4 interpolatedColour = calculateInterpolatedColour();

    setFragColour(cellState, interpolatedColour);

}

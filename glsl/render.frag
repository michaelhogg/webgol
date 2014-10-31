precision mediump float;

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

#define COLOUR_DEAD  vec4(0.0, 0.0, 0.0, 1.0)
#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)

uniform sampler2D uSampler;
uniform vec2      uViewDimensions;

uniform vec4 uColourTopLeft;
uniform vec4 uColourTopRight;
uniform vec4 uColourBottomLeft;
uniform vec4 uColourBottomRight;

/**
 * Get the cell's state
 */
int getCellState() {

    vec2 coord  = gl_FragCoord.xy / uViewDimensions;  // Normalise to range 0-1
    vec4 colour = texture2D(uSampler, coord);

    return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);

}

/**
 * Calculate the cell's colour using linear interpolation
 */
vec4 calculateInterpolatedColour() {

    vec2 fraction = gl_FragCoord.xy / uViewDimensions;

    vec4 colourTop    = mix(uColourTopLeft,    uColourTopRight,    fraction.x);
    vec4 colourBottom = mix(uColourBottomLeft, uColourBottomRight, fraction.x);

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

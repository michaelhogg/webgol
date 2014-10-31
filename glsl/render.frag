precision mediump float;

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

#define COLOUR_DEAD  vec4(0.0, 0.0, 0.0, 1.0)
#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)

uniform sampler2D uSampler;

uniform vec4 uColourTopLeft;
uniform vec4 uColourTopRight;
uniform vec4 uColourBottomLeft;
uniform vec4 uColourBottomRight;

varying vec2 vTexCoord;

/**
 * Get the cell's state
 */
int getCellState() {

    vec4 colour = texture2D(uSampler, vTexCoord);

    return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);

}

/**
 * Calculate the cell's colour using linear interpolation
 */
vec4 calculateInterpolatedColour() {

    vec4 colourTop    = mix(uColourTopLeft,    uColourTopRight,    vTexCoord.x);
    vec4 colourBottom = mix(uColourBottomLeft, uColourBottomRight, vTexCoord.x);

    return mix(colourBottom, colourTop, vTexCoord.y);

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

#ifdef GL_ES
precision mediump float;
#endif

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

// Must be black for getCellState() to work correctly
#define COLOUR_DEAD vec4(0.0, 0.0, 0.0, 1.0)

uniform sampler2D sampler;
uniform vec2      stateDimensions;

uniform vec4 colourTopLeft;
uniform vec4 colourTopRight;
uniform vec4 colourBottomLeft;
uniform vec4 colourBottomRight;

/**
 * Get the specified pixel's colour
 */
vec4 getPixelColour(vec2 offset) {

    vec2 coord = (gl_FragCoord.xy + offset) / stateDimensions;  // Normalise to range 0-1

    return texture2D(sampler, coord);

}

/**
 * Get the state of the specified cell
 */
int getCellState(vec2 offset) {

    vec4  colour      = getPixelColour(offset);
    float channelsSum = colour.r + colour.g + colour.b;

    return ((channelsSum > 0.0) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);

}

/**
 * Count neighbours
 */
int countNeighbours() {

    return getCellState(vec2(-1.0, -1.0)) +  // Left bottom
           getCellState(vec2(-1.0,  0.0)) +  // Left centre
           getCellState(vec2(-1.0,  1.0)) +  // Left top

           getCellState(vec2( 0.0, -1.0)) +  // Centre bottom
                                             // Ignore the central cell
           getCellState(vec2( 0.0,  1.0)) +  // Centre top

           getCellState(vec2( 1.0, -1.0)) +  // Right bottom
           getCellState(vec2( 1.0,  0.0)) +  // Right centre
           getCellState(vec2( 1.0,  1.0));   // Right top

}

/**
 * Calculate next generation
 */
int calculateNextGeneration(int neighbours) {

    if (neighbours == 3) {

        // If cell was dead, it becomes alive.
        // If cell was alive, it stays alive.

        return CELL_STATE_ALIVE;

    } else if (neighbours == 2) {

        // Cell keeps its previous state.

        return getCellState(vec2(0.0, 0.0));

    } else {

        // Cell is now dead.

        return CELL_STATE_DEAD;

    }

}

/**
 * Calculate alive colour using linear interpolation
 */
vec4 calculateAliveColour() {

    vec2 fraction = gl_FragCoord.xy / stateDimensions;

    vec4 topColour    = mix(colourTopLeft,    colourTopRight,    fraction.x);
    vec4 bottomColour = mix(colourBottomLeft, colourBottomRight, fraction.x);

    return mix(bottomColour, topColour, fraction.y);

}

/**
 * Set frag colour
 */
void setFragColour(int cellState, vec4 aliveColour) {

    gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? aliveColour : COLOUR_DEAD);

}

/**
 * Main
 */
void main() {

    int  neighbours  = countNeighbours();
    int  cellState   = calculateNextGeneration(neighbours);
    vec4 aliveColour = calculateAliveColour();

    setFragColour(cellState, aliveColour);

}

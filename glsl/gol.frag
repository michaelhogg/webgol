#ifdef GL_ES
precision mediump float;
#endif

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

// Must be black for getCellState() to work correctly
#define COLOUR_DEAD vec4(0.0, 0.0, 0.0, 1.0)

uniform sampler2D state;
uniform vec2      scale;

/**
 * Get the pixel's RGBA channels
 */
vec4 getPixelChannels(vec2 offset) {

    vec2 coord         = (gl_FragCoord.xy + offset) / scale;
    vec4 pixelChannels = texture2D(state, coord);

    return pixelChannels;

}

/**
 * Get the state of the cell
 */
int getCellState(vec2 offset) {

    vec4  pixelChannels = getPixelChannels(offset);
    float channelsSum   = pixelChannels.r + pixelChannels.g + pixelChannels.b;

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
 * Set frag colour
 */
void setFragColour(int cellState, vec4 aliveColour) {

    gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? aliveColour : COLOUR_DEAD);

}

/**
 * Main
 */
void main() {

    vec4 aliveColour = vec4(1.0, 1.0, 1.0, 1.0);

    int neighbours = countNeighbours();
    int cellState  = calculateNextGeneration(neighbours);

    setFragColour(cellState, aliveColour);

}

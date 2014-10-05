precision mediump float;

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

#define COLOUR_DEAD  vec4(0.0, 0.0, 0.0, 1.0)
#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)

uniform sampler2D sampler;
uniform vec2      stateDimensions;
uniform bool      enableWrapping;

/**
 * Wrap value to the range 0-1
 */
float wrapValue(float value) {

    if (value < 0.0)  value += 1.0;
    if (value > 1.0)  value -= 1.0;

    return value;

}

/**
 * Get the state of the specified cell
 */
int getCellState(vec2 offset) {

    vec2 coord = (gl_FragCoord.xy + offset) / stateDimensions;  // Normalise to range 0-1

    if (enableWrapping == true) {
        coord.x = wrapValue(coord.x);  // Wrap horizontally
        coord.y = wrapValue(coord.y);  // Wrap vertically
    } else {
        if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {
            return CELL_STATE_DEAD;
        }
    }

    vec4 colour = texture2D(sampler, coord);

    return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);

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
void setFragColour(int cellState) {

    gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? COLOUR_ALIVE : COLOUR_DEAD);

}

/**
 * Main
 */
void main() {

    int neighbours = countNeighbours();
    int cellState  = calculateNextGeneration(neighbours);

    setFragColour(cellState);

}

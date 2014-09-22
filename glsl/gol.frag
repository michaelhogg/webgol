#ifdef GL_ES
precision mediump float;
#endif

#define CELL_STATE_DEAD  0
#define CELL_STATE_ALIVE 1

uniform sampler2D state;
uniform vec2      scale;

int get(vec2 offset) {
    return int(texture2D(state, (gl_FragCoord.xy + offset) / scale).r);
}

/**
 * Count neighbours
 */
int countNeighbours() {

    return get(vec2(-1.0, -1.0)) +  // Left bottom
           get(vec2(-1.0,  0.0)) +  // Left centre
           get(vec2(-1.0,  1.0)) +  // Left top

           get(vec2( 0.0, -1.0)) +  // Centre bottom
                                    // Ignore the central cell
           get(vec2( 0.0,  1.0)) +  // Centre top

           get(vec2( 1.0, -1.0)) +  // Right bottom
           get(vec2( 1.0,  0.0)) +  // Right centre
           get(vec2( 1.0,  1.0));   // Right top

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

        return get(vec2(0.0, 0.0));

    } else {

        // Cell is now dead.

        return CELL_STATE_DEAD;

    }

}

/**
 * Set frag colour
 */
void setFragColour(int cellState, vec4 aliveColour, vec4 deadColour) {

    gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? aliveColour : deadColour);

}

/**
 * Main
 */
void main() {

    vec4 aliveColour = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 deadColour  = vec4(0.0, 0.0, 0.0, 1.0);

    int neighbours = countNeighbours();
    int cellState  = calculateNextGeneration(neighbours);

    setFragColour(cellState, aliveColour, deadColour);

}

var GOLShaderSources={vNextState:"precision mediump float;\nattribute vec2 aVertex;\nvoid main() {\n gl_Position = vec4(aVertex, 0, 1.0);\n}\n",fNextState:"precision mediump float;\n#define CELL_STATE_DEAD 0\n#define CELL_STATE_ALIVE 1\n#define COLOUR_DEAD vec4(0.0, 0.0, 0.0, 1.0)\n#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)\nuniform sampler2D uSampler;\nuniform vec2 uStateDimensions;\nuniform bool uEnableWrapping;\nfloat wrapValue(float value) {\n if (value < 0.0) value += 1.0;\n if (value > 1.0) value -= 1.0;\n return value;\n}\nint getCellState(vec2 offset) {\n vec2 coord = (gl_FragCoord.xy + offset) / uStateDimensions;\n if (uEnableWrapping == true) {\n coord.x = wrapValue(coord.x);\n coord.y = wrapValue(coord.y);\n } else {\n if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) {\n return CELL_STATE_DEAD;\n }\n }\n vec4 colour = texture2D(uSampler, coord);\n return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);\n}\nint countNeighbours() {\n return getCellState(vec2(-1.0, -1.0)) +\n getCellState(vec2(-1.0, 0.0)) +\n getCellState(vec2(-1.0, 1.0)) +\n getCellState(vec2( 0.0, -1.0)) +\n getCellState(vec2( 0.0, 1.0)) +\n getCellState(vec2( 1.0, -1.0)) +\n getCellState(vec2( 1.0, 0.0)) +\n getCellState(vec2( 1.0, 1.0));\n}\nint calculateNextGeneration(int neighbours) {\n if (neighbours == 3) {\n return CELL_STATE_ALIVE;\n } else if (neighbours == 2) {\n return getCellState(vec2(0.0, 0.0));\n } else {\n return CELL_STATE_DEAD;\n }\n}\nvoid setFragColour(int cellState) {\n gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? COLOUR_ALIVE : COLOUR_DEAD);\n}\nvoid main() {\n int neighbours = countNeighbours();\n int cellState = calculateNextGeneration(neighbours);\n setFragColour(cellState);\n}\n",vRender:"precision mediump float;\nattribute vec2 aVertex;\nvarying vec2 vTexCoord;\nvoid main() {\n gl_Position = vec4(aVertex, 0, 1.0);\n vTexCoord = (aVertex + 1.0) / 2.0;\n}\n",fRender:"precision mediump float;\n#define CELL_STATE_DEAD 0\n#define CELL_STATE_ALIVE 1\n#define COLOUR_DEAD vec4(0.0, 0.0, 0.0, 1.0)\n#define COLOUR_ALIVE vec4(1.0, 0.0, 0.0, 1.0)\nuniform sampler2D uSampler;\nuniform vec4 uColourTopLeft;\nuniform vec4 uColourTopRight;\nuniform vec4 uColourBottomLeft;\nuniform vec4 uColourBottomRight;\nvarying vec2 vTexCoord;\nint getCellState() {\n vec4 colour = texture2D(uSampler, vTexCoord);\n return ((colour.r == COLOUR_ALIVE.r) ? CELL_STATE_ALIVE : CELL_STATE_DEAD);\n}\nvec4 calculateInterpolatedColour() {\n vec4 colourTop = mix(uColourTopLeft, uColourTopRight, vTexCoord.x);\n vec4 colourBottom = mix(uColourBottomLeft, uColourBottomRight, vTexCoord.x);\n return mix(colourBottom, colourTop, vTexCoord.y);\n}\nvoid setFragColour(int cellState, vec4 interpolatedColour) {\n gl_FragColor = ((cellState == CELL_STATE_ALIVE) ? interpolatedColour : COLOUR_DEAD);\n}\nvoid main() {\n int cellState = getCellState();\n vec4 interpolatedColour = calculateInterpolatedColour();\n setFragColour(cellState, interpolatedColour);\n}\n"};
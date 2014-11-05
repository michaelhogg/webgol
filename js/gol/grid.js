/**
 * Stores a Game Of Life grid of cells
 */
function GOLGrid() {

    /**
     * Array of cells, each of which is either alive (true) or dead (false)
     * @type {boolean[]}
     */
    this.cellData = [];

    /**
     * @type {number}
     */
    this.width = 0;

    /**
     * @type {number}
     */
    this.height = 0;

}

/**
 * Constant representing left horizontal alignment
 * @constant {number}
 */
GOLGrid.ALIGN_LEFT = 1;

/**
 * Constant representing centre horizontal alignment
 * @constant {number}
 */
GOLGrid.ALIGN_CENTRE = 2;

/**
 * Constant representing right horizontal alignment
 * @constant {number}
 */
GOLGrid.ALIGN_RIGHT = 3;

/**
 * Constant representing top vertical alignment
 * @constant {number}
 */
GOLGrid.ALIGN_TOP = 4;

/**
 * Constant representing middle vertical alignment
 * @constant {number}
 */
GOLGrid.ALIGN_MIDDLE = 5;

/**
 * Constant representing bottom vertical alignment
 * @constant {number}
 */
GOLGrid.ALIGN_BOTTOM = 6;

/**
 * Get a cell's index in the cellData array
 *
 * @param   {number} x
 * @param   {number} y
 * @returns {number}
 */
GOLGrid.prototype.getCellIndex = function(x, y) {

    if (x < 0)  throw new Error("Invalid X coord: " + x);
    if (y < 0)  throw new Error("Invalid Y coord: " + y);

    if (x >= this.width)   throw new Error("Invalid X coord: " + x + " (width of grid is "  + this.width  + ")");
    if (y >= this.height)  throw new Error("Invalid Y coord: " + y + " (height of grid is " + this.height + ")");

    return (y * this.width) + x;

};

/**
 * Get a cell's state
 *
 * @param   {number} x
 * @param   {number} y
 * @returns {boolean}
 */
GOLGrid.prototype.getCell = function(x, y) {

    var cellIndex = this.getCellIndex(x, y);

    return this.cellData[cellIndex];

};

/**
 * Set a cell's state
 *
 * @param {number}  x
 * @param {number}  y
 * @param {boolean} state
 */
GOLGrid.prototype.setCell = function(x, y, state) {

    var cellIndex = this.getCellIndex(x, y);

    this.cellData[cellIndex] = state;

};

/**
 * Set using a boolean array
 *
 * @param {boolean[]} cellData
 * @param {number}    width
 * @param {number}    height
 */
GOLGrid.prototype.setUsingBoolArray = function(cellData, width, height) {

    if (cellData.length !== width * height) {
        throw new Error("Grid dimensions (" + width + " x " + height + " = " + (width * height) + ") do not match total number of cells (" + cellData.length + ")");
    }

    this.cellData = cellData;
    this.width    = width;
    this.height   = height;

};

/**
 * Set using a text grid
 *
 * @param {string} textGrid
 * @param {string} liveChar - Character representing a live cell
 * @param {string} deadChar - Character representing a dead cell
 */
GOLGrid.prototype.setUsingTextGrid = function(textGrid, liveChar, deadChar) {

    var rows        = textGrid.split(/\r\n|\r|\n/g);  // Split by newlines (CRLF, CR, or LF)
    var newCellData = [];
    var newWidth    = rows[0].length;
    var newHeight   = rows.length;

    var x, y, rowChars, cellChar;

    for (y = 0; y < rows.length; y++) {

        rowChars = rows[y].split("");  // Split into an array of individual characters

        if (rowChars.length !== newWidth) {
            throw new Error("Inconsistent row lengths: first row is " + newWidth + " chars, row " + (y + 1) + " is " + rowChars.length + " chars");
        }

        for (x = 0; x < rowChars.length; x++) {

            cellChar = rowChars[x];

            switch (cellChar) {
                case liveChar:
                    newCellData.push(true);
                    break;
                case deadChar:
                    newCellData.push(false);
                    break;
                default:
                    throw new Error("Invalid character found at row " + (y + 1) + " column " + (x + 1) + ": '" + cellChar + "'");
            }

        }

    }

    this.cellData = newCellData;
    this.width    = newWidth;
    this.height   = newHeight;

};

/**
 * Set part of the grid, by "pasting" another GOLGrid object at the specified coordinates
 *
 * @param {GOLGrid} pasteGrid
 * @param {number}  pasteX
 * @param {number}  pasteY
 */
GOLGrid.prototype.paste = function(pasteGrid, pasteX, pasteY) {

    if (pasteX < 0)  throw new Error("Invalid X coord: " + pasteX);
    if (pasteY < 0)  throw new Error("Invalid Y coord: " + pasteY);

    if (pasteX + pasteGrid.width  > this.width )  throw new Error("With X coord " + pasteX + ", pasted grid will not fit within existing grid");
    if (pasteY + pasteGrid.height > this.height)  throw new Error("With Y coord " + pasteY + ", pasted grid will not fit within existing grid");

    var x, y, thisX, thisY;

    for (y = 0; y < pasteGrid.height; y++) {

        thisY = y + pasteY;

        for (x = 0; x < pasteGrid.width; x++) {
            thisX = x + pasteX;
            this.setCell(thisX, thisY, pasteGrid.getCell(x, y));
        }

    }

};

/**
 * Get as a text grid
 *
 * @param   {string} liveChar - Character representing a live cell
 * @param   {string} deadChar - Character representing a dead cell
 * @returns {string}
 */
GOLGrid.prototype.getAsTextGrid = function(liveChar, deadChar) {

    var output = "";
    var x, y;

    for (y = 0; y < this.height; y++) {

        for (x = 0; x < this.width; x++) {
            output += (this.getCell(x, y) ? liveChar : deadChar);
        }

        output += "\n";

    }

    return output;

};

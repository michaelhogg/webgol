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
 * Get a cell's state
 *
 * @param   {number} x
 * @param   {number} y
 * @returns {boolean}
 */
GOLGrid.prototype.getCell = function(x, y) {

    var cellIndex = (y * this.width) + x;

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

    var cellIndex = (y * this.width) + x;

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
 * Return a vertically-flipped copy of this GOLGrid
 * (needed because grid coord origin is top-left, but WebGL coord origin is bottom-left)
 *
 * @returns {GOLGrid}
 */
GOLGrid.prototype.getVerticallyFlipped = function() {

    var flippedGrid = new GOLGrid();
    var x, y, flippedY;

    flippedGrid.width  = this.width;
    flippedGrid.height = this.height;

    for (y = 0; y < this.height; y++) {

        flippedY = (this.height - 1) - y;

        for (x = 0; x < this.width; x++) {
            flippedGrid.setCell(x, flippedY, this.getCell(x, y));
        }

    }

    return flippedGrid;

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

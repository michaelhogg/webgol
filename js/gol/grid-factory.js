/**
 * Creates GOLGrid objects
 */
var GOLGridFactory = {

    /**
     * Create a GOLGrid using a boolean array
     *
     * @param   {boolean[]} cellData
     * @param   {number}    width
     * @param   {number}    height
     * @returns {GOLGrid}
     */
    createUsingBoolArray: function(cellData, width, height) {

        var golGrid = new GOLGrid();

        golGrid.setUsingBoolArray(cellData, width, height);

        return golGrid;

    },

    /**
     * Create a GOLGrid using a text grid
     *
     * @param   {string} textGrid
     * @param   {string} liveChar - Character representing a live cell
     * @param   {string} deadChar - Character representing a dead cell
     * @returns {GOLGrid}
     */
    createUsingTextGrid: function(textGrid, liveChar, deadChar) {

        var golGrid = new GOLGrid();

        golGrid.setUsingTextGrid(textGrid, liveChar, deadChar);

        return golGrid;

    },

    /**
     * Create an empty GOLGrid (all cells dead) with the specified dimensions
     *
     * @param   {number} width
     * @param   {number} height
     * @returns {GOLGrid}
     */
    createEmpty: function(width, height) {

        var cellData = [];

        for (var i = 0; i < width * height; i++) {
            cellData[i] = false;
        }

        return GOLGridFactory.createUsingBoolArray(cellData, width, height);

    },

    /**
     * Create a randomised GOLGrid with the specified dimensions
     *
     * @param   {number} width
     * @param   {number} height
     * @returns {GOLGrid}
     */
    createRandomised: function(width, height) {

        var cellData         = [];
        var aliveProbability = 0.5;

        for (var i = 0; i < width * height; i++) {
            cellData[i] = (Math.random() < aliveProbability);
        }

        return GOLGridFactory.createUsingBoolArray(cellData, width, height);

    }

};

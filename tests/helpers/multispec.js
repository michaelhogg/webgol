/* ----- JSHint ----- */
/* exported multispec */

/**
 * Create multiple Jasmine specs using an array of values
 *
 * @param {string}   name      - Name of the group of specs
 * @param {array}    values    - A spec will be created for each value
 * @param {function} itCreator - A function which creates an it() spec
 */
function multispec(name, values, itCreator) {
    for (var i = 0; i < values.length; i++) {
        itCreator.call(this, name, values[i]);
    }
}

describe("GOLUtils", function() {

    var ints = [
        0,
        -0,
        3,
        -3,
        1234567890,
        -1234567890
    ];

    var floats = [
        1.00001,
        -1.00001,
        1.99999,
        -1.99999,
        12345678.9,
        -12345678.9,
        Math.PI
    ];

    var bools = [
        true,
        false
    ];

    var others = [

        // undefined
        void 0,

        // null
        null,

        // string
        "",
        "hello",
        "1",
        "0x11",
        "0b11",
        "0o11",

        // object
        {},
        { x: 1 },
        Math,
        new Date(),
        /s/,

        // function
        function() { return 1; },

        // array
        [],
        [1],
        ["2"],
        [1, 2, 3],

        // special numbers
        Number.NaN,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY

    ];

    multispec("isInt() valid value: ", ints, function(name, value) {
        it(name + value, function() {
            expect(GOLUtils.isInt(value)).toBe(true);
        });
    });

    multispec("isInt() invalid value: ", others.concat(floats, bools), function(name, value) {
        it(name + value, function() {
            expect(GOLUtils.isInt(value)).toBe(false);
        });
    });

    multispec("isFloat() valid value: ", floats, function(name, value) {
        it(name + value, function() {
            expect(GOLUtils.isFloat(value)).toBe(true);
        });
    });

    multispec("isFloat() invalid value: ", others.concat(ints, bools), function(name, value) {
        it(name + value, function() {
            expect(GOLUtils.isFloat(value)).toBe(false);
        });
    });

    multispec("isBool() valid value: ", bools, function(name, value) {
        it(name + value, function() {
            expect(GOLUtils.isBool(value)).toBe(true);
        });
    });

    multispec("isBool() invalid value: ", others.concat(ints, floats), function(name, value) {
        it(name + value, function() {
            expect(GOLUtils.isBool(value)).toBe(false);
        });
    });

});

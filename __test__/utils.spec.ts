import * as U from "../src/Utils";

describe(`deepClean`, () => {
    it(`keeps the properties that aren't nil`, () => {
        const input = {
            A : undefined,
            B : { C: undefined, D: 100 },
        };
        expect(U.deepCompact(input)).toEqual({ B: { D: 100 } });
    });

    it(`compacts arrays`, () => {
        const input = [1, 2, 3, undefined, null, [4, 5, 6, undefined, null]];
        expect(U.deepCompact(input)).toEqual([1, 2, 3, [4, 5, 6]]);
    });

    it(`compacts nested arrays`, () => {
        const input = { A: [ undefined, { B: [ undefined, { C: undefined, D: 100 } ] } ] };
        expect(U.deepCompact(input)).toEqual({ A: [{ B: [{ D: 100 }] }] });
    });

    it(`works with symbols`, () => {
        const sym1  = Symbol(`sym1`);
        const sim2  = Symbol(`sym2`);
        const input = {
            [sym1] : undefined,
            [sim2] : { C: undefined, D: 100 },
        };
        expect(input[sim2]).toStrictEqual({ C: undefined, D: 100 });
        expect(U.deepCompact(input)[sim2]).toStrictEqual({ D: 100 });
    });
});

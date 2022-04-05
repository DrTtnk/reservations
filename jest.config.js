/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
    preset            : `ts-jest`,
    testEnvironment   : `node`,
    collectCoverage   : true,
    coverageReporters : [`html`, `text`],
    globals           : { 'ts-jest': { tsconfig: `./__test__/tsconfig.json` } },
};
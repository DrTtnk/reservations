"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const fp_ts_1 = require("fp-ts/");
const ts = require("io-ts");
const ConfigCodec = ts.type({
    port: ts.number,
    host: ts.string,
    env: ts.keyof({ development: null, production: null, test: null }),
    database: ts.type({
        host: ts.string,
        port: ts.number,
        user: ts.string,
        password: ts.string,
        database: ts.string,
    }),
});
exports.config = fp_ts_1.function.pipe(
// eslint-disable-next-line @typescript-eslint/no-var-requires
{ ...require(`../config/config.json`), env: process.env.NODE_ENV || `development` }, ConfigCodec.decode, fp_ts_1.either.fold(e => (console.log(`Invalid config file`), process.exit(1)), fp_ts_1.function.identity));
//# sourceMappingURL=Config.js.map
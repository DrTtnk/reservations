"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.preValidate = exports.Narrow = exports.trace = exports.peek = exports.deepCompact = void 0;
const express = require("express");
const fp_ts_1 = require("fp-ts");
const io_ts_reporters_1 = require("io-ts-reporters");
const ts = require("io-ts");
const R = require("ramda");
const deepCompact = (o) => R.is(Array, o)
    ? R.reject(R.isNil, o).map(R.when(R.is(Object), exports.deepCompact))
    : [...Object.getOwnPropertySymbols(o), ...Object.keys(o)]
        .filter(k => !R.isNil(o[k]))
        .reduce((acc, k) => (acc[k] = R.is(Object, o[k]) ? (0, exports.deepCompact)(o[k]) : o[k], acc), {});
exports.deepCompact = deepCompact;
const peek = (fn) => (o) => (fn(o), o);
exports.peek = peek;
const trace = (message) => (0, exports.peek)(v => console.log(message, v));
exports.trace = trace;
const Narrow = (brand, type, match) => {
    const tester = (s) => typeof s === type && match(s);
    return new ts.Type(brand, tester, (u, c) => tester(u) ? ts.success(u) : ts.failure(u, c), a => a);
};
exports.Narrow = Narrow;
const preValidate = (schema, f) => fp_ts_1.function.flow(schema.decode, fp_ts_1.taskEither.fromEither, fp_ts_1.taskEither.fold(fp_ts_1.function.flow(io_ts_reporters_1.formatValidationErrors, R.join(`\n`), Error, fp_ts_1.taskEither.left), f));
exports.preValidate = preValidate;
const routes = (api) => {
    const apiWrapper = (handler) => ({ body }, response) => fp_ts_1.task.map(fp_ts_1.either.fold(({ message: error }) => {
        console.error(`I don't feel so good, Mr Stark... :<`, { error, body });
        return response.status(400).json({ error });
    }, data => response.status(200).json(data)))(handler(body))();
    return R.toPairs(api).reduce((r, [path, method]) => r.post(path, apiWrapper(method)), express.Router());
};
exports.routes = routes;
//# sourceMappingURL=Utils.js.map
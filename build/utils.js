"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.preValidate = exports.Narrow = exports.trace = exports.peek = exports.deepCompact = void 0;
var express = require("express");
var fp_ts_1 = require("fp-ts");
var io_ts_reporters_1 = require("io-ts-reporters");
var ts = require("io-ts");
var R = require("ramda");
var deepCompact = function (o) { return R.is(Array, o)
    ? R.reject(R.isNil, o).map(R.when(R.is(Object), exports.deepCompact))
    : __spreadArray(__spreadArray([], Object.getOwnPropertySymbols(o), true), Object.keys(o), true).filter(function (k) { return !R.isNil(o[k]); })
        .reduce(function (acc, k) { return (acc[k] = R.is(Object, o[k]) ? (0, exports.deepCompact)(o[k]) : o[k], acc); }, {}); };
exports.deepCompact = deepCompact;
var peek = function (fn) { return function (o) { return (fn(o), o); }; };
exports.peek = peek;
var trace = function (message) { return (0, exports.peek)(function (v) { return console.log(message, v); }); };
exports.trace = trace;
var Narrow = function (brand, type, match) {
    var tester = function (s) { return typeof s === type && match(s); };
    return new ts.Type(brand, tester, function (u, c) { return tester(u) ? ts.success(u) : ts.failure(u, c); }, function (a) { return a; });
};
exports.Narrow = Narrow;
var preValidate = function (schema, f) {
    return fp_ts_1.function.flow(schema.decode, fp_ts_1.taskEither.fromEither, fp_ts_1.taskEither.fold(fp_ts_1.function.flow(io_ts_reporters_1.formatValidationErrors, R.join("\n"), Error, fp_ts_1.taskEither.left), f));
};
exports.preValidate = preValidate;
var routes = function (api) {
    var apiWrapper = function (handler) { return function (_a, response) {
        var body = _a.body;
        return fp_ts_1.task.map(fp_ts_1.either.fold(function (_a) {
            var error = _a.message;
            console.error("I don't feel so good, Mr Stark... :<", { error: error, body: body });
            return response.status(400).json({ error: error });
        }, function (data) { return response.status(200).json(data); }))(handler(body))();
    }; };
    return R.toPairs(api).reduce(function (r, _a) {
        var path = _a[0], method = _a[1];
        return r.post(path, apiWrapper(method));
    }, express.Router());
};
exports.routes = routes;
//# sourceMappingURL=utils.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReservationsCodec = exports.NewReservationCodec = exports.ReservationCodec = exports.UserCodec = exports.ReservationTime = exports.StrictPositive = exports.EmailCodec = exports.DateString = exports.Positive = void 0;
var ts = require("io-ts");
var moment_1 = require("moment");
var U = require("./utils");
exports.Positive = U.Narrow("PositiveInt", "number", function (n) { return n >= 0; });
exports.DateString = U.Narrow("DateString", "string", function (s) { return (0, moment_1.default)(s, "YYYY-MM-DD").isValid(); });
exports.EmailCodec = U.Narrow("Email", "string", function (s) { return !!s.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/); });
exports.StrictPositive = U.Narrow("StrictPositive", "number", function (n) { return n > 0; });
exports.ReservationTime = U.Narrow("ReservationTime", "string", function (s) { return s.endsWith(":00") && s >= "19:00" && s <= "23:00"; });
exports.UserCodec = ts.strict({
    name: ts.string,
    email: exports.EmailCodec,
    password: ts.string,
});
exports.ReservationCodec = ts.strict({
    date: exports.DateString,
    time: exports.ReservationTime,
    partySize: exports.StrictPositive,
});
exports.NewReservationCodec = ts.strict({
    reservation: exports.ReservationCodec,
    userId: ts.number,
});
exports.GetReservationsCodec = ts.partial({
    userId: ts.number,
    startDate: ts.string,
    endDate: ts.string,
    pagination: ts.strict({
        page: exports.Positive,
        perPage: exports.StrictPositive,
    }),
});
//# sourceMappingURL=types.js.map
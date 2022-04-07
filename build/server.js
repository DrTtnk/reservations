"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express = require("express");
const fp_ts_1 = require("fp-ts");
const R = require("ramda");
const sequelize_1 = require("sequelize");
const Config_1 = require("./Config");
const DB = require("./Repositories");
const TG = require("./Types");
const U = require("./Utils");
const availableSit = 4 * 5;
const validateAvailability = ({ partySize, date, time }) => fp_ts_1.function.pipe(fp_ts_1.taskEither.tryCatch(() => DB.Reservations.sum(`partySize`, { where: { date, time } }), fp_ts_1.either.toError), fp_ts_1.task.map(fp_ts_1.either.chain(sum => availableSit - sum > partySize ? fp_ts_1.either.right(sum) : fp_ts_1.either.left(new Error(`Party size is too large`)))));
const createReservation = ({ reservation, userId }) => fp_ts_1.function.pipe(fp_ts_1.apply.sequenceT(fp_ts_1.taskEither.taskEither)(DB.validateId(DB.Users)(userId), validateAvailability(R.pick([`date`, `time`, `partySize`])(reservation))), fp_ts_1.taskEither.chain(([userId]) => DB.create(DB.Reservations)({ ...reservation, userId })), fp_ts_1.taskEither.map(id => ({ id })));
const getReservations = ({ startDate, endDate, pagination, userId }) => DB.findAll(DB.Reservations)(U.deepCompact({
    where: {
        userId,
        date: startDate || endDate ? { [sequelize_1.default.Op.gte]: startDate, [sequelize_1.default.Op.lte]: endDate } : undefined,
    },
    offset: pagination && pagination.page * pagination.perPage,
    limit: pagination && pagination.perPage,
}));
exports.app = express()
    .use(express.json())
    .use(U.routes({
    "/users/new": U.preValidate(TG.UserCodec, fp_ts_1.function.flow(DB.create(DB.Users), fp_ts_1.taskEither.map(id => ({ id })))),
    "/users/get": fp_ts_1.function.flow(R.prop(`id`), DB.validateId(DB.Users), fp_ts_1.taskEither.chain(DB.findById(DB.Users))),
    "/reservations/new": U.preValidate(TG.NewReservationCodec, createReservation),
    "/reservations/getAll": U.preValidate(TG.GetReservationsCodec, getReservations),
}))
    .use((err, req, res, _) => {
    console.error(`Something horrible just happened`, err);
    res.status(500).send(err.message);
});
console.info(`Running ${Config_1.config.env} build`);
if (Config_1.config.env !== `test`)
    exports.app.listen(Config_1.config.port, () => console.log(`Listening on port ${Config_1.config.port} 🚀`));
//# sourceMappingURL=server.js.map
import * as express from "express";
import {
    apply as AP,
    either as E,
    function as F,
    task as T,
    taskEither as TE,
} from "fp-ts";
import * as R     from "ramda";
import S          from "sequelize";

import { API }    from "./API";
import { config } from "./Config";
import * as DB    from "./Repositories";
import * as TG    from "./Types";
import * as U     from "./Utils";

const availableSit = 4 * 5;

const validateAvailability = ({ partySize, date, time }: Pick<TG.Reservation, `date`|`time`|`partySize`>) => F.pipe(
    TE.tryCatch(() => DB.Reservations.sum(`partySize`, { where: { date, time } }), E.toError),
    T.map(E.chain(sum => availableSit - sum > partySize ? E.right(sum) : E.left(new Error(`Party size is too large`)))),
);

const createReservation: API[`/reservations/new`] = ({ reservation, userId }) => F.pipe(
    AP.sequenceT(TE.taskEither)(
        DB.validateId(DB.Users)(userId),
        validateAvailability(R.pick([`date`, `time`, `partySize`])(reservation)),
    ),
    TE.chain(([userId]) => DB.create(DB.Reservations)({ ...reservation, userId })),
    TE.map(id => ({ id })),
);

const getReservations: API[`/reservations/getAll`] = ({ startDate, endDate, pagination, userId }) =>
    DB.findAll(DB.Reservations)(U.deepCompact({
        where: {
            userId,
            date: startDate || endDate ? { [S.Op.gte]: startDate, [S.Op.lte]: endDate } : undefined,
        },
        offset : pagination && pagination.page * pagination.perPage,
        limit  : pagination && pagination.perPage,
    }));

export const app = express()
    .use(express.json())
    .use(U.routes<API>({
        "/users/new"           : U.preValidate(TG.UserCodec, F.flow(DB.create(DB.Users), TE.map(id => ({ id })))),
        "/users/get"           : F.flow(R.prop(`id`), DB.validateId(DB.Users), TE.chain(DB.findById(DB.Users))),
        "/reservations/new"    : U.preValidate(TG.NewReservationCodec, createReservation),
        "/reservations/getAll" : U.preValidate(TG.GetReservationsCodec, getReservations),
    }))

    .use((err, req, res, _) => {
        console.error(`Something horrible just happened`, err);
        res.status(500).send(err.message);
    });

console.info(`Running ${config.env} build`);

if(config.env !== `test`)
    app.listen(config.port, () => console.log(`Listening on port ${config.port} 🚀`));


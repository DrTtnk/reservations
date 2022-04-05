import * as express from "express";
import {
    apply as AP,
    either as E,
    function as F,
    taskEither as TE,
    task as T,
} from "fp-ts";
import * as R  from "ramda";
import S       from "sequelize";

import { API } from "./API";
import * as DB from "./Entities";
import * as TG from "./types";
import * as U  from "./utils";

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

const getReservations: API[`/reservations/getAll`] = ({ startDate, endDate, pagination }) => {
    const where   = { date: { [S.Op.between]: [startDate, endDate] } };
    const options = !pagination ? {} : {
        offset : pagination.page * pagination.perPage,
        limit  : pagination.perPage,
    };
    return DB.findAll(DB.Reservations)({ where, ...options });
};

export const app = express()
    .use(express.json())
    .use(U.routes<API>({
        "/users/new"           : U.validateSchema(TG.UserCodec, F.flow(DB.create(DB.Users), TE.map(id => ({ id })))),
        "/users/get"           : F.flow(R.prop(`id`), DB.validateId(DB.Users), TE.chain(DB.findById(DB.Users))),
        "/reservations/new"    : U.validateSchema(TG.NewReservationCodec, createReservation),
        "/reservations/getAll" : U.validateSchema(TG.GetReservationsCodec, getReservations),
    }))

    .use((req, res, next, err) => {
        console.error(`Something horrible just happened`, err);
        res.status(500).send(err.message);
    });

// app.listen(3000, () => console.log(`Listening on port 3000`));


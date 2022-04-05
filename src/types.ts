import * as te from "io-ts-extra";
import * as ts from "io-ts";
import * as tb from "ts-toolbelt";

import * as U  from "./utils";

export const EmailCodec = U.Narrow(`Email`, `string`, s => !!s.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/));
export const ReservationTime = U.Narrow(`ReservationTime`, `string`, s => s.endsWith(`:00`) && s >= `19:00` && s <= `23:00`);
export const Positive = U.Narrow(`PositiveInt`, `number`, n => n >= 0);
export const StrictPositive = U.Narrow(`StrictPositive`, `number`, n => n > 0);

export type Email = ts.TypeOf<typeof EmailCodec>;
export type Positive = ts.TypeOf<typeof Positive>;
export type StrictPositive = ts.TypeOf<typeof StrictPositive>;

export const UserCodec = ts.strict({
    name     : ts.string,
    email    : EmailCodec,
    password : ts.string,
});

export const ReservationCodec = ts.strict({
    date      : ts.string,
    time      : ReservationTime,
    partySize : StrictPositive,
});

export const NewReservationCodec = ts.strict({
    reservation : ReservationCodec,
    userId      : ts.number,
});

export const GetReservationsCodec = te.sparseType({
    startDate  : ts.string,
    endDate    : ts.string,
    pagination : te.optional(ts.strict({
        page    : Positive,
        perPage : StrictPositive,
    })),
});

export type UserData = ts.TypeOf<typeof UserCodec>;
export type ReservationData = ts.TypeOf<typeof ReservationCodec>;
export type ReservationTime = ts.TypeOf<typeof ReservationTime>;

export type GetReservationsInput = ts.TypeOf<typeof GetReservationsCodec>;
export type NewReservationInput = ts.TypeOf<typeof NewReservationCodec>;

export type UserId = tb.A.Type<number, "UserId">;
export type ReservationId = tb.A.Type<number, "ReservationId">;

export type User = UserData & { id: UserId };
export type Reservation = ReservationData & { id: ReservationId, userId: UserId };


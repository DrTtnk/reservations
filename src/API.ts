import { taskEither as TE } from "fp-ts";

import * as TG              from "./types";

export type API = {
    "/users/new":           (user: TG.UserData) => TE.TaskEither<Error, { id: TG.UserId }>,
    "/users/get":           (userId: { id: TG.UserId }) => TE.TaskEither<Error, TG.UserData>,
    "/reservations/new":    (data: TG.NewReservationInput) => TE.TaskEither<Error, { id: TG.ReservationId }>,
    "/reservations/getAll": (data: TG.GetReservationsInput) => TE.TaskEither<Error, TG.Reservation[]>,
};
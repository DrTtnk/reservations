import * as request from "supertest";

import { API }      from "../src/API";
import { dbStatus } from "../src/Repositories";
import * as U       from "../src/Utils";
import { app }      from "../src/server";

const post = <T extends Extract<keyof API, string>>(
    path: T,
    data: U.Unvalidated<Parameters<API[T]>[0]>
) => request(app).post(path).send(data);

beforeAll(() => dbStatus);

describe(`Users`, () => {
    it(`Creates a new user`, async () => {
        const response = await post(`/users/new`, {
            name     : `test`,
            email    : `mimmo@cacione.com`,
            password : `test`,
        });

        const { body } = await request(app)
            .post(`/users/get`)
            .send({ id: response.body.id });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(`id`);
        expect(body.id).toBe(response.body.id);
        expect(body.name).toBe(`test`);
        expect(body.email).toBe(`mimmo@cacione.com`);
    });

    it(`Fails when the user already exists`, async () => {
        const response = await post(`/users/new`, {
            name     : `test`,
            email    : `mimmo@cacione.com`,
            password : `test`,
        });

        expect(response.status).toBe(400);
    });

    it(`Fails when the mail is invalid`, async () => {
        const response = await post(`/users/new`, {
            name     : `test`,
            email    : `not a valid email`,
            password : `test`,
        });

        expect(response.status).toBe(400);
    });
});

describe(`Reservations`, () => {
    let userId: number;
    beforeAll(async () => {
        const response = await post(`/users/new`, {
            name     : `test`,
            email    : `theNewUser@gmail.com`,
            password : `test`,
        });

        userId = response.body.id;
    });

    it(`There are no reservation at the start of the server`, async () => {
        const response = await post(`/reservations/getAll`, {});

        expect(response.body).toHaveLength(0);
    });

    it(`Creates a new reservation`, async () => {
        const response = await post(`/reservations/new`, {
            userId,
            reservation: { date: `2020-01-01`, time: `20:00`, partySize: 10 },
        });

        const newReservation = await post(`/reservations/getAll`, {});

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(`id`);
        expect(newReservation.body).toHaveLength(1);
    });

    it(`Finds the reservations in range`, async () => {
        const { body: { id } } = await post(`/reservations/new`, { userId, reservation: { date: `2022-01-02`, time: `20:00`, partySize: 10 } });

        const all     = await post(`/reservations/getAll`, {});
        const inRange = await post(`/reservations/getAll`, { startDate: `2022-01-01`, endDate: `2022-01-03` });
        const after   = await post(`/reservations/getAll`, { startDate: `2022-01-03` });
        const before  = await post(`/reservations/getAll`, { endDate: `2000-01-01` });

        expect(all.body).toHaveLength(2);
        expect(inRange.body).toHaveLength(1);
        expect(inRange.body[0].id).toBe(id);
        expect(after.body).toHaveLength(0);
        expect(before.body).toHaveLength(0);
    });

    it(`Uses pagination`, async () => {
        const firstHalf = await post(`/reservations/getAll`, { pagination: { page: 0, perPage: 1 } });
        expect(firstHalf.body).toHaveLength(1);

        const secondHalf = await post(`/reservations/getAll`, { pagination: { page: 1, perPage: 1 } });
        expect(secondHalf.body).toHaveLength(1);

        const all = await post(`/reservations/getAll`, { pagination: { page: 0, perPage: 2 } });
        expect(all.body).toHaveLength(2);
    });

    it(`Fails when the reservation is already taken`, async () => {
        const response = await post(`/reservations/new`, { userId, reservation: { date: `2020-01-01`, time: `20:00`, partySize: 11 } });

        expect(response.status).toBe(400);
    });

    it(`Fails when the user does not exist`, async () => {
        const response = await post(`/reservations/new`, {
            userId      : 100,
            reservation : { date: `2020-01-01`, time: `20:00`, partySize: 10 },
        });

        expect(response.status).toBe(400);
    });

    it(`Fails when the reservation is invalid`, async () => {
        const invalidSize  = await post(`/reservations/new`, { userId, reservation: { date: `2020-01-01`, time: `20:00`, partySize: -1 } });
        const timeTooEarly = await post(`/reservations/new`, { userId, reservation: { date: `2020-01-01`, time: `10:00`, partySize: 10 } });
        const timeTooLate  = await post(`/reservations/new`, { userId, reservation: { date: `2020-01-01`, time: `00:00`, partySize: 10 } });
        const notWholeHour = await post(`/reservations/new`, { userId, reservation: { date: `2020-01-01`, time: `20:30`, partySize: 10 } });

        expect(invalidSize.status).toBe(400);
        expect(timeTooEarly.status).toBe(400);
        expect(timeTooLate.status).toBe(400);
        expect(notWholeHour.status).toBe(400);
    });
});


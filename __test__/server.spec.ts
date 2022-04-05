import * as request from "supertest";

import { API }      from "../src/API";
import { dbStatus } from "../src/Entities";
import { app }      from "../src/server";
import * as U       from "../src/utils.js";

const post = <T extends Extract<keyof API, string>>(
    path: T,
    data: U.Unvalidate<Parameters<API[T]>[0]>
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
        const response = await post(`/reservations/getAll`, { startDate: `0000/00/00`, endDate: `9999/00/00` });

        expect(response.body).toHaveLength(0);
    });

    it(`Creates a new reservation`, async () => {
        const response = await post(`/reservations/new`, {
            userId,
            reservation: { date: `2020-01-01`, time: `20:00`, partySize: 10 },
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(`id`);
    });

    it(`Fails when the user does not exist`, async () => {
        const response = await post(`/reservations/new`, {
            userId      : 100,
            reservation : { date: `2020-01-01`, time: `20:00`, partySize: 10 },
        });

        expect(response.status).toBe(400);
    });

    it(`Fails when the reservation is invalid`, async () => {
        const invalidSize = await post(`/reservations/new`, {
            userId      : userId,
            reservation : { date: `2020-01-01`, time: `20:00`, partySize: -1 },
        });

        expect(invalidSize.status).toBe(400);

        const timeTooEarly = await post(`/reservations/new`, {
            userId      : userId,
            reservation : { date: `2020-01-01`, time: `10:00`, partySize: 10 },
        });

        expect(timeTooEarly.status).toBe(400);

        const timeTooLate = await post(`/reservations/new`, {
            userId      : userId,
            reservation : { date: `2020-01-01`, time: `00:00`, partySize: 10 },
        });

        expect(timeTooLate.status).toBe(400);

        const notWholeHour = await post(`/reservations/new`, {
            userId      : userId,
            reservation : { date: `2020-01-01`, time: `20:30`, partySize: 10 },
        });

        expect(notWholeHour.status).toBe(400);

    });

});


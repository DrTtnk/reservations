import {
    array as A,
    either as E,
    function as F,
    taskEither as TE,
} from "fp-ts";
import S          from "sequelize";

import { config } from "./Config";
import * as TG    from "./Types";

const db = config.database;

const sequelize = config.env === `test`
    ? new S.Sequelize(`sqlite::memory:`)
    : new S.Sequelize(`postgres://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`);

export const Users = sequelize.define<S.Model<TG.User>>(`user`, {
    id       : { type: S.INTEGER, primaryKey: true, autoIncrement: true },
    name     : { type: S.STRING,  allowNull: false },
    email    : { type: S.STRING,  allowNull: false, unique: true },
    password : { type: S.STRING,  allowNull: false },
});

export const Reservations = sequelize.define<S.Model<TG.Reservation>>(`reservation`, {
    id        : { type: S.INTEGER, primaryKey: true, autoIncrement: true },
    userId    : { type: S.INTEGER, allowNull: false },
    date      : { type: S.STRING,  allowNull: false },
    time      : { type: S.STRING,  allowNull: false },
    partySize : { type: S.INTEGER, allowNull: false },
});

Users.hasMany(Reservations);

Reservations.belongsTo(Users, { foreignKey: `userId` });

export const dbStatus = sequelize.sync({ force: true, logging: false });

type Repo<T extends { id: unknown }> = S.ModelCtor<S.Model<T>>;

export const validateId = <T extends { id: unknown }>(model: Repo<T>) => (id: number) => F.pipe(
    TE.tryCatch(() => model.findOne({ where: { id } }), E.toError),
    TE.chain(u => u ? TE.of(u.toJSON().id as T[`id`]) : TE.left(new Error(`${model.name} with id ${id} not found`)))
);

export const create
    = <T extends { id: unknown }>(model: Repo<T>) =>
        (data: Omit<T, `id`>) => TE.tryCatch(() => model.create(data as any).then(u => u.toJSON().id as T[`id`]), E.toError);

export const findOne
    = <T extends { id: unknown }>(model: Repo<T>) =>
        (opt: S.FindOptions<T>) => TE.tryCatch(() => model.findOne(opt).then(u => u.toJSON()), E.toError);

export const findById = <T extends { id: unknown }>(model: Repo<T>) => (id: number) => findOne(model)({ where: { id } });

export const findAll
    = <T extends { id: unknown }>(model: Repo<T>) =>
        (opt: S.FindOptions<T>) => TE.tryCatch(() => model.findAll(opt).then(A.map(r => r.toJSON())), E.toError);

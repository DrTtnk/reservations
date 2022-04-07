"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAll = exports.findById = exports.findOne = exports.create = exports.validateId = exports.dbStatus = exports.Reservations = exports.Users = void 0;
const fp_ts_1 = require("fp-ts");
const sequelize_1 = require("sequelize");
const Config_1 = require("./Config");
const db = Config_1.config.database;
const sequelize = Config_1.config.env === `test`
    ? new sequelize_1.default.Sequelize(`sqlite::memory:`)
    : new sequelize_1.default.Sequelize(`postgres://${db.user}:${db.password}@${db.host}:${db.port}/${db.database}`);
exports.Users = sequelize.define(`user`, {
    id: { type: sequelize_1.default.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.default.STRING, allowNull: false },
    email: { type: sequelize_1.default.STRING, allowNull: false, unique: true },
    password: { type: sequelize_1.default.STRING, allowNull: false },
});
exports.Reservations = sequelize.define(`reservation`, {
    id: { type: sequelize_1.default.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: sequelize_1.default.INTEGER, allowNull: false },
    date: { type: sequelize_1.default.STRING, allowNull: false },
    time: { type: sequelize_1.default.STRING, allowNull: false },
    partySize: { type: sequelize_1.default.INTEGER, allowNull: false },
});
exports.Users.hasMany(exports.Reservations);
exports.Reservations.belongsTo(exports.Users, { foreignKey: `userId` });
exports.dbStatus = sequelize.sync({ force: true, logging: false });
const validateId = (model) => (id) => fp_ts_1.function.pipe(fp_ts_1.taskEither.tryCatch(() => model.findOne({ where: { id } }), fp_ts_1.either.toError), fp_ts_1.taskEither.chain(u => u ? fp_ts_1.taskEither.of(u.toJSON().id) : fp_ts_1.taskEither.left(new Error(`${model.name} with id ${id} not found`))));
exports.validateId = validateId;
const create = (model) => (data) => fp_ts_1.taskEither.tryCatch(() => model.create(data).then(u => u.toJSON().id), fp_ts_1.either.toError);
exports.create = create;
const findOne = (model) => (opt) => fp_ts_1.taskEither.tryCatch(() => model.findOne(opt).then(u => u.toJSON()), fp_ts_1.either.toError);
exports.findOne = findOne;
const findById = (model) => (id) => (0, exports.findOne)(model)({ where: { id } });
exports.findById = findById;
const findAll = (model) => (opt) => fp_ts_1.taskEither.tryCatch(() => model.findAll(opt).then(fp_ts_1.array.map(r => r.toJSON())), fp_ts_1.either.toError);
exports.findAll = findAll;
//# sourceMappingURL=Repositories.js.map
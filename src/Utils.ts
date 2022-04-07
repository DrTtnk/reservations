import * as express from "express";
import {
    either as E,
    function as F,
    task as T,
    taskEither as TE,
} from "fp-ts";
import { formatValidationErrors } from "io-ts-reporters";
import * as ts                    from "io-ts";
import * as R                     from "ramda";
import * as tb                    from "ts-toolbelt";

type MappedBaseType = { string: string, number: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type _ = any;

export const deepCompact = <T extends object|unknown[]>(o: T) => R.is(Array, o)
    ? R.reject(R.isNil, o).map(R.when(R.is(Object), deepCompact)) as T
    : [...Object.getOwnPropertySymbols(o), ...Object.keys(o)]
        .filter(k => !R.isNil(o[k]))
        .reduce((acc, k) => (acc[k] = R.is(Object, o[k]) ? deepCompact(o[k]) : o[k], acc), {}) as T;

export const peek = <T>(fn: (arg: T) => unknown) => <U extends T>(o: U) => (fn(o), o);
export const trace = (message: string) => peek(v => console.log(message, v));

export const Narrow = <Brand extends string, Type extends keyof MappedBaseType>(
    brand: Brand,
    type: Type,
    match: (s: MappedBaseType[Type]) => boolean
) => {
    const tester = (s: unknown): s is tb.A.Type<MappedBaseType[Type], Brand> => typeof s === type && match(s as MappedBaseType[Type]);
    return new ts.Type(brand, tester, (u, c) => tester(u) ? ts.success(u) : ts.failure(u, c), a => a);
};

export const preValidate = <T, U>(schema: ts.Type<T>, f: (t: T) => TE.TaskEither<Error, U>) =>
    F.flow(schema.decode, TE.fromEither, TE.fold(F.flow(formatValidationErrors, R.join(`\n`), Error, TE.left), f));

type Handler = (arguments_?: unknown) => TE.TaskEither<Error, unknown>;

export const routes = <Routes extends Record<string, Handler>>(api: Routes) => {
    const apiWrapper = (handler: Handler) => ({ body }: express.Request, response: express.Response) =>
        T.map(E.fold(
            ({ message: error }) => {
                console.error(`I don't feel so good, Mr Stark... :<`, { error, body });
                return response.status(400).json({ error });
            },
            data  => response.status(200).json(data)
        ))(handler(body))();

    return R.toPairs(api).reduce((r, [path, method]) => r.post(path, apiWrapper(method)), express.Router());
};

export type Unvalidated<T> =
    T extends tb.A.Type<infer U, _> ? U
  : T extends Record<string, unknown> ? { [K in keyof T]: Unvalidated<T[K]> }
  : T extends Array<infer U>          ? Unvalidated<U>[]
  : T;

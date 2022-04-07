import {
    either as E,
    function as F,
} from "fp-ts/";
import * as ts from "io-ts";

const ConfigCodec = ts.type({
    port     : ts.number,
    host     : ts.string,
    env      : ts.keyof({ development: null, production: null, test: null }),
    database : ts.type({
        host     : ts.string,
        port     : ts.number,
        user     : ts.string,
        password : ts.string,
        database : ts.string,
    }),
});

export type Config = ts.TypeOf<typeof ConfigCodec>;

export const config = F.pipe(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    { ...require(`../config/config.json`), env: process.env.NODE_ENV || `development` },
    ConfigCodec.decode,
    E.fold(() => (console.log(`Invalid config file`), process.exit(1)), F.identity)
);


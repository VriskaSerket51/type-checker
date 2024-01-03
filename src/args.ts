import { parse } from "ts-command-line-args";

export interface IArguments {
    src: string;
    out: string;
    strict: boolean;
}

export const args = parse<IArguments>({
    src: {
        type: String,
        description: "Input directory which contains .ts files",
    },
    out: {
        type: String,
        description: "Output directory which sanitizer script will be saved to",
    },
    strict: {
        type: Boolean,
        description:
            "Whether use strict mode. In strict mode, script does not check string value can be converted to number or boolean",
    },
});

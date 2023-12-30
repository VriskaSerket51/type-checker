import { parse } from "ts-command-line-args";

export interface IArguments {
  src: string;
  out: string;
}

export const args = parse<IArguments>({
  src: String,
  out: String,
});

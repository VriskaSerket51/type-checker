import { buildScript } from ".";
import { args } from "./args";

const srcDir = args.src;
const outputPath = args.out;
const isStrictMode = args.strict;

buildScript(srcDir, outputPath, isStrictMode);

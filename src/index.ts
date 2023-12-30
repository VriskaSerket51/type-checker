import fs from "fs";
import { TypescriptParser, InterfaceDeclaration } from "typescript-parser";
import { readAllFiles } from "./utils";
import { args } from "./args";
import { defaultTypes } from "./defaultTypes";

const srcDir = args.src;

const outputPath = args.out;

const fileNames: string[] = [];

readAllFiles(srcDir, fileNames, (fileName: string) => fileName.endsWith(".ts"));

let output = "";

async function main() {
    const parser = new TypescriptParser();
    const parsed = await parser.parseFiles(fileNames, srcDir);

    const arraySanitizers: string[] = [];

    for (const file of parsed) {
        for (const declaration of file.declarations) {
            if (declaration instanceof InterfaceDeclaration) {
                output += `function sanitize${declaration.name}(checker: any) {\n`;
                if (declaration.properties.length > 0) {
                    for (const property of declaration.properties) {
                        if (property.type == "number") {
                            output += `if (typeof checker.${property.name} == "string" && !checker.${property.name}.isEmpty() && !Number.isNaN(Number(checker.${property.name}))) {\n`;
                            output += `checker.${property.name} = Number(checker.${property.name})\n`;
                            output += `}\n\n`;
                        }
                        if (property.type == "boolean") {
                            output += `if (typeof checker.${property.name} == "string" && (checker.${property.name} == "true" || checker.${property.name} == "false")) {\n`;
                            output += `checker.${property.name} = checker.${property.name} == "true"\n`;
                            output += `}\n\n`;
                        }
                    }

                    output += `if (`;
                    const ifStatements: string[] = [];
                    for (const property of declaration.properties) {
                        property.type = property.type || "any";
                        const isArrayType = property.type.includes("[]");
                        let arrayDimension = 0;

                        if (isArrayType) {
                            while (property.type.includes("[]")) {
                                if (!arraySanitizers.includes(property.type)) {
                                    arraySanitizers.push(property.type);
                                }
                                property.type = property.type.replace("[]", "");
                                arrayDimension++;
                            }
                        }

                        if (
                            property.type == "any" ||
                            property.type == "unknown"
                        ) {
                            continue;
                        }

                        let statement = "";
                        if (isArrayType) {
                            let santizerName = `sanitize${property.type}`;
                            for (let i = 0; i < arrayDimension; i++) {
                                santizerName += "Array";
                            }
                            statement = `!${santizerName}(checker.${property.name})`;
                        } else if (defaultTypes.includes(property.type)) {
                            statement = `typeof checker.${property.name} != "${property.type}"`;
                        } else {
                            statement = `!sanitize${property.type}(checker.${property.name})`;
                        }
                        if (property.isOptional) {
                            statement = `(checker.${property.name} != undefined && ${statement})`;
                        }

                        ifStatements.push(statement);
                    }
                    output += ifStatements.join(" || ");
                    output += `) {\nreturn false;\n}\n`;
                }
                output += "return true;\n}\n\n";
            }
        }
    }

    for (const arraySanitizer of arraySanitizers) {
        let originType = arraySanitizer;
        let arrayDimension = 0;
        while (originType.includes("[]")) {
            originType = originType.replace("[]", "");
            arrayDimension++;
        }

        let santizerName = `sanitize${originType}`;
        for (let i = 0; i < arrayDimension; i++) {
            santizerName += "Array";
        }
        let subSantizerName = `${originType}`;
        for (let i = 0; i < arrayDimension - 1; i++) {
            subSantizerName += "Array";
        }

        output += `function ${santizerName}(checker: any) {\n`;
        output += `if (!Array.isArray(checker)) {\nreturn false;\n}\n\n`;

        output += `for (let i = 0; i < checker.length; i++) {\n`;

        output += `if (`;
        const ifStatements: string[] = [];

        if (defaultTypes.includes(subSantizerName)) {
            ifStatements.push(`typeof checker[i] != "${subSantizerName}"`);
        } else {
            ifStatements.push(`!sanitize${subSantizerName}(checker[i])`);
        }

        output += ifStatements.join(" || ");
        output += `) {\nreturn false;\n}\n`;

        output += `}\n`;

        output += `return true;\n}\n\n`;
    }

    fs.writeFileSync(outputPath, output);
}

main();

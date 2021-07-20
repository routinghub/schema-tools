import * as fs from 'fs';
import * as path from 'path';

import { loadExcel, ParseError, ParseResult } from "../excel_parser";
import { Keys } from '../schema';

const args = process.argv.slice(2);

if (process.argv.length < 4) {
    const tsName = path.basename(process.argv[0]);
    const scriptName = path.join('./', process.argv[1].substr(process.cwd().length));

    console.error(`Usage: \n$ yarn --silent ${tsName} ${scriptName} input.xlsx out.json`);
    process.exit(-1);
}

const excelTemplatePath = args[0];
const outJsonPath = args[1];

const buffer = fs.readFileSync(excelTemplatePath).buffer;
console.error(`Converting ${excelTemplatePath}, ${buffer.byteLength} bytes...`);

loadExcel(buffer).then((result: ParseResult) => {
    for (let key of Object.values(Keys)) {
        if (result.errors[key] !== undefined && result.errors[key]!.length > 0) {
            for (let error of result.errors[key]!) {
                console.error(`Error processing key "${key}": ${error.message} at ${error.address}`)
            }
        }
    }
    fs.writeFileSync(outJsonPath, JSON.stringify(result.json, undefined, 4));
    console.error(`Done, result written to ${outJsonPath}`);
});

import * as fs from 'fs';
import * as path from 'path';

import { loadExcel } from "../excel_parser";

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

loadExcel(buffer).then((result) => {
    fs.writeFileSync(outJsonPath, JSON.stringify(result, undefined, 4));
    console.error('Done.');
});

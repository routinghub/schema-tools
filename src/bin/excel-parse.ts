import * as fs from 'fs';
import * as path from 'path';

import { loadExcel } from "../excel_parser";

const args = process.argv.slice(2);

if (args.length == 0) {
    // yarn --silent ts-node-transpile-only src/bin/excel-parse.ts input.xlsx > out.json
    const tsName = path.basename(process.argv[0]);
    const scriptName = path.join('./', process.argv[1].substr(process.cwd().length));

    console.error(`Usage: \n$ yarn --silent ${tsName} ${scriptName} input.xlsx > out.json`);
    process.exit(-1);
}

const ROUTING_EXCEL_PATH = args[0];
const buffer = fs.readFileSync(ROUTING_EXCEL_PATH).buffer;
console.error(`Converting ${ROUTING_EXCEL_PATH}, ${buffer.byteLength} bytes...`);

loadExcel(buffer).then((result) => {
    process.stdout.write(JSON.stringify(result, undefined, 4));
    console.error('Done.');
});

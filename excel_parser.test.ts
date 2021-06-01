import * as fs from 'fs';
import * as path from 'path';

import { loadExcel } from "./excel_parser";


test('should parse generated excel', () =>
{
    const ROUTING_EXCEL_PATH = path.resolve(__dirname, 'routing.flattened.xlsx');
    const buffer = fs.readFileSync(ROUTING_EXCEL_PATH).buffer;
    // TODO: check structure
    // TODO: check JSON schema
    // TODO: check time windows and datetime+timezone math
    return expect(loadExcel(buffer)).resolves.toBeDefined();
});

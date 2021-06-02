import * as fs from 'fs';
import * as path from 'path';

import { loadExcel } from "./excel_parser";

const MS = 1;
const S = 1000 * MS;
const TEST_TIMEOUT = 30 * S;

test('should parse generated excel', () =>
{
    const ROUTING_EXCEL_PATH = path.resolve(__dirname, 'routing.flattened.xlsx');
    const buffer = fs.readFileSync(ROUTING_EXCEL_PATH).buffer;
    expect(buffer.byteLength).toBeGreaterThan(0);
    
    // TODO: check structure
    // TODO: check JSON schema
    // TODO: check time windows and datetime+timezone math
    return expect(loadExcel(buffer)).resolves.toBeDefined();

}, TEST_TIMEOUT);

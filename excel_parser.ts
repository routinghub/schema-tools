import { Keys, Field, ExcelSchema } from './schema';
import * as JsonSchema from './json_schema_converter';
import * as FLAT_ROUTING_SCHEMA from './routing.flattened.json';

import * as Excel from 'exceljs';
import { DateTime, Duration } from 'luxon';
import * as dt from '../lib/datetime';

function getFlattenedRoutingSchema(): ExcelSchema
{
    return FLAT_ROUTING_SCHEMA as unknown as ExcelSchema;
}

// Loads Excel file from provided buffer, and converts worksheets
// to data matrix and typed json, collecting parsing errors.
//
// @returns Promise that resolves to parsed Excel worksheet
//
export function loadExcel(buffer: Excel.Buffer): Promise<ParseResult>
{
    return new Promise<any>((resolve, reject) => {
        const wb = new Excel.Workbook();

        wb.xlsx.load(buffer)
            .then((workbook: Excel.Workbook) => {
                const result = parseExcel(workbook);
                resolve(result);
            })
            .catch((reason: any) => {
                reject(reason);
            })
    });
}

export interface ParseError
{
    address?: string,
    message: string
}

export type Primitive = string | number | boolean | Date;

export type Matrix = Primitive[][];

export interface ParseResult
{
    json: Partial<Record<Keys, any>>,
    matrix: Partial<Record<Keys, Matrix>>,
    errors: Partial<Record<Keys, ParseError[]>>
}


function getHints(ws: Excel.Worksheet, leafFields: Set<string>)
    : [number, Map<string, number>]
{
    const NO_HINT_ROW = -1;
    let rowIndex: number = NO_HINT_ROW;
    let indexes: Map<string, number> = new Map();

    for(let r = 1; r <= ws.rowCount && rowIndex === NO_HINT_ROW; ++r) {
        const row = ws.getRow(r);

        for(let c = 1;; ++c) { // try to read all columns until null
            const cell = row.getCell(c);
            if (cell.type !== Excel.ValueType.String) {
                break;
            }
            const cellStringVal: string = (cell.value + '');
            if (cellStringVal == '') {
                break;
            }

            if (leafFields.has(cellStringVal)) {
                if (NO_HINT_ROW === rowIndex) {
                    rowIndex = r;
                }
                indexes.set(cellStringVal, c);
            } else {
                if (rowIndex !== NO_HINT_ROW) {
                    throw Error(
                        `Worksheet "${ws.name}" row "${r}" appears to have column hints, ` +
                        `but cell "${c}" with value "${cellStringVal}" is not a valid column hint name.`);
                }
            }
        }
    };

    if (rowIndex == NO_HINT_ROW) {
        throw Error(`Worksheet "${ws.name}" does not have column hints rows`);
    }

    return [rowIndex, indexes];
}

function getMatrix(ws: Excel.Worksheet, hintRowIndex: number, hintsIndexes: Map<string, number>): Matrix
{
    let dataRowIndex = hintRowIndex + 3;
    const data: Matrix = [];
    const colIndexes = [...hintsIndexes.values()];

    for(let r = dataRowIndex; r <= ws.rowCount; ++r) {
        const rowData: Primitive[] = [];
        const row = ws.getRow(r);

        for(let c of colIndexes) {
            const cell = row.getCell(c);
            rowData.push(cell.value as Primitive);
        }
        // stop on first empty row (where all hinted columns are empty)
        if (rowData.every((v: any) => v == null || v == '')) {
            break;
        }
        data.push(rowData);
    }

    return data;
}

function setByPath(result: any, path: string[], leafValue: any): any
{
    if (leafValue === null || leafValue === undefined) {
        return result;
    }
    while (path.length > 1) {
        const key = path.shift()!;
        if (!(key in result)) {
            result[key] = {};
        }
        setByPath(result[key], path, leafValue);
    }
    if (path.length > 0 && leafValue !== null) {
        const key = path.shift()!;
        result[key] = leafValue;
    }
    return result;
};

function merge(
    dst: Record<string, any>,
    src: Record<string, any>,
    schema: Map<string, Field>)
{
    const ROOT_PATH = '';

    const makeArray = (value: any) => {
        if (typeof value === 'string') {
            return value.split(', ').map(s => s.trim());
        } else {
            return [value];
        }
    }

    const fun = (
        dst: Record<string, any> | any,
        src: Record<string, any> | any,
        path: string,
        schema: Map<string, Field>) =>
    {
        for (let key of Object.keys(src)) {
            const currentPath = path != ROOT_PATH ? path + '.' + key : key;
            if (true === schema.get(currentPath)?.isList) {
                if (dst[key] === undefined) {
                    dst[key] = {};
                }
                fun(dst[key], src[key], currentPath, schema);
            }
            else if (true === schema.get(currentPath)?.isListId) {
                const dictKey = src[key];
                if (dst[dictKey] === undefined) {
                    dst[dictKey] = {};
                }
                // TODO: differentiate between duplicate id's and lists
                //       represented as repeated rows and different row columns.
                //
                // else {
                //    throw new Error(`Duplicate id "${dictKey}"`);
                // }
                dst = dst[dictKey];
            }
            else {
                if (typeof dst[key] == 'object' && typeof src[key] == 'object') {
                    // parse object recursively
                    if (dst[key] === undefined) {
                        dst[key] = {};
                    }
                    fun(dst[key], src[key], currentPath, schema);
                } else if (Array.isArray(dst[key]) && Array.isArray(src[key])) {
                    // parse csv array value and append to the existing entry
                    if (dst[key] === undefined) {
                        dst[key] = [];
                    }
                    dst[key].push(makeArray(src[key]));
                } else {
                    if (JsonSchema.isArray(schema.get(currentPath)!.props!)) {
                        // parse csv array value for the first entry
                        if (dst[key] === undefined) {
                            dst[key] = [];
                        }
                        dst[key].push(makeArray(src[key]));
                    }
                    else {
                        // set POD field
                        dst[key] = src[key];
                    }
                }
            }
        }
    }

    fun(dst, src, ROOT_PATH, schema);
}

// Returns UTC timestamp at 00:00:00 of provided date at provided timezone
function parseDate(s: string | Date, timeZone: string): DateTime
{
    if (typeof s === 'string') {
        return DateTime.fromISO(s, {zone: 'UTC'});
    } else if (s instanceof Date) {
        return DateTime.fromJSDate(s, {zone: 'UTC'});
    } else {
        throw new Error(`Invalid date "${s}": not a string or Date object`);
    }
}

// Parses duration from HH:MM(:SS){0,}(\+{\d}d){0,}
function parseDuration(s: string | Date, timeZone: string): Duration
{
    if (typeof s === 'string') {
        return dt.timeToDuration(s, timeZone);
    } else if (s instanceof Date) {
        // Time relative to Excel zero date, 1899-12-30
        const parsed = DateTime.fromJSDate(s, {zone: timeZone});
        if (parsed.year == 1899 && parsed.month == 12 && parsed.day == 30) {
            return Duration.fromObject({
                hours: parsed.hour,
                minutes: parsed.minute,
                seconds: parsed.second
            });
        } else {
            throw new Error(`Invalid datetime "${s}": not an Excel zero-base date`);
        }
    } else {
        throw new Error(`Invalid datetime "${s}": not a string or Date object`);
    }
}

// Replaces predefined fields of JSON to types expected by Routing API  
//
function extendOptions(json: any): void
{
    let timeZone: string = json.options.timezone || 'UTC';
    let date: DateTime = parseDate(json.options.date, timeZone);

    if (!date.isValid) {
        throw new Error(`Invalid date "${json.options.date}": ${date.invalidExplanation}`);
    }

    const walk = (value: any, base: string) => {
        if (base == 'time_window') {
            const start = parseDuration(value['start'], timeZone);
            const end = parseDuration(value['end'], timeZone);
            value['start'] = date.plus(start).toFormat(dt.ISO_TIME_FORMAT);
            value['end'] = date.plus(end).toFormat(dt.ISO_TIME_FORMAT);
        } else {
            if (typeof value == 'object') {
                for (let key of Object.keys(value)) {
                    walk(value[key], key);
                }
            } else if (Array.isArray(value)) {
                for (let key of value) {
                    walk(value[key], key + '');
                }
            }
        }
    }

    walk(json, '');
}

export function parseExcel(wb: Excel.Workbook): ParseResult
{
    const schemas = getFlattenedRoutingSchema();
    const result: ParseResult = {
        json: {},
        errors: {},
        matrix: {}
    };

    const worksheets = new Map<string, Excel.Worksheet>(
        wb.worksheets.map(ws => [ws.name, ws])
    );

    for (let key of Object.values(Keys)) {
        const schema = schemas[key];
        result.errors[key] = [];

        if (!worksheets.has(schema.sheetName)) {
            result.errors[key]!.push({message: `Sheet "${schema.sheetName}" is required but not found`})
            continue;
        }
        
        const ws = worksheets.get(schema.sheetName)!;

        const leafFields = new Set(
            schema.fields
                .filter(field => field.leaf)
                .map(field => field.name)
        );

        // (1) detect hints row and columns -> indexes map
        let [hintRowIndex, hintsIndexes] = getHints(ws, leafFields);
        //console.error(hintRowIndex, hintsIndexes);

        // (2) collect cell values matrix
        result.matrix[key] = getMatrix(ws, hintRowIndex, hintsIndexes);
        //console.error(result.matrix[key]);

        // (3) transform matrix to partial objects
        const fields = new Map<string, Field>(
            schema.fields.map(field => [field.name, field])
        );
        
        result.json[key] = {};
        result.matrix[key]!
            .map(row => {
                const record: Record<string, any> = {};
                for (let [path, col]: [string, number] of hintsIndexes) {
                    const value = row[col - 1]; // column index is 1-based
                    setByPath(record, path.split('.'), value);
                }
                return record;
            })
            .forEach(record => {
                merge(result.json[key], record, fields);
            });
    }
    extendOptions(result.json);
    return result;
}



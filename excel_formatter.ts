import { JSONSchema4 } from 'json-schema';

import unified from 'unified';
import markdown from 'remark-parse';
import * as unist from 'unist';

import * as Excel from 'exceljs';
import * as converter from './json_schema_converter';
import { Field } from './schema';

export interface ExampleData
{
    // list of recursively flattened fields
    schema: Field[],
    // output headers row
    headers: string[],
    // column hints rows
    hints: string[],
    // data rows
    data: any[]
}

const DATA_SHEET_CELL_FIT_MARGIN_RIGHT = 2;

export const DEFAULT_TEXT_FONT: Partial<Excel.Font> = {
    name: 'Arial', size: 12
};

export const LEAF_STYLE_DEFAULT_COL_FONT: Partial<Excel.Font> = {
    size: 12,
    name: 'Courier',
    color: {'argb': 'FF3355FF'}
};

export const DEFAULT_STYLE: Partial<Excel.Style> = {
    font: DEFAULT_TEXT_FONT,
    alignment: {
        vertical: 'middle' as const,
        horizontal: 'left' as const
    } 
};

export const LEAF_STYLE: Partial<Excel.Style> = {
    font: DEFAULT_STYLE.font!,
    alignment: {
        ...DEFAULT_STYLE.alignment!,
        indent: 1
    } 
};

export const NON_LEAF_STYLE: Partial<Excel.Style> = {
    font: {
        ...DEFAULT_STYLE.font!,
        bold: true
    },
    alignment: {
        ...DEFAULT_STYLE.alignment!,
        indent: 1
    }
};

export const HEADER_STYLE: Partial<Excel.Style> = {
    font: {
        ...DEFAULT_TEXT_FONT,
        bold: true
    },
    alignment: {
        ...DEFAULT_STYLE.alignment!,
        indent: 1
    }
};

export const HEADER_HEIGHT: number = 25;

export const DESC_STYLE: Partial<Excel.Style> = {
    font: DEFAULT_TEXT_FONT,
    alignment: {
        indent: 1,
        vertical: 'middle' as const,
        horizontal: 'left' as const,
        wrapText: true
    }
};

export const DATA_HEADER_STYLE: Partial<Excel.Style> = {
    font: HEADER_STYLE.font,
    alignment: DEFAULT_STYLE.alignment!
};

export const DATA_HEIGHT: number = 25;

export const DATA_STYLE = DEFAULT_STYLE;

export const DATA_HINTS_STYLE: Partial<Excel.Style>  = {
    font: {...DEFAULT_STYLE.font, size: 10 },
    alignment: {...DEFAULT_STYLE.alignment}
};

export const DATA_HINTS_TYPES_STYLE: Partial<Excel.Style>  = {
    font: {
        ...DATA_HINTS_STYLE.font!,
        color: {argb: 'FF555555'},
        italic: true
    },
    alignment: {
        ...DATA_HINTS_STYLE.alignment!,
        vertical: 'bottom' as const
    }
};

export const DATA_HINTS_TYPES_HEIGHT = DATA_HEIGHT * 0.5;

export const DATA_HINTS_HELP_STYLE: Partial<Excel.Style>  = {
    font: {
        ...DATA_HINTS_STYLE.font!,
        color: {argb: 'FF3355FF'},
        italic: true,
        underline: true
    },
    alignment: {
        ...DATA_HINTS_STYLE.alignment!,
        vertical: 'top' as const
    }
};

export const DATA_HINTS_HELP_HEIGHT = DATA_HEIGHT * 0.8;

export function setRowGrayFill(ws: Excel.Worksheet, row: Excel.Row)
{
    for(let i = 0; i < row.cellCount; ++i)
    {
        row.getCell(i + 1).fill = {
            type: 'pattern' as const,
            pattern: 'solid' as const,
            fgColor: {argb:'FFEAEAEA'}
        };
    }
}

export function addFormulaRow(ws: Excel.Worksheet, data: any[])
{
    const row = ws.addRow([new Array(data.length).fill('')]);
    for (let i = 0; i < data.length; ++i) {
        const value: Excel.CellFormulaValue = {
            formula: data[i],
            result: '(recalculate)',
            date1904: false
        };
        row.getCell(i+1).value = value;
    }
    return row;
}

export function colspan(value: string, cols: number): string[]
{
    return [value, ...new Array(cols-1).fill(null)]
}

// Converts 1-based column index to Excel 'A'...'ZZ..'
// representation for formulas.
//
export function excelize(col: number): string
{
    let tmp, addr = '';
    while(col > 0) {
        tmp = (col - 1) % 26;
        addr = String.fromCharCode(tmp + 65) + addr;
        col = (col - tmp - 1) / 26;
    }
    return addr;
};

// Generates Excel sheet with example data
// from provided flattened JSON schema.
//
export function addDataSheet(
    wb: Excel.Workbook,
    example: ExampleData,
    sheetName: string,
    key: string)
{
    const ws = wb.addWorksheet(sheetName);

    // get column widths from content
    //
    let widths: number[] = new Array(example.headers.length).fill(0);
    
    example.headers.forEach((value: string, i: number, arr: string[]) => {
        if (value != null) {
            if (!(value != null && arr[i+1] == null) || i == arr.length-1) {
                widths[i] = Math.max(
                    widths[i],
                    Math.ceil(value.length * (DATA_HEADER_STYLE.font!.size! / 10.0))
                        + DATA_SHEET_CELL_FIT_MARGIN_RIGHT
                );
            }
        }
    });
    
    example.hints.forEach((value: string, i: number) => {
        widths[i] = Math.max(
            widths[i],
            Math.ceil(value.length * (DATA_HINTS_STYLE.font!.size! / 10.0))
                + DATA_SHEET_CELL_FIT_MARGIN_RIGHT
        );
    });    
    example.data.forEach((row: any[]) => {
        row.forEach((value: string | number | boolean, i: number) => {
            const strValue: string = value + '';
            widths[i] = Math.max(
                widths[i],
                Math.ceil(strValue.length * (DATA_STYLE.font!.size! / 10.0))
                    + DATA_SHEET_CELL_FIT_MARGIN_RIGHT
            );
        })
    });

    // write columns
    //
    ws.columns = example.headers.map((name: string, i: number) => {
        return {
            header: name,
            width: widths[i],
            style: DATA_HEADER_STYLE
        };
    });
    ws.getRow(1).height = DATA_HEIGHT;

    // write hints row (columns names)
    //
    const hintsRow = ws.addRow(example.hints);
    hintsRow.eachCell((cell) => {
        cell.dataValidation = {
            type: 'list',
            allowBlank: false,
            formulae: [`${key}_cols_names`]
        }
    });    
    setRowGrayFill(ws, hintsRow);
    hintsRow.font = DATA_HINTS_STYLE.font!;
    hintsRow.alignment = DATA_HINTS_STYLE.alignment!;
    hintsRow.height = DATA_HEIGHT;

    // write hints row (automatic columns types + required/default values and help hyperlink)
    //    
    const hintsTypes: string[] = [];
    const hintsHelp: string[] = [];
    
    for(let i = 0; i < example.hints.length; ++i)
    {
        const colNameAddress = excelize(i + 1) + '2';
        const matchFormula = `MATCH(${colNameAddress}, ${key}_cols_names, 0)`;

        // take column name, find type in predefined range,
        // find required and default values in predefined ranges,
        // format for user
        hintsTypes.push(
            'INDEX(' +
                `${key}_cols_types, `+
                `${matchFormula}` +
            ') ' +
            '& IF(' +
                '"Required" = INDEX(' +
                    `${key}_cols_required, ` +
                    `${matchFormula}` +
                '), ' +
                '"*", ' +
                '" (" & INDEX(' +
                    `${key}_cols_default, ` +
                    `${matchFormula}` +
                ') ' +
                '& ")"' +
            ')'
        );

        // link to the documentation (legend) sheet
        hintsHelp.push(
            `HYPERLINK("#${key}." & ${colNameAddress}, "help")`
        );
    }
    
    const typesRow = addFormulaRow(ws, hintsTypes);
    setRowGrayFill(ws, typesRow);
    typesRow.font = DATA_HINTS_TYPES_STYLE.font!;
    typesRow.alignment = DATA_HINTS_TYPES_STYLE.alignment!;
    typesRow.height = DATA_HINTS_TYPES_HEIGHT;

    const helpRow = addFormulaRow(ws, hintsHelp);
    setRowGrayFill(ws, helpRow);
    helpRow.font = DATA_HINTS_HELP_STYLE.font!;
    helpRow.alignment =  DATA_HINTS_HELP_STYLE.alignment!;
    helpRow.height = DATA_HINTS_HELP_HEIGHT

    // freeze first helper rows
    ws.views = [
        {state: 'frozen', ySplit: ws.rowCount, activeCell: 'A1'}
    ];

    // write data rows
    //
    example.data.forEach(data => {
        const row = ws.addRow(data);
        row.font = DATA_STYLE.font!;
        row.alignment = DATA_STYLE.alignment!;
        row.height = DATA_HEIGHT;
    });    
}

function normal(text: string | number | boolean): Excel.RichText
{
    return {
        font: DEFAULT_TEXT_FONT,
        text: text as string
    };
};

function mono(text: string | number | boolean): Excel.RichText {
    return {
        font: LEAF_STYLE_DEFAULT_COL_FONT,
        'text': text as string
    };
};

// Formats Markdown description to Excel RichText
//
function formatDesc(f: Field): Excel.CellRichTextValue
{
    const tokens = unified()
        .use(markdown)
        .parse(f.props.description!.trim());

    const walk = (node: unist.Parent | unist.Node): Excel.RichText[] => {
        let stack: Excel.RichText[] = [];
        if ('children' in node) {
            if (node.type == 'paragraph') {
                stack.push(normal('\n'));
            }
            (node as unist.Parent).children.forEach((value) => {
                stack = stack.concat(walk(value));
            });
            if (node.type == 'paragraph') {
                stack.push(normal('\n'));
            }
        } else {
            switch(node.type) {
                case 'inlineCode':
                    stack.push(mono(node.value as string));
                    break;
                case 'text':
                    stack.push(normal(node.value as string));
                    break;
                default:
                    throw new Error(`Unhandled unist node type '${node.type}': ${node}`);
            }
        }
        return stack;
    };

    return {
        richText: walk(tokens)
    };
}

function formatRequired(f: Field): string
{
    return f.required ? 'Required' : 'Optional';
}

// builds type name including recursively organized `array of ...` 
function formatType(f: Field): string
{
    if (converter.isArray(f.props)) {
        let items: JSONSchema4 = f.props.items!;
        let res: string = f.props.type! as string;
        while(!converter.isLeaf(items)) {
            res += ' of ' + items.type;
            items = items.items as JSONSchema4;
        }
        res += ' of ' + items.type;
        return res;
    }
    // plain type
    else {
        return f.props.type as string;
    }
}

function formatDefault(f: Field): string | number | boolean
{
    return 'default' in f.props ? f.props.default as (string | number | boolean) : '';
}

function addLeafRow(ws: Excel.Worksheet, f: Field, key: string)
{
    const row = ws.addRow({
        key: f.name,
        type: formatType(f), 
        required: formatRequired(f),
        default: formatDefault(f),
        desc: formatDesc(f),
    });

    // named range for references
    // e.g. `depot.id`, `site.time_window.start`, etc.
    row.getCell('key').name = key + '.' + f.name;
    row.font = LEAF_STYLE.font!;
    row.alignment = LEAF_STYLE.alignment!;

    row.getCell('type').alignment.wrapText = true;
    row.getCell('desc').alignment = DESC_STYLE.alignment!;
    row.getCell('default').font = LEAF_STYLE_DEFAULT_COL_FONT;
}

function addNonLeafRow(ws: Excel.Worksheet, f: Field, key: string)
{
    const row = ws.addRow({
        key_group: f.name,
        required: formatRequired(f),
        type: f.isChoice ? 'Choice' : f.isList ? 'List' : '',
        desc: formatDesc(f),
    });
    
    row.font = NON_LEAF_STYLE.font!;
    row.alignment = NON_LEAF_STYLE.alignment!;

    row.getCell('desc').alignment = DESC_STYLE.alignment!;
    setRowGrayFill(ws, row);

    if (f.isChoice) {
        row.getCell('type').note = 
            'Only one of possible options can be specified in the Excel sheet.';
        for (const choice of f.choice!) {
            addLeafRow(ws, choice, key);
        }
    }
    else if (f.isList) {
        row.getCell('type').note = 
            'List of values, represented as subtable with records in separate rows.';
    }
    return row;
}

// Generates Excel sheet with columns documentation
// from provided flattened JSON schema.
//
export function addDocumentationSheet(
    wb: Excel.Workbook,
    schema: Field[],
    sheetName: string,
    key: string)
{
    const ws = wb.addWorksheet(sheetName);
    ws.views = [
        {state: 'frozen', ySplit: 1, activeCell: 'A1'}
    ];

    ws.columns = [
        {header: 'Group', key: 'key_group', width: 15, style: HEADER_STYLE},
        {header: 'Column name', key: 'key', width: 50, style: HEADER_STYLE},
        {header: 'Type', key: 'type', width: 10, style: HEADER_STYLE},
        {header: 'Required', key: 'required', width: 12, style: HEADER_STYLE},
        {header: 'Default', key: 'default', width: 10, style: HEADER_STYLE},
        {header: 'Description', key: 'desc', width: 64, style: HEADER_STYLE},
    ];

    schema.forEach((f: Field) => {
        f.leaf
            ? addLeafRow(ws, f, key)
            : addNonLeafRow(ws, f, key);
    })

    // fix column headers height
    ws.getRow(1).height = HEADER_HEIGHT;

    // add named ranges for formulas
    ws.workbook.definedNames.add("'" + sheetName + "'!$B$2:$B$" + ws.rowCount, key + '_cols_names')
    ws.workbook.definedNames.add("'" + sheetName + "'!$C$2:$C$" + ws.rowCount, key + '_cols_types')
    ws.workbook.definedNames.add("'" + sheetName + "'!$D$2:$D$" + ws.rowCount, key + '_cols_required')
    ws.workbook.definedNames.add("'" + sheetName + "'!$E$2:$E$" + ws.rowCount, key + '_cols_default')
}

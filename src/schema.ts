import { JSONSchema4 } from 'json-schema';

// Flattened fields
export interface Field
{
    // field name in dot notation
    name: string,

    // field schema properties
    props: JSONSchema4,

    // field must be specified
    required: boolean,

    // field is leaf (can be used as a column name)
    leaf: boolean,
    
    // reference to multiple choices
    isChoice?: boolean,
    choice?: Field[],

    // list of rows (dictionary or array)
    isList?: boolean,

    // Field is an entry id (in case of dictionary) 
    isListId?: boolean
}

export interface ExcelSheetSchema
{
    sheetName: string,
    fields: Field[],
    rootSchema: JSONSchema4
}

export enum Keys
{
    depots = 'depots',
    sites = 'sites',
    fleet = 'fleet',
    constraints = 'constraints',
    options = 'options'
};

type PartialRecord<K extends keyof any, T> = {
    [P in K]?: T;
};

export type PartialExcelSchema = PartialRecord<Keys, ExcelSheetSchema>;

export type ExcelSchema = Record<Keys, ExcelSheetSchema>;


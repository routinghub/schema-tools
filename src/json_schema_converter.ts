import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { Field } from './schema';

export type PatchSchemaCallback = (fqName: string, def: Field) => Field;

export const DEFAULT_PATCH_CALLBACK = 
    (fqName: string, def: Field): Field => { return def };


// Converts json schema ref with additional description
// back to concrete type (allOf[0] along with replaced 
// description from type instance).
//
// Note, that `allOf[0] + description` is a common way
// to describe commented $ref entries in the solver JSON schema.
//
function flattenAllOf(props: JSONSchema4 | JSONSchema4[] | undefined): JSONSchema4
{
    if (Array.isArray(props)) {
        throw Error('Array allOf is not supported');
    }
    if (props === undefined) {
        throw Error('Undefined allOf is invalid');
    }

    if ('allOf' in props)
    {
        // deep copy replaced description
        let altDescription = 'description' in props
            ? {'description': props.description}
            : {};

        return Object.assign({}, props.allOf![0], altDescription);
    }
    return props;
}

// @returns true if definition is an array or an object 
//
export function isLeaf(def: JSONSchema4): boolean
{
    return !isArray(def) && !isObject(def) && !isOneOf(def);
}

// @returns true if definition is an array
//
export function isArray(def: JSONSchema4): boolean
{
    return def.type == 'array';
}

// @returns true if definition is an object 
//
export function isObject(def: JSONSchema4): boolean
{
    return def.type == 'object';
}

// @returns true if definition is a id-based dictionary
//
export function isDict(def: JSONSchema4): boolean
{
    return 'additionalProperties' in def
        && typeof def.additionalProperties !== 'boolean';
}

// @returns true if definition is a choice between multiple types
//
export function isOneOf(def: JSONSchema4): boolean
{
    return 'oneOf' in def;
}

// Sorts properties of provided `type: object` schema such
// that leaf properties comes first, non-leaf second, and
// alphabetical within each group.
//
function sortedPropertiesKeys(cur: any): string[]
{
    if ('properties' in cur) {
        const flatProps = flattenAllOf(cur.properties);
        let nonNestedDefs = Object
            .keys(flatProps)
            .filter((def) => {
                const flat = flattenAllOf(cur.properties[def]);
                return isLeaf(flat) || isArray(flat);
            })
            .sort();

        let nestedDefs = Object
            .keys(flatProps)
            .filter((def) => { 
                let flat = flattenAllOf(cur.properties[def]);
                return !(isLeaf(flat) || isArray(flat));
            })
            .sort();
        return nonNestedDefs.concat(nestedDefs);
    }
    return [];
}

function isEmpty(value: any): boolean
{
    return value == null || (value.constructor === Object && Object.keys(value).length == 0);
}

interface RecurseFlattenSchemaArgs
{
    cur: JSONSchema4,
    base: string,
    fqBase: string,
    required: boolean,
    result: Field[],
    patch: PatchSchemaCallback
}

// Recursively walks schema and converts to flattened representation
//
function recurseFlattenSchema(args: RecurseFlattenSchemaArgs)
{
    if (isLeaf(args.cur)) {
        // Non-object and non-array, POD type
        args.result.push(args.patch(args.fqBase, { 
            name: args.base,
            props: args.cur,
            required: args.required,
            leaf: true
        }));
    }
    else {
        if (isDict(args.cur)) {
            // Handle `additionalProperties`-based dictionaries
            args.result.push(args.patch(args.fqBase, { 
                name: args.base ? args.base + '.id' : 'id',
                props: {'type': 'string', 'description': 'Unique identifier'},
                required: true,
                leaf: true,
                isListId: true
            }));

            recurseFlattenSchema({
                cur: flattenAllOf(args.cur.additionalProperties as JSONSchema4),
                base: args.base,
                fqBase: args.fqBase + '{}',
                required: false,
                result: args.result,
                patch: args.patch
            });
        }
        else {
            // Handle regular object
            sortedPropertiesKeys(args.cur).forEach((prop) => {
                const required: boolean = 'required' in args.cur
                                            && (args.cur.required! as string[])
                                                .includes(prop);
                const propName = args.base ? args.base + "." + prop : prop;
                const propFqName = args.fqBase ? args.fqBase + "." + prop : prop;
                const def = flattenAllOf(args.cur.properties![prop]);

                if (isOneOf(def)) {
                    // Map oneOf invariants to Field::choose
                    let choice: Field[] = [];
                    def.oneOf!.forEach((oneof: any) => {
                        recurseFlattenSchema({
                            cur: flattenAllOf(oneof), 
                            base: propName, 
                            fqBase: propFqName,
                            required: false,
                            result: choice, 
                            patch: args.patch
                        });
                    });
                    
                    args.result.push(args.patch(propFqName, { 
                        name: propName,
                        props: def,
                        required: required,
                        leaf: false,
                        choice: choice,
                        isChoice: true
                    }));
                }
                else {
                    if (!isArray(def)) {
                        // a. Object
                        // a.1. add non-leaf field to flattened output before recursing into fields;
                        if (!isLeaf(def)) {
                            args.result.push(args.patch(propFqName, { 
                                name: propName,
                                props: def,
                                required: required,
                                leaf: false,
                                isList: isDict(def)
                            }));
                        }
                        // a.2. recursively add fields;
                        recurseFlattenSchema({
                            cur: def, 
                            base: propName,
                            fqBase: propFqName,
                            required: required,
                            result: args.result, 
                            patch: args.patch
                        });
                    }
                    else {
                        // b. Array
                        let itemsDef = flattenAllOf(def.items);
                        if (isLeaf(itemsDef) || isArray(itemsDef)) {
                            // b.1 Array of POD values, represented as a comma or
                            //     space-separated list in one cell
                            args.result.push(args.patch(propFqName, {
                                name: propName,
                                props: def,
                                required: required,
                                leaf: true
                            }));
                        }
                        else {
                            const arrPropFqName = propFqName + '[]';

                            // b.2 Array of object values, represented as several rows of cells
                            //     with comma or space-separated lists in each cell
                            args.result.push(args.patch(arrPropFqName, { 
                                name: propName,
                                props: def,
                                required: required,
                                leaf: false,
                                isList: true,
                            }));

                            // b.3. recursively add fields for items
                            recurseFlattenSchema({
                                cur: def, 
                                base: propName,
                                fqBase: arrPropFqName,
                                required: required,
                                result: args.result,
                                patch: args.patch
                            });
                        }
                    }
                }
            });
        }
    }
}

// Recursively walks schema and converts to flattened representation
//
export function flattenSchema(
    data: JSONSchema4,
    fqBaseOpt?: string,
    patchOpt?: PatchSchemaCallback): Field[]
{
    let result: Field[] = [];

    recurseFlattenSchema({
        cur: flattenAllOf(data), 
        base: '',
        fqBase: fqBaseOpt || '', 
        required: true, 
        result: result, 
        patch: patchOpt || DEFAULT_PATCH_CALLBACK
    });
    return result;
}

interface TypeSchemaFieldData
{
    type: string;
    items?: TypeSchema;
    required: boolean;
    description?: string;
    default?: string | number | boolean;
    enum?: string[];
}

class TypeSchemaField implements TypeSchemaFieldData
{
    type: string;
    items?: TypeSchema;
    required: boolean;
    description?: string;
    default?: string | number | boolean;
    enum?: string[];

    constructor(options: TypeSchemaFieldData) {
        this.type = options.type;
        this.items = options.items;
        this.required = options.required;
        this.description = options.description;
        this.default = options.default;
        this.enum = options.enum;
    }
};

type TypeSchemaCallback = (schema: JSONSchema4, required: boolean) => TypeSchemaField;
type TypeSchemaObject =  {[name: string]: TypeSchema};
type TypeSchema = TypeSchemaField | TypeSchemaField[] | TypeSchemaObject;

function recurseMakeTypeSchema(
    schema: JSONSchema4, action: TypeSchemaCallback, required: boolean): TypeSchema
{
    if (isLeaf(schema)) {
        return action(schema, required);
    }
    else {
        if (isDict(schema)) {
            return new TypeSchemaField({
                type: 'dictionary',
                items: recurseMakeTypeSchema(
                    flattenAllOf(schema.additionalProperties as JSONSchema4),
                    action,
                    required
                ),
                required: required
            });
        }
        else if (isArray(schema)) {
            return new TypeSchemaField({
                type: 'array', 
                items: recurseMakeTypeSchema(
                    flattenAllOf(schema.items as JSONSchema4),
                    action,
                    required
                ),
                required: required
            });
        }
        else if (isOneOf(schema)) {
            let result: any[] = [];
            schema.oneOf!.forEach((oneof: any) => {
                const value = recurseMakeTypeSchema(flattenAllOf(oneof), action, true);
                if (!isEmpty(value)) {
                    result.push(value);
                }
            });
            return result;
        }
        else {
            
            let result: TypeSchemaObject = {};
            const isRequired = (name: string, schema: JSONSchema4): boolean => {
                return schema.required !== false
                    && Array.isArray(schema.required)
                    && schema.required.includes(name);
            };

            // Handle regular object
            sortedPropertiesKeys(schema).forEach((prop) => {
                const def: JSONSchema4 = flattenAllOf(schema.properties![prop]);
                const required = isRequired(prop, schema);

                if (isOneOf(def)) {
                    result[prop] = recurseMakeTypeSchema(def, action, required);
                }
                else if (!isArray(def)) {
                    // a. Object
                    result[prop] = recurseMakeTypeSchema(def, action, required);
                }
                else {
                    // b. Array
                    let itemsDef = flattenAllOf(def.items);
                    result[prop] = new TypeSchemaField({
                        type: 'array',
                        items: recurseMakeTypeSchema(itemsDef, action, required),
                        required: required
                    });
                }
            });

            return result;
        }
    }
}


export function makeTypeSchema(data: {[name: string]: JSONSchema4})
{
    const stripPrefix = (str: string | undefined | JSONSchema4TypeName[], prefix: string): string => {
        if (typeof(str) !== 'string') {
            throw new Error('Invalid type name');
        }
        let hasPrefix = str.indexOf(prefix) === 0;
        return hasPrefix ? str.substr(prefix.length + 1) : str;
    }

    const action = (schema: JSONSchema4, required: boolean): TypeSchemaField => {
        let type: string = stripPrefix(
            ('$ref' in schema) ? schema.$ref : schema.type,
            '#/components/schemas'
        );

        return new TypeSchemaField({
            type: (schema.enum ? 'enum' : type), 
            description: schema.description,
            required: required,
            default: schema.default as any,
            enum: schema.enum as string[]
        });
    };

    let result: {[name: string]: TypeSchema} = {};

    Object.keys(data).forEach(typeName => {
        result[typeName] = recurseMakeTypeSchema(
            flattenAllOf(data[typeName]),
            action,
            true
        );
    });
    return result;
}

const isUnionType = (schema: TypeSchema): schema is TypeSchemaField[] =>
{
    return Array.isArray(schema);
};

const isTypeField = (schema: TypeSchema): schema is TypeSchemaField =>
{
    return schema instanceof TypeSchemaField
};

const isObjectType = (schema: TypeSchema): schema is TypeSchemaObject =>
{
    return !isUnionType(schema) && !isTypeField(schema);
}

const commentDescription = (schema: TypeSchema, indent: string): string =>
{
    if (isTypeField(schema) && schema.description) {
        const comment = schema.description.replace(
                            /(\r\n|\n|\r)/gm, '\n' + indent + '// ');
        return indent + '// ' + comment + '\n';
    }
    return '';
}

export enum CodeGenerationMode
{
    // Type definition
    Definition,

    // Nullable type definitinon:
    // - removes optional modifier from fields;
    // - adds ` | null` modifier to all nullable 
    //   fields which doesn't have default values
    DefaultDefinition,

    // Nullable type object
    DefaultValue,
}

export function typeSchemaToTypeScript(
    schema: TypeSchemaObject,
    mode: CodeGenerationMode,
    comments?: boolean): string
{
    interface Args {
        schema: TypeSchema;
        isField?: boolean;
        isArray?: boolean;
        level?: number;
        mode: CodeGenerationMode;
        comments: boolean;
    }

    const toString = (args: Args): string =>
    {
        args.level = args.level || 0;
        const indent = (diff?: number) => { 
            return '    '.repeat(diff ? Math.max(0, args.level! + diff) : args.level!);
        };

        let result: string = '';

        if (isUnionType(args.schema)) {
            if (args.mode != CodeGenerationMode.DefaultValue) {
                result += args.isField ? ': ' : '';
                result += args.schema.map(v => {
                    return toString({...args, isField: false, schema: v});
                }).join(' | ');
            } else {
                result += args.isField ? ': ' : '';
                result += 'null'; 
            }
            if (args.mode == CodeGenerationMode.DefaultDefinition) {
                result += ' | null';
            }
        }
        else if (isTypeField(args.schema)) {
            switch(args.mode) {
                case CodeGenerationMode.Definition:
                    result += args.isField ? (args.schema.required ? ': ' : '?: ') : '';
                    break;
                case CodeGenerationMode.DefaultValue:
                case CodeGenerationMode.DefaultDefinition:
                    result += args.isField ? ': ' : '';
                    break;
            }
            let type = args.schema.type;
            if (CodeGenerationMode.DefaultValue != args.mode) {
                switch(type) {
                    case 'array': {
                        const nestedArgs = {
                            ...args,
                            schema: args.schema.items!,
                            isArray: true,
                            isField: false
                        };
                        type = toString(nestedArgs);
                        break;
                    }
                    case 'dictionary': {
                        const nestedArgs = {
                            ...args,
                            schema: args.schema.items!,
                            isField: true,
                            isArray: false
                        };
                        type = `{[id: string] ${toString(nestedArgs)}}`;
                        break;
                    }
                    case 'enum': {
                        type = '("' + args.schema.enum!.join('" | "') + '")';
                        break;
                    }
                }
                result += type + (args.isArray ? '[]' : '');
            } else {
                switch(type) {
                    case 'array':
                        result += '[]';
                        break;
                    case 'dictionary':
                        result += '{}';
                        break;
                    default:
                        if (args.schema.default) {
                            if (typeof args.schema.default === 'string') {
                                result += '"' + args.schema.default + '"';
                            } else {
                                result += args.schema.default;
                            }
                        }
                        else {
                            result += 'null';
                        }
                }
            }
        }
        else {
            switch(args.mode) {
                case CodeGenerationMode.Definition:
                    result += args.isField ? (args.schema.required ? ': ' : '?: ') : '';
                    break;
                case CodeGenerationMode.DefaultValue:
                case CodeGenerationMode.DefaultDefinition:
                    result += args.isField ? ': ' : '';
                    break;
            }
            result += '{\n';
            Object.keys(args.schema).forEach((fieldName: string) => {
                const nestedArgs = {
                    ...args,
                    schema: (args.schema as TypeSchemaObject)[fieldName],
                    isField: true,
                    isArray: false,
                    level: args.level! + 1
                };
                if (args.comments) {
                    result += commentDescription(nestedArgs.schema, indent(1));
                }
                result += indent(1) + fieldName + toString(nestedArgs);
                if (CodeGenerationMode.DefaultDefinition == args.mode) {
                    if (isTypeField(nestedArgs.schema) && !nestedArgs.schema.default) {
                        result += ' | null' ;
                    }
                }
                if (CodeGenerationMode.DefaultValue == args.mode) {
                    result += ',\n';
                } else {
                    result += ';\n';
                }
            });
            result += indent() + '}';
            if (CodeGenerationMode.DefaultValue != args.mode) {
                result += (args.isArray ? '[]' : '');
            }
        }
        return result;
    }

    switch(mode) {
        case CodeGenerationMode.DefaultDefinition:
        case CodeGenerationMode.Definition:
            return Object.keys(schema).map(typeName => {
                const typeSchema: TypeSchema = schema[typeName];
                const args = {
                    schema: typeSchema,
                    isField: false,
                    mode: mode,
                    comments: comments || false
                };
                let result = '';
                if (comments) {
                    result += commentDescription(typeSchema, '');
                }
                result +=`export type ${typeName} = ${toString(args)};\n`;
                return result;
            }).join('\n');
        case CodeGenerationMode.DefaultValue:
            return Object.keys(schema).map(typeName => {
                const typeSchema: TypeSchema = schema[typeName];
                const args = {
                    schema: typeSchema,
                    isField: false,
                    mode: mode,
                    comments: comments || false
                };
                return `export const ${typeName}Default: ${typeName} = ${toString(args)};\n`;
            }).join('\n');
    }
}


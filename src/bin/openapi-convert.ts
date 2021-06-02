import * as fs from 'fs';
import * as path from 'path';

import * as Excel from 'exceljs';
import { JSONSchema4 } from 'json-schema';
import $RefParser from "@apidevtools/json-schema-ref-parser";

import * as converter from '../json_schema_converter';
import * as formatter from '../excel_formatter';
import { Field, Keys, PartialExcelSchema } from '../schema';

const MINUTES = 60;
const HOURS = 60 * MINUTES;

interface ExampleData
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

interface PartialOpenAPISchema
{
    components: {
        schemas: {
            [name: string]: JSONSchema4
        }
    }
}

type RandomGenerator = () => number;

function mulberry32(seed: number): RandomGenerator
{
    return function() {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function choice(arr: any[], gen: RandomGenerator): any
{
    return arr[Math.floor(gen() * arr.length)]
}

function validateExampleData(ex: ExampleData, schema: Field[]): ExampleData
{
    let schemaFields = new Set<string>();
    schema.forEach(field => {
        schemaFields.add(field.name);
    })

    // quick validation
    ex.hints.forEach(field => {
        if (!schemaFields.has(field)) {
            throw new Error('Invalid field `' + field + '` in example data: not found in schema');
        }
    });

    if (ex.hints.length != ex.headers.length) {
        throw new Error('Invalid example data: hints and headers have different number of columns');
    }

    ex.data.forEach((row, index) => {
        if (row.length != ex.headers.length) {
            throw new Error('Invalid example data: row `' + index + '` has invalid number of columns');
        }
    });

    return ex;
}

function getDepotExampleData(schema: Field[]): ExampleData
{
    let fields = new Set<string>();
    schema.forEach(field => {
        fields.add(field.name);
    })

    const headers: string[] = [
        'Depot id',
        ...formatter.colspan('Depot location, Lat/Lng', 2), 
        ...formatter.colspan('Time window', 3),
        'Loading time'
    ];

    const hints: string[] = [
        'id',
        ...['location.lat', 'location.lng'],
        ...['time_window.start', 'time_window.end', 'time_window.strict'],
        'duration'
    ];

    const data: any[] = [
        [
            'Depot Berlin-1',
            ...[52.524373, 13.141106],
            ...['08:00', '18:00', true],
            0
        ],[
            'Depot Berlin-2',
            ...[52.500484, 13.656563],
            ...['08:00', '18:00', true],
            0
        ]
    ];

    return {
        schema: schema,
        headers: headers,
        hints: hints,
        data: data
    };
}

function getFleetExampleData(schema: Field[]): ExampleData
{
    const headers: string[] = [
        'Vehicle id',
        'Depot id',
        'Capacity, kg',
        'Shift id',
        ...formatter.colspan('Shift time windows', 3),
        'Shift duration limit',
        'Cost per event',
        'Cost per hour',
        'Cost per km'
    ];

    const hints: string[] = [
        'id',
        'depot_id',
        'capacity.weight',
        'shifts.id',
        ...['shifts.time_window.start', 'shifts.time_window.end', 'shifts.time_window.strict'],
        'shifts.duration_limit',
        'costs.per_event',
        'costs.per_hour',
        'costs.per_km'
    ];

    const list_row = (col: string, columns: string[], insert: any[]): any[] => {
        return [
            ...Array(columns.indexOf(col)).fill(null),
            ...insert,
            ...Array(columns.length - insert.length - columns.indexOf(col)).fill(null)
        ]
    };

    const CAPACITY = 30;
    const COST_PER_EVENT = 100;
    const COST_PER_HOUR = 10;
    const COST_PER_KM = 15;

    const data: any[] = [
        [
            'Vehicle-1',
            'Depot Berlin-1',
            CAPACITY,
            'Shift-1',
            ...['08:00', '14:00', true],
            5 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-1',
            'Depot Berlin-1',
            CAPACITY,
            'Shift-2',
            ...['14:00', '20:00', true],
            5 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-2',
            'Depot Berlin-1',
            CAPACITY,
            'Shift-1',
            ...['08:00', '14:00', true],
            5 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-2',
            'Depot Berlin-1',
            CAPACITY,
            'Shift-2',
            ...['14:00', '20:00', true],
            5 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-3',
            'Depot Berlin-2',
            CAPACITY,
            'Shift-1',
            ...['08:00', '14:00', true],
            5 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-4',
            'Depot Berlin-2',
            CAPACITY,
            'Shift-1',
            ...['08:00', '20:00', true],
            8 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-5',
            'Depot Berlin-2',
            CAPACITY,
            'Shift-1',
            ...['08:00', '20:00', true],
            8 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ], [
            'Vehicle-6',
            'Depot Berlin-2',
            CAPACITY,
            'Shift-1',
            ...['08:00', '20:00', true],
            8 * HOURS,
            ...[COST_PER_EVENT, COST_PER_HOUR, COST_PER_KM]
        ],
    ];

    return {
        schema: schema,
        headers: headers,
        hints: hints,
        data: data
    };
}

function getOptionsExampleData(schema: Field[]): ExampleData
{
    const headers = [
        'Planning date',
        'Time zone offset',
        'Planning quality',
        'Transit matrix'
    ];

    const hints = [
        'date',
        'timezone',
        'quality',
        'matrix'
    ];

    const data = [
        [
            '2020-09-01',
            'Europe/Berlin',
            'normal',
            'osm'
        ]
    ];

    return {
        schema: schema,
        headers: headers,
        hints: hints,
        data: data
    };
}

function getConstraintsExampleData(schema: Field[]): ExampleData
{
    const headers = [
        'Mixed load restrictions',
        ...formatter.colspan('Balanced shifts', 2),
        ...formatter.colspan('Same route sites', 2),
    ];

    const hints = [
        'load_category_restrictions',
        'balanced_shifts.id', 'balanced_shifts.failure_costs.per_hour',
        'same_route_sites.id', 'same_route_sites.failure_costs.per_site'
    ];

    const data: any[] = [];

    return {
        schema: schema,
        headers: headers,
        hints: hints,
        data: data
    };
}

function getSitesExampleData(schema: Field[]): ExampleData
{
    const headers: string[] = [
        'Site id',
        ...formatter.colspan('Site location, Lat/Lng', 2), 
        ...formatter.colspan('Time window', 3),
        ...['Job duration', 'Job type', 'Load weight, kg'],
        'Unperformed cost',
    ];

    const hints: string[] = [
        'id',
        ...['location.lat', 'location.lng'],
        ...['time_window.start', 'time_window.end', 'time_window.strict'],
        ...['duration', 'job', 'load.weight'],
        'unperformed_cost'
    ];

    const COORDS = [
        [52.4326111, 13.3000801], [52.5212442, 13.409629], [52.5062211, 13.294257], [52.4846191, 13.6281143], 
        [52.5179061, 13.3878263], [52.4111088, 13.3777211], [52.5124786, 13.4571679], [52.523965, 13.3974459], 
        [52.4505702, 13.3215021], [52.430056, 13.4780274], [52.5395739, 13.406498], [52.5398383, 13.4068458],
        [52.4941864, 13.331275], [52.4939677, 13.3539664], [52.529452, 13.400719], [52.4574255, 13.533528], 
        [52.5418077, 13.3479185], [52.4348924, 13.3786126], [52.4955155, 13.3428785], [52.4940664, 13.3965214], 
        [52.4086369, 13.5824034], [52.522074, 13.3361319], [52.5481127, 13.4130983], [52.5271371, 13.385754], 
        [52.4410887, 13.2438526], [52.5216052, 13.1651872], [52.5272355, 13.3886032], [52.5698918, 13.495771], 
        [52.5283329, 13.3939457], [52.5125016, 13.3943233], [52.5047517, 13.468703], [52.5244858, 13.3301178], 
        [52.5518746, 13.3554694], [52.4565312, 13.5105881], [52.4977937, 13.3246353], [52.5475361, 13.3689039], 
        [52.4555158, 13.5771852], [52.5280441, 13.3289036], [52.496232, 13.295239], [52.5450321, 13.5499115], 
        [52.5226824, 13.3490454], [52.4235698, 13.3181763], [52.4930783, 13.3473845], [52.5075921, 13.3199919], 
        [52.4287929, 13.3278647], [52.4914931, 13.4136359], [52.4620066, 13.3187993], [52.5121223, 13.37829], 
        [52.5273922, 13.4024727], [52.5077516, 13.4206012]
    ];
    const TIME_WINDOWS = [
        ['09:00', '11:00', true],
        ['10:00', '12:00', true],
        ['10:00', '12:00', true],
        ['10:00', '12:00', true],
        ['11:00', '13:00', true],
        ['12:00', '14:00', true],
        ['17:00', '19:00', true],
        ['17:00', '19:00', true],
        ['17:00', '19:00', true],
        ['18:00', '21:00', true],
    ];
    const LOADS = [
        1, 1, 1, 1, 3, 3, 5, 10
    ];
    const JOB = [
        'delivery',
        'delivery',
        'delivery',
        'pickup'
    ];

    const UNPERFORMED_COST = 10000;
    const randGen = mulberry32(0);

    let data: any[] = [];
    for(let i = 0; i < COORDS.length; ++i) {
        const load = choice(LOADS, randGen);
        const time_window = choice(TIME_WINDOWS, randGen);
        const duration = Math.max(5, Math.floor(load * 2.5));
        const job = choice(JOB, randGen);

        data.push([
            `ORDER_${i}`,
            ...COORDS[i],
            ...time_window,
            ...[duration * MINUTES, job, load],
            UNPERFORMED_COST
        ]);
    }

    return {
        schema: schema,
        headers: headers,
        hints: hints,
        data: data
    };
}


// Patch time window fields documnetation
const patch: converter.PatchSchemaCallback = (fqName: string, def: Field): Field =>
{    
    if (fqName.endsWith('time_window.start') || fqName.endsWith('time_window.end')) {
        def.props.description = [
            'Time window ' +
                (fqName.endsWith('time_window.start') ? 'start' : 'end') +
                ' in 24-hour ISO 8601 time format (`hh`, `hh:mm`, `hh:mm:ss`).', 
            '',
            'All times must be specified in the same time zone. To specify time window on the next day ' +
                'after the planning date, use `1+` prefix.',
            '',
            'Examples:',
            '`10:30:00`',
            '`10:30`',
            '`10`',
            '`1+10:30` (10:30 on the next day following the planning date)'
        ].join('\n');
    }
    return def;
};

const OPTIONS_SCHEMA: JSONSchema4 = {
    type: 'object',
    properties: {
        'date': {
            type: 'string',
            description:
                'Route planning date in ISO 8601 format ' + 
                '(`yyyy-MM-dd`), will be appended to all time windows.\n' + 
                '\n' +
                'Example:\n' + 
                '`2020-09-01`'
        },
        'timezone': {
            type: 'string',
            default: 'UTC',
            description:
                'Time zone of all time windows in IANA format.\n' + 
                '\n' +
                'Examples:\n' + 
                '`UTC`\n' +
                '`UTC+5`\n' +
                '`Europe/Berlin`\n' +
                '`Asia/Dubai`\n' + 
                '`America/Los_Angeles`'
        },
        'quality': {
            type: 'string',
            default: 'normal',
            description:
                'Route planning quality, can take one of the following values:\n' + 
                '\n' +
                '- `low` - low-quality and quick optimization mode, recommended to validate data integrity;\n' +
                '- `normal` - (default) regular quality of optimization;\n' +
                '- `high` - high quality of optimization (incurs additional cost and waiting time);\n'
        },
        'matrix': {
            type: 'string',
            default: 'osm',
            description:
                'Transit distance and duration, can take one of the following values:\n' + 
                '\n' +
                '`here` - use HERE Large Matrix API (must be enabled for user account);\n' +
                '`osm` - (default) use OpenStreetMap and Open Source Routing Machine;'
        }
    },
    additionalProperties: false,
    required: [
        'date',
    ]
};

function requestToExcel(outFileName: string)
{

    function getDepotExampleData1(schema: Field[]): ExampleData
    {
        let fields = new Set<string>();
        schema.forEach(field => {
            fields.add(field.name);
        })
    
        const headers: string[] = [
            'Depot id',
            ...formatter.colspan('Depot location, Lat/Lng', 2), 
            ...formatter.colspan('Time window', 3),
            'Loading time'
        ];
    
        const hints: string[] = [
            'id',
            ...['location.lat', 'location.lng'],
            ...['time_window.start', 'time_window.end', 'time_window.strict'],
            'duration'
        ];
    
        const data: any[] = [
            [
                'main',
                ...[25.0125159, 55.0601881],
                ...['00:00', '1+12:00', false],
                0
            ]
        ];
    
        return {
            schema: schema,
            headers: headers,
            hints: hints,
            data: data
        };
    }
    
    function getFleetExampleData1(schema: Field[]): ExampleData
    {
        const headers: string[] = [
            'Vehicle id',
            'Depot id',
            'Depot roundtrip',
            'Capacity, cbm',
            'Capabilities',
            'Shift id',
            ...formatter.colspan('Shift time windows', 3),
            'Shift late operations costs, per event',
            'Shift late operations costs, per late minute',
            'Shift duration limit',
            'Cost per event',
            'Cost per hour',
            'Cost per km'
        ];
    
        const hints: string[] = [
            'id',
            'depot_id',
            'roundtrip',
            'capacity.volume',
            'capabilities',
            'shifts.id',
            'shifts.time_window.start',
            'shifts.time_window.end',
            'shifts.time_window.strict',
            'shifts.late_operations_costs.per_event',
            'shifts.late_operations_costs.per_late_minute',
            'shifts.duration_limit',
            'costs.per_event',
            'costs.per_hour',
            'costs.per_km'
        ];
    
        const list_row = (col: string, columns: string[], insert: any[]): any[] => {
            return [
                ...Array(columns.indexOf(col)).fill(null),
                ...insert,
                ...Array(columns.length - insert.length - columns.indexOf(col)).fill(null)
            ]
        };
    
        const sourceData: any[] = [
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2602,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2603,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2604,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2605,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2608,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2609,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2610,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 2400,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2611,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4300,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2622,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2623,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4300,
                "capabilities": "Petrol",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2625,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "B5",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2613,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "B5",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2614,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "B5",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2616,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4300,
                "capabilities": "B5",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2624,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "B5",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2607,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "B5",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2631,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4300,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2626,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4300,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2627,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2612,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2615,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2617,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2618,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2619,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2620,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2621,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2632,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2633,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 4800,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2630,
                "depot_id": "main",
                "shifts.id": "12-hour"
            },
            {
                "roundtrip": true,
                "capacity.volume": 22530,
                "capabilities": "Diesel",
                "costs.per_event": 5000,
                "costs.per_km": 75,
                "costs.per_hour": 50,
                "shifts.time_window.start": "00:00:00",
                "shifts.time_window.end": "12:00:00",
                "shifts.time_window.strict": false,
                "shifts.late_operations_costs.per_event": 1000,
                "shifts.late_operations_costs.per_late_minute": 50,
                "shifts.duration_limit": 43200,
                "id": 2628,
                "depot_id": "main",
                "shifts.id": "12-hour"
            }
        ];

    
        const data: any[] = [];
        for(let sourceRec of sourceData) {
            let row: any = [];
            for (let hint of hints) {
                row.push(sourceRec[hint]);
            }
            data.push(row);
        }

        return {
            schema: schema,
            headers: headers,
            hints: hints,
            data: data
        };
    }
    
    function getOptionsExampleData1(schema: Field[]): ExampleData
    {
        const headers = [
            'Planning date',
            'Time zone offset',
            'Planning quality',
            'Transit matrix'
        ];
    
        const hints = [
            'date',
            'timezone',
            'quality',
            'matrix'
        ];
    
        const data = [
            [
                '2020-12-01',
                'Asia/Dubai',
                'normal',
                'osm'
            ]
        ];
    
        return {
            schema: schema,
            headers: headers,
            hints: hints,
            data: data
        };
    }
    
    function getConstraintsExampleData1(schema: Field[]): ExampleData
    {
        const headers = [
            'Mixed load restrictions',
            ...formatter.colspan('Balanced shifts', 2),
            ...formatter.colspan('Same route sites', 2),
        ];
    
        const hints = [
            'load_category_restrictions',
            'balanced_shifts.id', 'balanced_shifts.failure_costs.per_hour',
            'same_route_sites.id', 'same_route_sites.failure_costs.per_site'
        ];
    
        const data: any[] = [];
    
        return {
            schema: schema,
            headers: headers,
            hints: hints,
            data: data
        };
    }
    
    function getSitesExampleData1(schema: Field[]): ExampleData
    {
        const headers: string[] = [
            'Site id',
            ...formatter.colspan('Site location, Lat/Lng', 2), 
            ...formatter.colspan('Time window', 3),
            ...['Job duration', 'Job type', 'Load volume, cbm'],
            'Required capabilities',
            'Unperformed cost',
        ];
    
        const hints: string[] = [
            'id',
            ...['location.lat', 'location.lng'],
            ...['time_window.start', 'time_window.end', 'time_window.strict'],
            ...['duration', 'job', 'load.volume'],
            'required_capabilities',
            'unperformed_cost'
        ];
    
        const sourceData: any[] = [
            {
                "location.lat": 25.1350275007915,
                "location.lng": 55.2454750363071,
                "load.volume": 950,
                "required_capabilities": "B5",
                "duration": 5400,
                "time_window.start": "03:15:00",
                "time_window.end": "03:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AQ--AQ--B5",
                "job": "delivery"
            },
            {
                "location.lat": 25.2503816045919,
                "location.lng": 55.3701933805842,
                "load.volume": 1000,
                "required_capabilities": "Diesel",
                "duration": 6300,
                "time_window.start": "17:45:00",
                "time_window.end": "18:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "TG--Dafza_--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.2503816045919,
                "location.lng": 55.3701933805842,
                "load.volume": 1000,
                "required_capabilities": "Petrol",
                "duration": 6300,
                "time_window.start": "17:45:00",
                "time_window.end": "18:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "TG--Dafza_--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 24.720664,
                "location.lng": 54.729686,
                "load.volume": 2300,
                "required_capabilities": "Petrol",
                "duration": 19800,
                "time_window.start": "02:45:00",
                "time_window.end": "03:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "N--AUH-A2--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.2361102857202,
                "location.lng": 55.3575821895175,
                "load.volume": 200,
                "required_capabilities": "Petrol",
                "duration": 3600,
                "time_window.start": "02:30:00",
                "time_window.end": "03:00:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "A--EM--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.2258076768349,
                "location.lng": 55.3717853313562,
                "load.volume": 600,
                "required_capabilities": "Petrol",
                "duration": 14400,
                "time_window.start": "04:15:00",
                "time_window.end": "04:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "A--UMM--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.2658413879149,
                "location.lng": 55.3627100835672,
                "load.volume": 1200,
                "required_capabilities": "Petrol",
                "duration": 21600,
                "time_window.start": "19:45:00",
                "time_window.end": "20:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "T--T2--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.2658413879149,
                "location.lng": 55.3627100835672,
                "load.volume": 1000,
                "required_capabilities": "Diesel",
                "duration": 21600,
                "time_window.start": "19:45:00",
                "time_window.end": "20:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "T--T2--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.292626,
                "location.lng": 55.444634,
                "load.volume": 4800,
                "required_capabilities": "B5",
                "duration": 28800,
                "time_window.start": "06:45:00",
                "time_window.end": "07:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--Sharjah--B5",
                "job": "delivery"
            },
            {
                "location.lat": 24.853704,
                "location.lng": 55.055929,
                "load.volume": 4800,
                "required_capabilities": "B5",
                "duration": 37800,
                "time_window.start": "04:45:00",
                "time_window.end": "05:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--DIC--B5",
                "job": "delivery"
            },
            {
                "location.lat": 24.210272,
                "location.lng": 55.691894,
                "load.volume": 2500,
                "required_capabilities": "B5",
                "duration": 25200,
                "time_window.start": "08:15:00",
                "time_window.end": "08:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--Al_Ain--B5",
                "job": "delivery"
            },
            {
                "location.lat": 25.1330968425929,
                "location.lng": 55.24608352247,
                "load.volume": 400,
                "required_capabilities": "B5",
                "duration": 3600,
                "time_window.start": "02:15:00",
                "time_window.end": "02:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AW--Al_Quoz--B5",
                "job": "delivery"
            },
            {
                "location.lat": 25.1721317133959,
                "location.lng": 55.2449075379564,
                "load.volume": 3000,
                "required_capabilities": "B5",
                "duration": 25200,
                "time_window.start": "05:45:00",
                "time_window.end": "06:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--Dubai_West--B5",
                "job": "delivery"
            },
            {
                "location.lat": 24.3697663061492,
                "location.lng": 54.5337775259516,
                "load.volume": 600,
                "required_capabilities": "Petrol",
                "duration": 10800,
                "time_window.start": "02:45:00",
                "time_window.end": "03:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "A--Abu_Dhabi--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.3818420303328,
                "location.lng": 55.4889311616844,
                "load.volume": 500,
                "required_capabilities": "Petrol",
                "duration": 5400,
                "time_window.start": "04:15:00",
                "time_window.end": "04:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "A--Ajman--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.4112231910562,
                "location.lng": 55.4462047628823,
                "load.volume": 600,
                "required_capabilities": "Petrol",
                "duration": 7200,
                "time_window.start": "07:45:00",
                "time_window.end": "08:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AJ--Ajman--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.1772573516462,
                "location.lng": 55.3945441482642,
                "load.volume": 300,
                "required_capabilities": "Petrol",
                "duration": 5400,
                "time_window.start": "11:15:00",
                "time_window.end": "11:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MI--Main_site--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 23.657467,
                "location.lng": 53.7373,
                "load.volume": 1400,
                "required_capabilities": "Petrol",
                "duration": 16200,
                "time_window.start": "03:45:00",
                "time_window.end": "04:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "N--AUH-A3--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 24.210272,
                "location.lng": 55.6897053,
                "load.volume": 1500,
                "required_capabilities": "Petrol",
                "duration": 25200,
                "time_window.start": "02:45:00",
                "time_window.end": "03:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "N--ANN-A1--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.856155,
                "location.lng": 56.0148303,
                "load.volume": 2000,
                "required_capabilities": "B5",
                "duration": 19800,
                "time_window.start": "07:45:00",
                "time_window.end": "08:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--Ras_Alkhaimah--B5",
                "job": "delivery"
            },
            {
                "location.lat": 25.1772573516462,
                "location.lng": 55.3945441482642,
                "load.volume": 1300,
                "required_capabilities": "Diesel",
                "duration": 21600,
                "time_window.start": "10:45:00",
                "time_window.end": "11:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MI--Main_site--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.9941015007267,
                "location.lng": 55.1570555470693,
                "load.volume": 1500,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "03:15:00",
                "time_window.end": "03:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AA--Main_Site--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.1250384240153,
                "location.lng": 55.2098760863301,
                "load.volume": 1000,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "04:15:00",
                "time_window.end": "04:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AFS--Main_Site--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.9704073432023,
                "location.lng": 55.4839213216649,
                "load.volume": 1300,
                "required_capabilities": "Diesel",
                "duration": 3600,
                "time_window.start": "01:45:00",
                "time_window.end": "02:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "R--1--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.921528,
                "location.lng": 55.510833,
                "load.volume": 1500,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "03:15:00",
                "time_window.end": "03:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "R--2--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.217306,
                "location.lng": 55.545083,
                "load.volume": 500,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "04:15:00",
                "time_window.end": "04:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "R--3--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.071788,
                "location.lng": 55.609324,
                "load.volume": 500,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "05:15:00",
                "time_window.end": "05:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "R--4--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.89225,
                "location.lng": 55.611139,
                "load.volume": 500,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "06:15:00",
                "time_window.end": "06:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "R--5--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.33336,
                "location.lng": 54.49935,
                "load.volume": 500,
                "required_capabilities": "B5",
                "duration": 1800,
                "time_window.start": "03:15:00",
                "time_window.end": "03:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--Abu_Dhabi_P--B5",
                "job": "delivery"
            },
            {
                "location.lat": 25.3823413,
                "location.lng": 55.4894482,
                "load.volume": 1000,
                "required_capabilities": "Petrol",
                "duration": 19800,
                "time_window.start": "02:45:00",
                "time_window.end": "03:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "N--SHJ-A1_--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 24.375864053023,
                "location.lng": 54.4945018190502,
                "load.volume": 1500,
                "required_capabilities": "B5",
                "duration": 16200,
                "time_window.start": "09:45:00",
                "time_window.end": "10:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "MA--Abu_Dhabi_D--B5",
                "job": "delivery"
            },
            {
                "location.lat": 24.341839,
                "location.lng": 54.500512,
                "load.volume": 3000,
                "required_capabilities": "Petrol",
                "duration": 19800,
                "time_window.start": "02:45:00",
                "time_window.end": "03:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "N--AUH-A4--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.760278,
                "location.lng": 55.965028,
                "load.volume": 1000,
                "required_capabilities": "Petrol",
                "duration": 18000,
                "time_window.start": "02:45:00",
                "time_window.end": "03:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "N--RKT-A1--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.118616,
                "location.lng": 55.216827,
                "load.volume": 300,
                "required_capabilities": "Petrol",
                "duration": 2700,
                "time_window.start": "03:15:00",
                "time_window.end": "03:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AT--AT--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.1196486695522,
                "location.lng": 55.2214712629901,
                "load.volume": 300,
                "required_capabilities": "Petrol",
                "duration": 15300,
                "time_window.start": "04:00:00",
                "time_window.end": "04:30:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "A--Alquse--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.118616,
                "location.lng": 55.216827,
                "load.volume": 300,
                "required_capabilities": "Petrol",
                "duration": 7200,
                "time_window.start": "16:45:00",
                "time_window.end": "17:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AT--Al_qouz_--Special_95",
                "job": "delivery"
            },
            {
                "location.lat": 25.1201071834934,
                "location.lng": 55.2380676855286,
                "load.volume": 700,
                "required_capabilities": "B5",
                "duration": 3600,
                "time_window.start": "16:15:00",
                "time_window.end": "16:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "PPP--Cetral_Warehouse_--B5",
                "job": "delivery"
            },
            {
                "location.lat": 24.4914145900627,
                "location.lng": 54.5942786644758,
                "load.volume": 4800,
                "required_capabilities": "Diesel",
                "duration": 3600,
                "time_window.start": "03:15:00",
                "time_window.end": "03:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "S--WBH--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.414207,
                "location.lng": 54.462538,
                "load.volume": 4500,
                "required_capabilities": "Diesel",
                "duration": 3600,
                "time_window.start": "05:45:00",
                "time_window.end": "06:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "S--Medi--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 24.904805,
                "location.lng": 55.117597,
                "load.volume": 500,
                "required_capabilities": "Diesel",
                "duration": 3600,
                "time_window.start": "02:15:00",
                "time_window.end": "02:45:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "E--Main_Site--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.114346,
                "location.lng": 55.19838,
                "load.volume": 400,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "04:45:00",
                "time_window.end": "05:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "AR--A1247--Diesel",
                "job": "delivery"
            },
            {
                "location.lat": 25.123312,
                "location.lng": 55.346932,
                "load.volume": 700,
                "required_capabilities": "Diesel",
                "duration": 1800,
                "time_window.start": "05:45:00",
                "time_window.end": "06:15:00",
                "time_window.strict": true,
                "unperformed_cost": 100000,
                "id": "HB--P479--Diesel",
                "job": "delivery"
            }
        ];

        const data: any[] = [];
        for(let sourceRec of sourceData) {
            let row: any = [];
            for (let hint of hints) {
                row.push(sourceRec[hint]);
            }
            data.push(row);
        }

        return {
            schema: schema,
            headers: headers,
            hints: hints,
            data: data
        };
    }

    const ROUTING_SCHEMA_PATH = path.resolve(__dirname, '../routing.openapi.json');
    const ROUTING_SCHEMA = JSON.parse(fs.readFileSync(ROUTING_SCHEMA_PATH).toString('utf8'));

    $RefParser.dereference(ROUTING_SCHEMA).then(openapi_schema =>
    {
        // build entities documentation sheets
        const requestSchema = (openapi_schema as PartialOpenAPISchema)
            .components
            .schemas
            .RouteOptimizationRequest;

        let derefTypeSchema = converter.makeTypeSchema(
            (openapi_schema as PartialOpenAPISchema)
                .components
                .schemas
        );

        const requestSchemaProps = requestSchema.properties!;
        
        interface FlatSchema
        {
            data_sheet_name: string,
            key: Keys,
            schema?: Field[],
            root_schema?: JSONSchema4,
            example_data?: ExampleData,
            doc_sheet_name: string
        };

        const schemas: FlatSchema[] = [
            {key: Keys.depots, data_sheet_name: 'Depots', doc_sheet_name: 'Depots legend'},
            {key: Keys.sites, data_sheet_name: 'Sites', doc_sheet_name: 'Sites legend'},
            {key: Keys.fleet, data_sheet_name: 'Fleet', doc_sheet_name: 'Fleet legend'},
            {key: Keys.options, data_sheet_name: 'Options', doc_sheet_name: 'Options legend'},
            {key: Keys.constraints, data_sheet_name: 'Constraints', doc_sheet_name: 'Constraints legend'},
        ];

        schemas.forEach(schema => {
            console.log(`Flattening ${schema.key} schema...`);

            switch(schema.key) {
                case Keys.options:
                    schema.schema = converter.flattenSchema(
                        OPTIONS_SCHEMA,
                        schema.key,
                        patch
                    );
                    schema.root_schema = OPTIONS_SCHEMA;
                    break;
                default:
                    schema.schema = converter.flattenSchema(
                        requestSchemaProps[schema.key],
                        schema.key,
                        patch
                    );
                    schema.root_schema = requestSchemaProps[schema.key];
            }
        });

        let excelSchema: PartialExcelSchema = {};

        schemas.forEach(schema => {
            excelSchema[schema.key] = {
                sheetName: schema.data_sheet_name,
                fields: schema.schema!,
                rootSchema: schema.root_schema!
            }
        });

        // Build and write out Excel templates from flattened schemas
        //
        schemas.forEach(schema => {
            switch(schema.key) {
                case Keys.depots:
                    schema.example_data = getDepotExampleData1(schema.schema!);
                    break;
                case Keys.sites:
                    schema.example_data = getSitesExampleData1(schema.schema!);
                    break;
                case Keys.fleet:
                    schema.example_data = getFleetExampleData1(schema.schema!);
                    break;
                case Keys.options:
                    schema.example_data = getOptionsExampleData1(schema.schema!);
                    break;
                case Keys.constraints:
                    schema.example_data = getConstraintsExampleData1(schema.schema!);
                    break;
            }
        });

        const wb = new Excel.Workbook();

        // recalculate all formulas on load
        wb.calcProperties.fullCalcOnLoad = true;

        // add data sheets
        schemas.forEach(schema => {
            if (schema.example_data) {
                console.log(`Adding '${schema.data_sheet_name}' example data sheet...`);
                validateExampleData(schema.example_data, schema.schema!);
                formatter.addDataSheet(wb, schema.example_data, schema.data_sheet_name, schema.key);
            }
        });

        // add doc sheets
        schemas.forEach(schema => {
            console.log(`Adding '${schema.doc_sheet_name}' documentation sheet...`);
            formatter.addDocumentationSheet(wb, schema.schema!, schema.doc_sheet_name, schema.key);
        })

        wb.xlsx.writeFile(outFileName, {
            useStyles: true,
            useSharedStrings: true
        });
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

function main()
{
    const OUT_FLATTENED_DOC_PATH = path.resolve(__dirname, '../../routing.flattened.xlsx');
    const OUT_ROUTING_FLATTENED_SCHEMA_PATH = path.resolve(__dirname, '../routing.flattened.json');

    // reference schema can be generated as:
    // $ yarn --silent dtsgen src/schemas/routing.openapi.json 
    //      | sed 's/declare namespace/namespace/g; s/namespace/export namespace/g'
    //      > src/schemas/routing.schema.ts
    //
    const OUT_ROUTING_SCHEMA_PATH = path.resolve(__dirname, '../routing.schema.ts');
    const OUT_ROUTING_DEFAULTS_PATH = path.resolve(__dirname, '../routing.defaults.ts');
    
    const ROUTING_SCHEMA_PATH = path.resolve(__dirname, '../routing.openapi.json');
    const ROUTING_SCHEMA = JSON.parse(fs.readFileSync(ROUTING_SCHEMA_PATH).toString('utf8'));

    const refTypeSchema = converter.makeTypeSchema(
        (ROUTING_SCHEMA as PartialOpenAPISchema).components.schemas
    );

    console.log(`Writing TS schema to ${OUT_ROUTING_SCHEMA_PATH}...`);
    fs.writeFileSync(
        OUT_ROUTING_SCHEMA_PATH,
        converter.typeSchemaToTypeScript(
            refTypeSchema,
            converter.CodeGenerationMode.Definition,
            true
        )
    );

    console.log(`Writing TS defaults schema to ${OUT_ROUTING_DEFAULTS_PATH}...`);
    fs.writeFileSync(
        OUT_ROUTING_DEFAULTS_PATH,
        converter.typeSchemaToTypeScript(
            refTypeSchema,
            converter.CodeGenerationMode.DefaultDefinition
        )
    );  

    // NOTE: not possible to use ajv v7 generated validators, since 
    //       redoc supports only OAS v3, which uses JSON Schema Draft 5,
    //       and need to wait until ReDoc support OAS v3.1, which uses Draft 2019-09
    //       @see https://github.com/Redocly/redoc/issues/1379
    //
    $RefParser.dereference(ROUTING_SCHEMA).then(openapi_schema =>
    {
        // build entities documentation sheets
        const requestSchema = (openapi_schema as PartialOpenAPISchema)
            .components
            .schemas
            .RouteOptimizationRequest;

        let derefTypeSchema = converter.makeTypeSchema(
            (openapi_schema as PartialOpenAPISchema)
                .components
                .schemas
        );
        
        console.log(`Writing TS defaults values to ${OUT_ROUTING_DEFAULTS_PATH}...`);
        fs.appendFileSync(
            OUT_ROUTING_DEFAULTS_PATH,
            converter.typeSchemaToTypeScript(
                derefTypeSchema,
                converter.CodeGenerationMode.DefaultValue
            )
        );
    
        // Build and write out flattened schemas
        //
        const requestSchemaProps = requestSchema.properties!;
        
        interface FlatSchema
        {
            data_sheet_name: string,
            key: Keys,
            schema?: Field[],
            root_schema?: JSONSchema4,
            example_data?: ExampleData,
            doc_sheet_name: string
        };

        const schemas: FlatSchema[] = [
            {key: Keys.depots, data_sheet_name: 'Depots', doc_sheet_name: 'Depots legend'},
            {key: Keys.sites, data_sheet_name: 'Sites', doc_sheet_name: 'Sites legend'},
            {key: Keys.fleet, data_sheet_name: 'Fleet', doc_sheet_name: 'Fleet legend'},
            {key: Keys.options, data_sheet_name: 'Options', doc_sheet_name: 'Options legend'},
            {key: Keys.constraints, data_sheet_name: 'Constraints', doc_sheet_name: 'Constraints legend'},
        ];

        schemas.forEach(schema => {
            console.log(`Flattening ${schema.key} schema...`);

            switch(schema.key) {
                case Keys.options:
                    schema.schema = converter.flattenSchema(
                        OPTIONS_SCHEMA,
                        schema.key,
                        patch
                    );
                    schema.root_schema = OPTIONS_SCHEMA;
                    break;
                default:
                    schema.schema = converter.flattenSchema(
                        requestSchemaProps[schema.key],
                        schema.key,
                        patch
                    );
                    schema.root_schema = requestSchemaProps[schema.key];
            }
        });

        console.log(`Writing flattened schema to ${OUT_ROUTING_FLATTENED_SCHEMA_PATH}...`);
        
        let excelSchema: PartialExcelSchema = {};

        schemas.forEach(schema => {
            excelSchema[schema.key] = {
                sheetName: schema.data_sheet_name,
                fields: schema.schema!,
                rootSchema: schema.root_schema!
            }
        });
        fs.writeFileSync(
            OUT_ROUTING_FLATTENED_SCHEMA_PATH,
            JSON.stringify(excelSchema, undefined, 4)
        );

        // Build and write out Excel templates from flattened schemas
        //
        schemas.forEach(schema => {
            switch(schema.key) {
                case Keys.depots:
                    schema.example_data = getDepotExampleData(schema.schema!);
                    break;
                case Keys.sites:
                    schema.example_data = getSitesExampleData(schema.schema!);
                    break;
                case Keys.fleet:
                    schema.example_data = getFleetExampleData(schema.schema!);
                    break;
                case Keys.options:
                    schema.example_data = getOptionsExampleData(schema.schema!);
                    break;
                case Keys.constraints:
                    schema.example_data = getConstraintsExampleData(schema.schema!);
                    break;
            }
        });

        const wb = new Excel.Workbook();

        // recalculate all formulas on load
        wb.calcProperties.fullCalcOnLoad = true;

        // add data sheets
        schemas.forEach(schema => {
            if (schema.example_data) {
                console.log(`Adding '${schema.data_sheet_name}' example data sheet...`);
                validateExampleData(schema.example_data, schema.schema!);
                formatter.addDataSheet(wb, schema.example_data, schema.data_sheet_name, schema.key);
            }
        });

        // add doc sheets
        schemas.forEach(schema => {
            console.log(`Adding '${schema.doc_sheet_name}' documentation sheet...`);
            formatter.addDocumentationSheet(wb, schema.schema!, schema.doc_sheet_name, schema.key);
        })

        console.log(`Writing example Excel to ${OUT_FLATTENED_DOC_PATH}...`);

        wb.xlsx.writeFile(OUT_FLATTENED_DOC_PATH, {
            useStyles: true,
            useSharedStrings: true
        });
    })
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}

main();

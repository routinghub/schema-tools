export type TaskInfo = {
    id: string | null;
    status: ("created" | "started" | "completed" | "cancelled") | null;
    status_log: {
        status: ("started" | "completed" | "cancelled") | null;
        time: string | null;
    }[] | null;
};

export type Error = {
    error: {
        message: string | null;
        request_id: string | null;
        details: {
        };
    };
};

export type BalancedShifts = {
    failure_costs: {
        per_hour: number;
        per_stop: number;
    };
};

export type BalancedShiftsDictionary = {[id: string] : BalancedShifts};

export type Capacity = {
    count: number | null;
    volume: number;
    weight: number;
};

export type CompositeCostMatrix = {
    dimensions: ("distance_duration" | "distance_duration_energy");
    type: ("composite") | null;
    value: CompositeCostMatrixItem[] | null;
    metadata: {
    };
};

export type CompositeCostMatrixItem = GcsCostMatrixReference | UrlCostMatrixReference | JsonTimePointCostMatrix | null;

export type Constraints = {
    balanced_shifts: BalancedShiftsDictionary | null;
    employed_vehicles_limit: EmployedVehiclesLimit | null;
    load_category_restrictions: string[][] | null;
    same_route_sites: SameRouteSitesDictionary | null;
};

export type CostMatrix = HereCostMatrix | OsrmCostMatrix | GcsCostMatrixReference | UrlCostMatrixReference | JsonCostMatrix | ZeroCostMatrix | StraightLineCostMatrix | CompositeCostMatrix | null;

export type DelayedStartCosts = {
    per_hour: number;
};

export type Depot = {
    delayed_start_costs: DelayedStartCosts | null;
    duration: number | null;
    location: GeographicLocation | null;
    throughput: DepotThroughput | null;
    throughput_violation_costs: ThroughputViolationCosts | null;
    time_window: TimeWindow | null;
    untimely_operations_costs: UntimelyOperationsCosts | null;
};

export type DepotThroughput = TimeConstantDepotThroughput | TimeVariableDepotThroughput | null;

export type DepotsDictionary = {[id: string] : Depot};

export type DistanceLimitFailureCosts = {
    per_event: number;
    per_m: number;
};

export type EmployedVehiclesLimit = {
    failure_costs: VehiclesLimitFailureCosts | null;
    min: number | null;
};

export type EnergyLimitFailureCosts = {
    per_event: number;
    per_kwh: number;
};

export type GcsCostMatrixReference = {
    bucket: string | null;
    dimensions: ("distance_duration" | "distance_duration_energy");
    object: string | null;
    type: ("gcs") | null;
};

export type GeographicLocation = {
    lat: number | null;
    lng: number | null;
};

export type HereCostMatrix = {
    time_points: string[] | null;
    type: ("here") | null;
    vehicle_type: ("light" | "heavy");
};

export type JsonCostMatrix = {
    dimensions: ("distance_duration" | "distance_duration_energy");
    type: ("json") | null;
    value: JsonCostMatrixValue | null;
    metadata: {
    };
};

export type JsonCostMatrixValue = {
    distances: RowMajorMatrix | null;
    durations: RowMajorMatrix | null;
    energy: RowMajorMatrixWithNegatives | null;
    fallback_cells: MatrixCoordinates | null;
};

export type JsonTimePointCostMatrix = {
    dimensions: ("distance_duration" | "distance_duration_energy");
    time_point: string | null;
    type: ("json_time_point") | null;
    value: JsonCostMatrixValue | null;
    metadata: {
    };
};

export type LateOperationsCosts = {
    per_event: number;
    per_late_minute: number;
};

export type Load = {
    categories: string[] | null;
    count: number | null;
    volume: number | null;
    weight: number | null;
};

export type MatrixCoordinates = integer[][];

export type MinimiumLoad = {
    count: number | null;
    volume: number | null;
    weight: number | null;
};

export type MovedLoadCost = MovedLoadCostKgKm | MovedLoadCostCountKm | null;

export type MovedLoadCostCountKm = {
    per_countkm: number | null;
};

export type MovedLoadCostKgKm = {
    per_kgkm: number | null;
};

export type Options = {
    cost_matrix: CostMatrix | null;
    minimization_target: ("cost");
    internal: {
    };
};

export type OsrmCostMatrix = {
    type: ("osrm") | null;
};

export type RowMajorMatrix = number[][];

export type RowMajorMatrixWithNegatives = number[][];

export type SameRoute = {
    failure_costs: {
        per_site: number;
    };
};

export type SameRouteSitesDictionary = {[id: string] : SameRoute};

export type Shift = {
    balance_key: string | null;
    distance_limit: ShiftDistanceLimit | null;
    duration_limit: number | null;
    energy_limit: ShiftEnergyLimit | null;
    gap: number | null;
    late_operations_costs: LateOperationsCosts | null;
    stops_limit: ShiftStopsLimit | null;
    time_window: TimeWindow | null;
};

export type ShiftDistanceLimit = {
    failure_costs: DistanceLimitFailureCosts | null;
    max: number | null;
};

export type ShiftEnergyLimit = {
    failure_costs: EnergyLimitFailureCosts | null;
    max: number | null;
};

export type ShiftStopsLimit = {
    failure_costs: StopsLimitFailureCosts | null;
    min: number | null;
};

export type ShiftsDictionary = {[id: string] : Shift};

export type Site = {
    deliver_to: string | null;
    duration: number | null;
    job: ("pickup" | "delivery");
    load: Load | null;
    loading_duration: number | null;
    location: GeographicLocation | null;
    preparing_duration: number | null;
    required_capabilities: string[] | null;
    same_route_key: string | null;
    time_window: TimeWindow | null;
    unperformed_cost: number;
    untimely_operations_costs: UntimelyOperationsCosts | null;
};

export type SiteBase = {
    location: GeographicLocation | null;
    time_window: TimeWindow | null;
    untimely_operations_costs: UntimelyOperationsCosts | null;
};

export type SitesDictionary = {[id: string] : Site};

export type StopsLimitFailureCosts = {
    per_event: number;
    per_stop: number;
};

export type StraightLineCostMatrix = {
    type: ("straight_line") | null;
};

export type ThroughputItems = {
    items_per_hour: number | null;
};

export type ThroughputViolationCosts = {
    per_count: number;
    per_event: number;
    per_kg: number;
};

export type ThroughputWeight = {
    weight_per_hour: number | null;
};

export type TimeConstantDepotThroughput = ThroughputItems | ThroughputWeight | null;

export type TimeDependentThroughputItems = {
    items_per_hour: number | null;
    time_point: string | null;
};

export type TimeDependentThroughputWeight = {
    time_point: string | null;
    weight_per_hour: number | null;
};

export type TimeVariableDepotThroughput = TimeVariableThroughputWeightList | TimeVariableThroughputItemsList | null;

export type TimeVariableThroughputItemsList = TimeDependentThroughputItems[];

export type TimeVariableThroughputWeightList = TimeDependentThroughputWeight[];

export type TimeWindow = {
    end: string | null;
    start: string | null;
    strict: boolean | null;
};

export type UntimelyOperationsCosts = {
    per_early_minute: number;
    per_event: number;
    per_late_minute: number;
};

export type UrlCostMatrixReference = {
    dimensions: ("distance_duration" | "distance_duration_energy");
    type: ("url") | null;
    url: string | null;
};

export type Vehicle = {
    capabilities: string[] | null;
    capacity: Capacity | null;
    costs: VehicleCosts | null;
    depot_id: string | null;
    end_depot_id: string | null;
    min_load: MinimiumLoad | null;
    roundtrip: boolean;
    shifts: ShiftsDictionary | null;
};

export type VehicleCosts = {
    moved_load: MovedLoadCost | null;
    per_event: number;
    per_hour: number;
    per_km: number;
    per_kwh: number;
    per_site: number;
};

export type VehiclesDictionary = {[id: string] : Vehicle};

export type VehiclesLimitFailureCosts = {
    per_event: number;
    per_vehicle: number;
};

export type ZeroCostMatrix = {
    type: ("zero") | null;
};

export type RouteOptimizationRequest = {
    constraints: Constraints | null;
    depots: DepotsDictionary | null;
    fleet: VehiclesDictionary | null;
    options: Options | null;
    sites: SitesDictionary | null;
    depot: {
        delayed_start_costs: DelayedStartCosts | null;
        duration: number | null;
        location: GeographicLocation | null;
        throughput: DepotThroughput | null;
        throughput_violation_costs: ThroughputViolationCosts | null;
        time_window: TimeWindow | null;
        untimely_operations_costs: UntimelyOperationsCosts | null;
    };
};

export type Request = RouteOptimizationRequest;

export type AccumulativeStatistics = {
    objective_value: number | null;
    total_cost: number | null;
    total_cost_and_penalty: number | null;
    total_depot_throughput_penalty: number | null;
    total_duration: number | null;
    total_idle_duration: number | null;
    total_locality_penalty: number | null;
    total_moved_load_countkm: number | null;
    total_moved_load_kgkm: number | null;
    total_penalty: number | null;
    total_same_route_penalty: number | null;
    total_travel_distance: number | null;
    total_travel_duration: number | null;
    total_travel_energy: number | null;
    untimely_operations: UntimelyOperationsStatistics | null;
};

export type DepotRouteWaypoint = {
    arrival_time: string | null;
    departure_time: string | null;
    duration: number | null;
    idle_duration: number | null;
    travel_distance: number | null;
    travel_duration: number | null;
    travel_energy: number | null;
    untimely_arrival_duration: number | null;
    depot: {
        delayed_start_costs: DelayedStartCosts | null;
        duration: number | null;
        id: string | null;
        location: GeographicLocation | null;
        throughput: DepotThroughput | null;
        throughput_violation_costs: ThroughputViolationCosts | null;
        time_window: TimeWindow | null;
        untimely_operations_costs: UntimelyOperationsCosts | null;
    };
};

export type RouteShift = {
    balance_key: string | null;
    distance_limit: ShiftDistanceLimit | null;
    duration_limit: number | null;
    energy_limit: ShiftEnergyLimit | null;
    gap: number | null;
    id: string | null;
    late_operations_costs: LateOperationsCosts | null;
    stops_limit: ShiftStopsLimit | null;
    time_window: TimeWindow | null;
};

export type RouteStatistics = {
    objective_value: number | null;
    total_cost: number | null;
    total_cost_and_penalty: number | null;
    total_depot_throughput_penalty: number | null;
    total_duration: number | null;
    total_idle_duration: number | null;
    total_locality_penalty: number | null;
    total_moved_load_countkm: number | null;
    total_moved_load_kgkm: number | null;
    total_penalty: number | null;
    total_same_route_penalty: number | null;
    total_travel_distance: number | null;
    total_travel_duration: number | null;
    total_travel_energy: number | null;
    untimely_operations: UntimelyOperationsStatistics | null;
};

export type RouteVehicle = {
    capabilities: string[] | null;
    capacity: Capacity | null;
    costs: VehicleCosts | null;
    depot_id: string | null;
    end_depot_id: string | null;
    id: string | null;
    min_load: MinimiumLoad | null;
    roundtrip: boolean;
    shifts: ShiftsDictionary | null;
};

export type SiteRouteWaypoint = {
    arrival_time: string | null;
    departure_time: string | null;
    duration: number | null;
    idle_duration: number | null;
    is_colocated: boolean | null;
    travel_distance: number | null;
    travel_duration: number | null;
    travel_energy: number | null;
    untimely_arrival_duration: number | null;
    site: {
        deliver_to: string | null;
        duration: number | null;
        id: string | null;
        job: ("pickup" | "delivery");
        load: Load | null;
        loading_duration: number | null;
        location: GeographicLocation | null;
        preparing_duration: number | null;
        required_capabilities: string[] | null;
        same_route_key: string | null;
        time_window: TimeWindow | null;
        unperformed_cost: number;
        untimely_operations_costs: UntimelyOperationsCosts | null;
    };
};

export type SolutionStatistics = {
    employed_vehicles_count: number | null;
    objective_value: number | null;
    total_cost: number | null;
    total_cost_and_penalty: number | null;
    total_depot_throughput_penalty: number | null;
    total_duration: number | null;
    total_idle_duration: number | null;
    total_locality_penalty: number | null;
    total_moved_load_countkm: number | null;
    total_moved_load_kgkm: number | null;
    total_penalty: number | null;
    total_same_route_penalty: number | null;
    total_travel_distance: number | null;
    total_travel_duration: number | null;
    total_travel_energy: number | null;
    unserved_count: number | null;
    untimely_operations: UntimelyOperationsStatistics | null;
};

export type UnservedSite = {
    reason: string | null;
    site: Site | null;
};

export type UnservedSitesDictionary = {[id: string] : UnservedSite};

export type UntimelyOperationsStatistics = {
    early_duration: number | null;
    early_sites_count: number | null;
    late_duration: number | null;
    late_sites_count: number | null;
    total_duration: number | null;
    total_sites_count: number | null;
};

export type VehicleRoute = {
    active_shift: RouteShift | null;
    statistics: RouteStatistics | null;
    vehicle: RouteVehicle | null;
    waypoints: DepotRouteWaypoint[] | SiteRouteWaypoint[] | null | null;
};

export type RouteOptimizationSolution = {
    constraints: Constraints | null;
    depots: DepotsDictionary | null;
    fleet: VehiclesDictionary | null;
    options: Options | null;
    routes: VehicleRoute[] | null;
    statistics: SolutionStatistics | null;
    unserved: UnservedSitesDictionary | null;
    depot: {
        delayed_start_costs: DelayedStartCosts | null;
        duration: number | null;
        location: GeographicLocation | null;
        throughput: DepotThroughput | null;
        throughput_violation_costs: ThroughputViolationCosts | null;
        time_window: TimeWindow | null;
        untimely_operations_costs: UntimelyOperationsCosts | null;
    };
};

export type Response = RouteOptimizationSolution;
export const TaskInfoDefault: TaskInfo = {
    id: null,
    status: null,
    status_log: [],
};

export const ErrorDefault: Error = {
    error: {
        message: null,
        request_id: null,
        details: {
        },
    },
};

export const BalancedShiftsDefault: BalancedShifts = {
    failure_costs: {
        per_hour: 3,
        per_stop: 1,
    },
};

export const BalancedShiftsDictionaryDefault: BalancedShiftsDictionary = {};

export const CapacityDefault: Capacity = {
    count: null,
    volume: 256,
    weight: 51200,
};

export const CompositeCostMatrixDefault: CompositeCostMatrix = {
    dimensions: "distance_duration",
    type: null,
    value: [],
    metadata: {
    },
};

export const CompositeCostMatrixItemDefault: CompositeCostMatrixItem = null;

export const ConstraintsDefault: Constraints = {
    load_category_restrictions: [],
    balanced_shifts: {},
    employed_vehicles_limit: {
        min: null,
        failure_costs: {
            per_event: 1000,
            per_vehicle: 1000,
        },
    },
    same_route_sites: {},
};

export const CostMatrixDefault: CostMatrix = null;

export const DelayedStartCostsDefault: DelayedStartCosts = {
    per_hour: 15,
};

export const DepotDefault: Depot = {
    duration: null,
    delayed_start_costs: {
        per_hour: 15,
    },
    location: {
        lat: null,
        lng: null,
    },
    throughput: null,
    throughput_violation_costs: {
        per_count: 10,
        per_event: 100,
        per_kg: 10,
    },
    time_window: {
        end: null,
        start: null,
        strict: null,
    },
    untimely_operations_costs: {
        per_early_minute: 0.25,
        per_event: 15,
        per_late_minute: 0.25,
    },
};

export const DepotThroughputDefault: DepotThroughput = null;

export const DepotsDictionaryDefault: DepotsDictionary = {};

export const DistanceLimitFailureCostsDefault: DistanceLimitFailureCosts = {
    per_event: 1000,
    per_m: 10,
};

export const EmployedVehiclesLimitDefault: EmployedVehiclesLimit = {
    min: null,
    failure_costs: {
        per_event: 1000,
        per_vehicle: 1000,
    },
};

export const EnergyLimitFailureCostsDefault: EnergyLimitFailureCosts = {
    per_event: 1000,
    per_kwh: 100,
};

export const GcsCostMatrixReferenceDefault: GcsCostMatrixReference = {
    bucket: null,
    dimensions: "distance_duration",
    object: null,
    type: null,
};

export const GeographicLocationDefault: GeographicLocation = {
    lat: null,
    lng: null,
};

export const HereCostMatrixDefault: HereCostMatrix = {
    time_points: [],
    type: null,
    vehicle_type: light,
};

export const JsonCostMatrixDefault: JsonCostMatrix = {
    dimensions: "distance_duration",
    type: null,
    metadata: {
    },
    value: {
        distances: [],
        durations: [],
        energy: [],
        fallback_cells: [],
    },
};

export const JsonCostMatrixValueDefault: JsonCostMatrixValue = {
    distances: [],
    durations: [],
    energy: [],
    fallback_cells: [],
};

export const JsonTimePointCostMatrixDefault: JsonTimePointCostMatrix = {
    dimensions: "distance_duration",
    time_point: null,
    type: null,
    metadata: {
    },
    value: {
        distances: [],
        durations: [],
        energy: [],
        fallback_cells: [],
    },
};

export const LateOperationsCostsDefault: LateOperationsCosts = {
    per_event: 15,
    per_late_minute: 0.25,
};

export const LoadDefault: Load = {
    categories: [],
    count: null,
    volume: null,
    weight: null,
};

export const MatrixCoordinatesDefault: MatrixCoordinates = [];

export const MinimiumLoadDefault: MinimiumLoad = {
    count: null,
    volume: null,
    weight: null,
};

export const MovedLoadCostDefault: MovedLoadCost = null;

export const MovedLoadCostCountKmDefault: MovedLoadCostCountKm = {
    per_countkm: null,
};

export const MovedLoadCostKgKmDefault: MovedLoadCostKgKm = {
    per_kgkm: null,
};

export const OptionsDefault: Options = {
    minimization_target: "cost",
    cost_matrix: null,
    internal: {
    },
};

export const OsrmCostMatrixDefault: OsrmCostMatrix = {
    type: null,
};

export const RowMajorMatrixDefault: RowMajorMatrix = [];

export const RowMajorMatrixWithNegativesDefault: RowMajorMatrixWithNegatives = [];

export const SameRouteDefault: SameRoute = {
    failure_costs: {
        per_site: 10,
    },
};

export const SameRouteSitesDictionaryDefault: SameRouteSitesDictionary = {};

export const ShiftDefault: Shift = {
    balance_key: null,
    duration_limit: null,
    gap: null,
    distance_limit: {
        max: null,
        failure_costs: {
            per_event: 1000,
            per_m: 10,
        },
    },
    energy_limit: {
        max: null,
        failure_costs: {
            per_event: 1000,
            per_kwh: 100,
        },
    },
    late_operations_costs: {
        per_event: 15,
        per_late_minute: 0.25,
    },
    stops_limit: {
        min: null,
        failure_costs: {
            per_event: 1000,
            per_stop: 100,
        },
    },
    time_window: {
        end: null,
        start: null,
        strict: null,
    },
};

export const ShiftDistanceLimitDefault: ShiftDistanceLimit = {
    max: null,
    failure_costs: {
        per_event: 1000,
        per_m: 10,
    },
};

export const ShiftEnergyLimitDefault: ShiftEnergyLimit = {
    max: null,
    failure_costs: {
        per_event: 1000,
        per_kwh: 100,
    },
};

export const ShiftStopsLimitDefault: ShiftStopsLimit = {
    min: null,
    failure_costs: {
        per_event: 1000,
        per_stop: 100,
    },
};

export const ShiftsDictionaryDefault: ShiftsDictionary = {};

export const SiteDefault: Site = {
    deliver_to: null,
    duration: null,
    job: "delivery",
    loading_duration: null,
    preparing_duration: null,
    required_capabilities: [],
    same_route_key: null,
    unperformed_cost: 100000000,
    load: {
        categories: [],
        count: null,
        volume: null,
        weight: null,
    },
    location: {
        lat: null,
        lng: null,
    },
    time_window: {
        end: null,
        start: null,
        strict: null,
    },
    untimely_operations_costs: {
        per_early_minute: 0.25,
        per_event: 15,
        per_late_minute: 0.25,
    },
};

export const SiteBaseDefault: SiteBase = {
    location: {
        lat: null,
        lng: null,
    },
    time_window: {
        end: null,
        start: null,
        strict: null,
    },
    untimely_operations_costs: {
        per_early_minute: 0.25,
        per_event: 15,
        per_late_minute: 0.25,
    },
};

export const SitesDictionaryDefault: SitesDictionary = {};

export const StopsLimitFailureCostsDefault: StopsLimitFailureCosts = {
    per_event: 1000,
    per_stop: 100,
};

export const StraightLineCostMatrixDefault: StraightLineCostMatrix = {
    type: null,
};

export const ThroughputItemsDefault: ThroughputItems = {
    items_per_hour: null,
};

export const ThroughputViolationCostsDefault: ThroughputViolationCosts = {
    per_count: 10,
    per_event: 100,
    per_kg: 10,
};

export const ThroughputWeightDefault: ThroughputWeight = {
    weight_per_hour: null,
};

export const TimeConstantDepotThroughputDefault: TimeConstantDepotThroughput = null;

export const TimeDependentThroughputItemsDefault: TimeDependentThroughputItems = {
    items_per_hour: null,
    time_point: null,
};

export const TimeDependentThroughputWeightDefault: TimeDependentThroughputWeight = {
    time_point: null,
    weight_per_hour: null,
};

export const TimeVariableDepotThroughputDefault: TimeVariableDepotThroughput = null;

export const TimeVariableThroughputItemsListDefault: TimeVariableThroughputItemsList = [];

export const TimeVariableThroughputWeightListDefault: TimeVariableThroughputWeightList = [];

export const TimeWindowDefault: TimeWindow = {
    end: null,
    start: null,
    strict: null,
};

export const UntimelyOperationsCostsDefault: UntimelyOperationsCosts = {
    per_early_minute: 0.25,
    per_event: 15,
    per_late_minute: 0.25,
};

export const UrlCostMatrixReferenceDefault: UrlCostMatrixReference = {
    dimensions: "distance_duration",
    type: null,
    url: null,
};

export const VehicleDefault: Vehicle = {
    capabilities: [],
    depot_id: null,
    end_depot_id: null,
    roundtrip: true,
    capacity: {
        count: null,
        volume: 256,
        weight: 51200,
    },
    costs: {
        per_event: 1000,
        per_hour: 10,
        per_km: 15,
        per_kwh: 0.1,
        per_site: 0.1,
        moved_load: null,
    },
    min_load: {
        count: null,
        volume: null,
        weight: null,
    },
    shifts: {},
};

export const VehicleCostsDefault: VehicleCosts = {
    per_event: 1000,
    per_hour: 10,
    per_km: 15,
    per_kwh: 0.1,
    per_site: 0.1,
    moved_load: null,
};

export const VehiclesDictionaryDefault: VehiclesDictionary = {};

export const VehiclesLimitFailureCostsDefault: VehiclesLimitFailureCosts = {
    per_event: 1000,
    per_vehicle: 1000,
};

export const ZeroCostMatrixDefault: ZeroCostMatrix = {
    type: null,
};

export const RouteOptimizationRequestDefault: RouteOptimizationRequest = {
    constraints: {
        load_category_restrictions: [],
        balanced_shifts: {},
        employed_vehicles_limit: {
            min: null,
            failure_costs: {
                per_event: 1000,
                per_vehicle: 1000,
            },
        },
        same_route_sites: {},
    },
    depot: {
        duration: null,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
        throughput_violation_costs: {
            per_count: 10,
            per_event: 100,
            per_kg: 10,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
    depots: {},
    fleet: {},
    options: {
        minimization_target: "cost",
        cost_matrix: null,
        internal: {
        },
    },
    sites: {},
};

export const RequestDefault: Request = {
    constraints: {
        load_category_restrictions: [],
        balanced_shifts: {},
        employed_vehicles_limit: {
            min: null,
            failure_costs: {
                per_event: 1000,
                per_vehicle: 1000,
            },
        },
        same_route_sites: {},
    },
    depot: {
        duration: null,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
        throughput_violation_costs: {
            per_count: 10,
            per_event: 100,
            per_kg: 10,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
    depots: {},
    fleet: {},
    options: {
        minimization_target: "cost",
        cost_matrix: null,
        internal: {
        },
    },
    sites: {},
};

export const AccumulativeStatisticsDefault: AccumulativeStatistics = {
    objective_value: null,
    total_cost: null,
    total_cost_and_penalty: null,
    total_depot_throughput_penalty: null,
    total_duration: null,
    total_idle_duration: null,
    total_locality_penalty: null,
    total_moved_load_countkm: null,
    total_moved_load_kgkm: null,
    total_penalty: null,
    total_same_route_penalty: null,
    total_travel_distance: null,
    total_travel_duration: null,
    total_travel_energy: null,
    untimely_operations: {
        early_duration: null,
        early_sites_count: null,
        late_duration: null,
        late_sites_count: null,
        total_duration: null,
        total_sites_count: null,
    },
};

export const DepotRouteWaypointDefault: DepotRouteWaypoint = {
    arrival_time: null,
    departure_time: null,
    duration: null,
    idle_duration: null,
    travel_distance: null,
    travel_duration: null,
    travel_energy: null,
    untimely_arrival_duration: null,
    depot: {
        duration: null,
        id: null,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
        throughput_violation_costs: {
            per_count: 10,
            per_event: 100,
            per_kg: 10,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
};

export const RouteShiftDefault: RouteShift = {
    balance_key: null,
    duration_limit: null,
    gap: null,
    id: null,
    distance_limit: {
        max: null,
        failure_costs: {
            per_event: 1000,
            per_m: 10,
        },
    },
    energy_limit: {
        max: null,
        failure_costs: {
            per_event: 1000,
            per_kwh: 100,
        },
    },
    late_operations_costs: {
        per_event: 15,
        per_late_minute: 0.25,
    },
    stops_limit: {
        min: null,
        failure_costs: {
            per_event: 1000,
            per_stop: 100,
        },
    },
    time_window: {
        end: null,
        start: null,
        strict: null,
    },
};

export const RouteStatisticsDefault: RouteStatistics = {
    objective_value: null,
    total_cost: null,
    total_cost_and_penalty: null,
    total_depot_throughput_penalty: null,
    total_duration: null,
    total_idle_duration: null,
    total_locality_penalty: null,
    total_moved_load_countkm: null,
    total_moved_load_kgkm: null,
    total_penalty: null,
    total_same_route_penalty: null,
    total_travel_distance: null,
    total_travel_duration: null,
    total_travel_energy: null,
    untimely_operations: {
        early_duration: null,
        early_sites_count: null,
        late_duration: null,
        late_sites_count: null,
        total_duration: null,
        total_sites_count: null,
    },
};

export const RouteVehicleDefault: RouteVehicle = {
    capabilities: [],
    depot_id: null,
    end_depot_id: null,
    id: null,
    roundtrip: true,
    capacity: {
        count: null,
        volume: 256,
        weight: 51200,
    },
    costs: {
        per_event: 1000,
        per_hour: 10,
        per_km: 15,
        per_kwh: 0.1,
        per_site: 0.1,
        moved_load: null,
    },
    min_load: {
        count: null,
        volume: null,
        weight: null,
    },
    shifts: {},
};

export const SiteRouteWaypointDefault: SiteRouteWaypoint = {
    arrival_time: null,
    departure_time: null,
    duration: null,
    idle_duration: null,
    is_colocated: null,
    travel_distance: null,
    travel_duration: null,
    travel_energy: null,
    untimely_arrival_duration: null,
    site: {
        deliver_to: null,
        duration: null,
        id: null,
        job: "delivery",
        loading_duration: null,
        preparing_duration: null,
        required_capabilities: [],
        same_route_key: null,
        unperformed_cost: 100000000,
        load: {
            categories: [],
            count: null,
            volume: null,
            weight: null,
        },
        location: {
            lat: null,
            lng: null,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
};

export const SolutionStatisticsDefault: SolutionStatistics = {
    employed_vehicles_count: null,
    objective_value: null,
    total_cost: null,
    total_cost_and_penalty: null,
    total_depot_throughput_penalty: null,
    total_duration: null,
    total_idle_duration: null,
    total_locality_penalty: null,
    total_moved_load_countkm: null,
    total_moved_load_kgkm: null,
    total_penalty: null,
    total_same_route_penalty: null,
    total_travel_distance: null,
    total_travel_duration: null,
    total_travel_energy: null,
    unserved_count: null,
    untimely_operations: {
        early_duration: null,
        early_sites_count: null,
        late_duration: null,
        late_sites_count: null,
        total_duration: null,
        total_sites_count: null,
    },
};

export const UnservedSiteDefault: UnservedSite = {
    reason: null,
    site: {
        deliver_to: null,
        duration: null,
        job: "delivery",
        loading_duration: null,
        preparing_duration: null,
        required_capabilities: [],
        same_route_key: null,
        unperformed_cost: 100000000,
        load: {
            categories: [],
            count: null,
            volume: null,
            weight: null,
        },
        location: {
            lat: null,
            lng: null,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
};

export const UnservedSitesDictionaryDefault: UnservedSitesDictionary = {};

export const UntimelyOperationsStatisticsDefault: UntimelyOperationsStatistics = {
    early_duration: null,
    early_sites_count: null,
    late_duration: null,
    late_sites_count: null,
    total_duration: null,
    total_sites_count: null,
};

export const VehicleRouteDefault: VehicleRoute = {
    waypoints: [],
    active_shift: {
        balance_key: null,
        duration_limit: null,
        gap: null,
        id: null,
        distance_limit: {
            max: null,
            failure_costs: {
                per_event: 1000,
                per_m: 10,
            },
        },
        energy_limit: {
            max: null,
            failure_costs: {
                per_event: 1000,
                per_kwh: 100,
            },
        },
        late_operations_costs: {
            per_event: 15,
            per_late_minute: 0.25,
        },
        stops_limit: {
            min: null,
            failure_costs: {
                per_event: 1000,
                per_stop: 100,
            },
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
    },
    statistics: {
        objective_value: null,
        total_cost: null,
        total_cost_and_penalty: null,
        total_depot_throughput_penalty: null,
        total_duration: null,
        total_idle_duration: null,
        total_locality_penalty: null,
        total_moved_load_countkm: null,
        total_moved_load_kgkm: null,
        total_penalty: null,
        total_same_route_penalty: null,
        total_travel_distance: null,
        total_travel_duration: null,
        total_travel_energy: null,
        untimely_operations: {
            early_duration: null,
            early_sites_count: null,
            late_duration: null,
            late_sites_count: null,
            total_duration: null,
            total_sites_count: null,
        },
    },
    vehicle: {
        capabilities: [],
        depot_id: null,
        end_depot_id: null,
        id: null,
        roundtrip: true,
        capacity: {
            count: null,
            volume: 256,
            weight: 51200,
        },
        costs: {
            per_event: 1000,
            per_hour: 10,
            per_km: 15,
            per_kwh: 0.1,
            per_site: 0.1,
            moved_load: null,
        },
        min_load: {
            count: null,
            volume: null,
            weight: null,
        },
        shifts: {},
    },
};

export const RouteOptimizationSolutionDefault: RouteOptimizationSolution = {
    routes: [],
    constraints: {
        load_category_restrictions: [],
        balanced_shifts: {},
        employed_vehicles_limit: {
            min: null,
            failure_costs: {
                per_event: 1000,
                per_vehicle: 1000,
            },
        },
        same_route_sites: {},
    },
    depot: {
        duration: null,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
        throughput_violation_costs: {
            per_count: 10,
            per_event: 100,
            per_kg: 10,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
    depots: {},
    fleet: {},
    options: {
        minimization_target: "cost",
        cost_matrix: null,
        internal: {
        },
    },
    statistics: {
        employed_vehicles_count: null,
        objective_value: null,
        total_cost: null,
        total_cost_and_penalty: null,
        total_depot_throughput_penalty: null,
        total_duration: null,
        total_idle_duration: null,
        total_locality_penalty: null,
        total_moved_load_countkm: null,
        total_moved_load_kgkm: null,
        total_penalty: null,
        total_same_route_penalty: null,
        total_travel_distance: null,
        total_travel_duration: null,
        total_travel_energy: null,
        unserved_count: null,
        untimely_operations: {
            early_duration: null,
            early_sites_count: null,
            late_duration: null,
            late_sites_count: null,
            total_duration: null,
            total_sites_count: null,
        },
    },
    unserved: {},
};

export const ResponseDefault: Response = {
    routes: [],
    constraints: {
        load_category_restrictions: [],
        balanced_shifts: {},
        employed_vehicles_limit: {
            min: null,
            failure_costs: {
                per_event: 1000,
                per_vehicle: 1000,
            },
        },
        same_route_sites: {},
    },
    depot: {
        duration: null,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
        throughput_violation_costs: {
            per_count: 10,
            per_event: 100,
            per_kg: 10,
        },
        time_window: {
            end: null,
            start: null,
            strict: null,
        },
        untimely_operations_costs: {
            per_early_minute: 0.25,
            per_event: 15,
            per_late_minute: 0.25,
        },
    },
    depots: {},
    fleet: {},
    options: {
        minimization_target: "cost",
        cost_matrix: null,
        internal: {
        },
    },
    statistics: {
        employed_vehicles_count: null,
        objective_value: null,
        total_cost: null,
        total_cost_and_penalty: null,
        total_depot_throughput_penalty: null,
        total_duration: null,
        total_idle_duration: null,
        total_locality_penalty: null,
        total_moved_load_countkm: null,
        total_moved_load_kgkm: null,
        total_penalty: null,
        total_same_route_penalty: null,
        total_travel_distance: null,
        total_travel_duration: null,
        total_travel_energy: null,
        unserved_count: null,
        untimely_operations: {
            early_duration: null,
            early_sites_count: null,
            late_duration: null,
            late_sites_count: null,
            total_duration: null,
            total_sites_count: null,
        },
    },
    unserved: {},
};

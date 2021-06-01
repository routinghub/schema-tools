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

export type Constraints = {
    balanced_shifts: BalancedShiftsDictionary | null;
    employed_vehicles_limit: EmployedVehiclesLimit | null;
    load_category_restrictions: string[][] | null;
    same_route_sites: SameRouteSitesDictionary | null;
};

export type CostMatrix = OsrmCostMatrix | HereCostMatrix | ZeroCostMatrix | GcsCostMatrix | StraightLineCostMatrix | UrlCostMatrix | JsonCostMatrix | null;

export type CostMatrixTimeInterval = {
    end: string | null;
    start: string | null;
};

export type DelayedStartCosts = {
    per_hour: number;
};

export type Depot = {
    delayed_start_costs: DelayedStartCosts | null;
    duration: number;
    location: GeographicLocation | null;
    throughput: DepotThroughput | null;
    time_window: TimeWindow | null;
    untimely_operations_costs: UntimelyOperationsCosts | null;
};

export type DepotThroughput = KilogramsPerHour | ItemsPerHour | null;

export type DepotsDictionary = {[id: string] : Depot};

export type EmployedVehiclesLimit = {
    failure_costs: VehiclesLimitFailureCosts | null;
    min: number | null;
};

export type GcsCostMatrix = {
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
    type: ("here") | null;
};

export type ItemsPerHour = {
    items: number | null;
};

export type JsonCostMatrix = {
    dimensions: ("distance_duration" | "distance_duration_energy");
    type: ("json") | null;
    value: TimeIndependentCostMatrix | TimeDependentCostMatrix[] | null;
};

export type KilogramsPerHour = {
    kilograms: number | null;
};

export type LateOperationsCosts = {
    per_event: number;
    per_late_minute: number;
};

export type Load = {
    categories: string[] | null;
    count: number | null;
    volume: number;
    weight: number;
};

export type MatrixCoordinates = number[][];

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

export type SameRoute = {
    failure_costs: {
        per_site: number;
    };
};

export type SameRouteSitesDictionary = {[id: string] : SameRoute};

export type Shift = {
    balance_key: string | null;
    duration_limit: number;
    gap: number | null;
    late_operations_costs: LateOperationsCosts | null;
    stops_limit: ShiftStopsLimit | null;
    time_window: TimeWindow | null;
};

export type ShiftStopsLimit = {
    failure_costs: StopsLimitFailureCosts | null;
    min: number | null;
};

export type ShiftsDictionary = {[id: string] : Shift};

export type Site = {
    deliver_to: string | null;
    duration: number;
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

export type TimeDependentCostMatrix = {
    distances: RowMajorMatrix | null;
    durations: RowMajorMatrix | null;
    energy: RowMajorMatrix | null;
    fallback_cells: MatrixCoordinates | null;
    interval: CostMatrixTimeInterval | null;
};

export type TimeIndependentCostMatrix = {
    distances: RowMajorMatrix | null;
    durations: RowMajorMatrix | null;
    energy: RowMajorMatrix | null;
    fallback_cells: MatrixCoordinates | null;
};

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

export type UrlCostMatrix = {
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
    per_kwh: number | null;
    per_site: number | null;
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
        duration: number;
        location: GeographicLocation | null;
        throughput: DepotThroughput | null;
        time_window: TimeWindow | null;
        untimely_operations_costs: UntimelyOperationsCosts | null;
    };
};

export type Request = RouteOptimizationRequest;

export type AccumulativeStatistics = {
    objective_value: number | null;
    total_cost: number | null;
    total_cost_and_penalty: number | null;
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
        duration: number;
        id: string | null;
        location: GeographicLocation | null;
        throughput: DepotThroughput | null;
        time_window: TimeWindow | null;
        untimely_operations_costs: UntimelyOperationsCosts | null;
    };
};

export type RouteShift = {
    balance_key: string | null;
    duration_limit: number;
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
        duration: number;
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
        duration: number;
        location: GeographicLocation | null;
        throughput: DepotThroughput | null;
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

export const CostMatrixTimeIntervalDefault: CostMatrixTimeInterval = {
    end: null,
    start: null,
};

export const DelayedStartCostsDefault: DelayedStartCosts = {
    per_hour: 15,
};

export const DepotDefault: Depot = {
    duration: 600,
    delayed_start_costs: {
        per_hour: 15,
    },
    location: {
        lat: null,
        lng: null,
    },
    throughput: null,
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

export const EmployedVehiclesLimitDefault: EmployedVehiclesLimit = {
    min: null,
    failure_costs: {
        per_event: 1000,
        per_vehicle: 1000,
    },
};

export const GcsCostMatrixDefault: GcsCostMatrix = {
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
    type: null,
};

export const ItemsPerHourDefault: ItemsPerHour = {
    items: null,
};

export const JsonCostMatrixDefault: JsonCostMatrix = {
    dimensions: "distance_duration",
    type: null,
    value: null,
};

export const KilogramsPerHourDefault: KilogramsPerHour = {
    kilograms: null,
};

export const LateOperationsCostsDefault: LateOperationsCosts = {
    per_event: 15,
    per_late_minute: 0.25,
};

export const LoadDefault: Load = {
    categories: [],
    count: null,
    volume: 0.005,
    weight: 1,
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

export const SameRouteDefault: SameRoute = {
    failure_costs: {
        per_site: 10,
    },
};

export const SameRouteSitesDictionaryDefault: SameRouteSitesDictionary = {};

export const ShiftDefault: Shift = {
    balance_key: null,
    duration_limit: 86400,
    gap: null,
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
    duration: 600,
    job: "delivery",
    loading_duration: null,
    preparing_duration: null,
    required_capabilities: [],
    same_route_key: null,
    unperformed_cost: 200,
    load: {
        categories: [],
        count: null,
        volume: 0.005,
        weight: 1,
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

export const TimeDependentCostMatrixDefault: TimeDependentCostMatrix = {
    distances: [],
    durations: [],
    energy: [],
    fallback_cells: [],
    interval: {
        end: null,
        start: null,
    },
};

export const TimeIndependentCostMatrixDefault: TimeIndependentCostMatrix = {
    distances: [],
    durations: [],
    energy: [],
    fallback_cells: [],
};

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

export const UrlCostMatrixDefault: UrlCostMatrix = {
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
        per_event: 50,
        per_hour: 10,
        per_km: 15,
        per_kwh: null,
        per_site: null,
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
    per_event: 50,
    per_hour: 10,
    per_km: 15,
    per_kwh: null,
    per_site: null,
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
        duration: 600,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
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
        duration: 600,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
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
        duration: 600,
        id: null,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
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
    duration_limit: 86400,
    gap: null,
    id: null,
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
        per_event: 50,
        per_hour: 10,
        per_km: 15,
        per_kwh: null,
        per_site: null,
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
        duration: 600,
        id: null,
        job: "delivery",
        loading_duration: null,
        preparing_duration: null,
        required_capabilities: [],
        same_route_key: null,
        unperformed_cost: 200,
        load: {
            categories: [],
            count: null,
            volume: 0.005,
            weight: 1,
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
        duration: 600,
        job: "delivery",
        loading_duration: null,
        preparing_duration: null,
        required_capabilities: [],
        same_route_key: null,
        unperformed_cost: 200,
        load: {
            categories: [],
            count: null,
            volume: 0.005,
            weight: 1,
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
        duration_limit: 86400,
        gap: null,
        id: null,
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
            per_event: 50,
            per_hour: 10,
            per_km: 15,
            per_kwh: null,
            per_site: null,
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
        duration: 600,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
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
        duration: 600,
        delayed_start_costs: {
            per_hour: 15,
        },
        location: {
            lat: null,
            lng: null,
        },
        throughput: null,
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

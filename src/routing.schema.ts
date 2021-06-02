export type TaskInfo = {
    // Task unique id
    id: string;
    // Current status of an asynchronous task.
    // 
    // Status values:
    // * `created` - request JSON has been parsed and validated, and task was created;
    // * `started` - task execution has started;
    // * `completed` - task execution has been completed;
    // * `cancelled` - task execution has been cancelled due to timeout or error.
    // 
    // The status of a task will change only in the following ways during execution:
    // * `created ⟶ cancelled`;
    // * `created ⟶ started ⟶ (completed or cancelled).`
    // 
    status: ("created" | "started" | "completed" | "cancelled");
    status_log: {
        // Status value
        status: ("started" | "completed" | "cancelled");
        // Status time, ISO8601 timestamp in UTC time zone
        time: string;
    }[];
};

export type Error = {
    error?: {
        // Error text.
        message: string;
        // Unique identifier of the request for tracing purposes.
        request_id?: string;
        details?: {
        };
    };
};

export type BalancedShifts = {
    failure_costs?: {
        // Balances shifts in the group by total duration.
        // 
        // Defines the cost per each hour of Root Sum Squared (RSS) difference between the duration of a shift and average duration of other balanced shifts.
        per_hour?: number;
        // Balances shifts in the group by total number of stops.
        // 
        // Defines the cost per each stop in Route Sum Squared (RSS) difference between the number of stops in a shift and average number of stops in other balanced shifts.
        per_stop?: number;
    };
};

export type BalancedShiftsDictionary = {[id: string] : BalancedShifts};

export type Capacity = {
    // Count, items.
    // 
    // A unit of count defining the number of items regarded as separate and equal units. Used independently from `weight` or `volume`.
    count?: number;
    // Volume, cubic meters.
    // 
    // When `volume` is not specified, and `weight` is specified, will be calculated from `weight` using [volumetric factor of 200 kg/cbm](https://en.wikipedia.org/wiki/Dimensional_weight).
    volume?: number;
    // Weight, kilograms.
    // 
    // When `weight` is not specified, and `volume` is specified, will be calculated from `volume` using [volumetric factor of 200 kg/cbm](https://en.wikipedia.org/wiki/Dimensional_weight).
    weight?: number;
};

export type CompositeCostMatrix = {
    // Type of available matrix dimensions, that must appear in cost matrix body.
    // 
    // Following types are supported:
    // * `distance_duration` - transit distance and duration;
    // * `distance_duration_energy` - transit distance, duration and energy spent during the transition
    dimensions?: ("distance_duration" | "distance_duration_energy");
    // Composite cost matrix, includes multiple submatrices for different vehicle types or time points.
    // 
    // All submatrices must have equal dimensions.
    type: ("composite");
    value: CompositeCostMatrixItem[];
    metadata?: {
    };
};

export type CompositeCostMatrixItem = GcsCostMatrixReference | UrlCostMatrixReference | JsonTimePointCostMatrix;

export type Constraints = {
    // Vehicle shifts balancing.
    // 
    // Enables balancing of selected vehicles shifts by total duration or number of stops.
    // 
    // A balancing key defined here should be referred at vehicle shift definition to enable route balancing for the shift, see `fleet{}.shifts{}.balancing_key`
    balanced_shifts?: BalancedShiftsDictionary;
    // Limit the number of employed vehicles.
    employed_vehicles_limit?: EmployedVehiclesLimit;
    load_category_restrictions?: string[][];
    // Same route sites groups.
    // 
    // Enforces group of sites to appear on the same route.
    // 
    // A group key defined here should be referred at site definition to enable the same route requirement, see `sites{}.same_route_key`
    same_route_sites?: SameRouteSitesDictionary;
};

export type CostMatrix = HereCostMatrix | OsrmCostMatrix | GcsCostMatrixReference | UrlCostMatrixReference | JsonCostMatrix | ZeroCostMatrix | StraightLineCostMatrix | CompositeCostMatrix;

export type DelayedStartCosts = {
    // Cost per each hour of delayed start from the depot.
    // 
    // The cost should normally be higher than `vehicle.cost.per_hour` to minimize delayed start.
    per_hour: number;
};

export type Depot = {
    // Costs of delayed start of a route at the depot.
    // 
    // Vehicles dispatched too late after depot or vehicle shift time window start will result corresponding violation cost added to the total cost of the route.
    delayed_start_costs?: DelayedStartCosts;
    // Duration that vehicle spends at a depot (e.g. goods loading), seconds.
    duration?: number;
    location: GeographicLocation;
    throughput?: DepotThroughput;
    // Costs of violating defined depot throughput.
    // 
    // Added to the total cost of the route when load handled by depot exceeds defined throughput limits.
    throughput_violation_costs?: ThroughputViolationCosts;
    // Time window for depot operations.
    //  
    // Range of time, when depot is allowed to dispatch or accept returning vehicles.
    time_window: TimeWindow;
    // Costs for depot time window violation.
    // 
    // Vehicles dispatched too early (before depot time window start) or returned too late (after time window end) will result violation cost added to the total cost of the route.
    untimely_operations_costs?: UntimelyOperationsCosts;
};

export type DepotThroughput = TimeConstantDepotThroughput | TimeVariableDepotThroughput;

export type DepotsDictionary = {[id: string] : Depot};

export type DistanceLimitFailureCosts = {
    // Cost per each shift violating the limit
    per_event?: number;
    // Cost per each meter of transit distance, violating the limit
    per_m?: number;
};

export type EmployedVehiclesLimit = {
    // Cost of employing less than a minimum number of vehicles.
    failure_costs?: VehiclesLimitFailureCosts;
    // Minumum number of vehicles to employ.
    min: number;
};

export type EnergyLimitFailureCosts = {
    // Cost per each shift violating the limit
    per_event?: number;
    // Cost per each kWh of transit energy, violating the limit
    per_kwh?: number;
};

export type GcsCostMatrixReference = {
    // GCS bucket
    bucket: string;
    // Type of available matrix dimensions, that must appear in cost matrix body.
    // 
    // Following types are supported:
    // * `distance_duration` - transit distance and duration;
    // * `distance_duration_energy` - transit distance, duration and energy spent during the transition
    dimensions?: ("distance_duration" | "distance_duration_energy");
    // Full path to object in GCS bucket
    object: string;
    // Cost matrix specified as remote JSON file stored in Google Cloud Storage bucket. 
    // 
    // The bucket must be publically accessible, or configured for private access by internal service account. 
    // 
    // The object can optionally be compressed with gzip, and will be decompressed automatically after download, if object body starts from the valid gzip header.
    type: ("gcs");
};

export type GeographicLocation = {
    // Latitude
    lat: number;
    // Longitude
    lng: number;
};

export type HereCostMatrix = {
    time_points?: string[];
    // Cost matrix requested from HERE Matrix API v8.
    type: ("here");
    // Vehicle type, affects transit speed and restrictions.
    // 
    // Specified timepoints will be ignored for `heavy`.
    vehicle_type?: ("light" | "heavy");
};

export type JsonCostMatrix = {
    // Type of available matrix dimensions, that must appear in cost matrix body.
    // 
    // Following types are supported:
    // * `distance_duration` - transit distance and duration;
    // * `distance_duration_energy` - transit distance, duration and energy spent during the transition
    dimensions?: ("distance_duration" | "distance_duration_energy");
    // Transit cost matrices inlined in JSON.
    type: ("json");
    // Row-major matrices of transit distances and durations between origins and destinations.
    value: JsonCostMatrixValue;
    metadata?: {
    };
};

export type JsonCostMatrixValue = {
    // Transit distances, meters.
    distances: RowMajorMatrix;
    // Transit durations, seconds.
    durations: RowMajorMatrix;
    // Transit energy, kW/h per distance in meters. 
    // 
    // Required when `dimensions` value is set to `distance_duration_energy`, otherwise optional. Allows negative values in matrix cells.
    energy?: RowMajorMatrixWithNegatives;
    // An array of matrix cells indices (`[row, column]`), where distance calculation failed (non-routable locations, closed roads, etc).
    // 
    // Failed cells are replaced with:
    // * `distances`, approximate straight line distance [as per US FCC formula](https://www.gpo.gov/fdsys/pkg/CFR-2005-title47-vol4/pdf/CFR-2005-title47-vol4-sec73-208.pdf)
    // * `durations`, travel duration for approximated distance at speed 20 km/h
    // * `energy`, 0.2 kW/h per each km of approximated distance
    // 
    fallback_cells?: MatrixCoordinates;
};

export type JsonTimePointCostMatrix = {
    // Type of available matrix dimensions, that must appear in cost matrix body.
    // 
    // Following types are supported:
    // * `distance_duration` - transit distance and duration;
    // * `distance_duration_energy` - transit distance, duration and energy spent during the transition
    dimensions?: ("distance_duration" | "distance_duration_energy");
    // Time of departure for all origins/destinations, ISO8601 timestamp with timezone
    time_point?: string;
    // Transit cost matrices inlined in JSON.
    type: ("json_time_point");
    // Row-major matrices of transit distances and durations between origins and destinations, where all routes are departing at specified time point.
    value: JsonCostMatrixValue;
    metadata?: {
    };
};

export type LateOperationsCosts = {
    // Cost per an event of late operations
    per_event?: number;
    // Cost per a minute of late operations
    per_late_minute?: number;
};

export type Load = {
    categories?: string[];
    // Count, items.
    // 
    // A unit of count defining the number of items regarded as separate and equal units. Used independently from `weight` or `volume`.
    count?: number;
    // Volume, cubic meters.
    // 
    // When `volume` is not specified, and `weight` is specified, will be calculated from `weight` using [volumetric factor of 200 kg/cbm](https://en.wikipedia.org/wiki/Dimensional_weight).
    volume?: number;
    // Weight, kilograms.
    // 
    // When `weight` is not specified, and `volume` is specified, will be calculated from `volume` using [volumetric factor of 200 kg/cbm](https://en.wikipedia.org/wiki/Dimensional_weight).
    weight?: number;
};

export type MatrixCoordinates = integer[][];

export type MinimiumLoad = {
    // Count, items.
    // 
    // A unit of count defining the number of items regarded as separate and equal units. Used independently from `weight` or `volume`.
    count?: number;
    // Volume, cubic meters.
    // 
    // When `volume` is not specified, and `weight` is specified, will be calculated from `weight` using [volumetric factor of 200 kg/cbm](https://en.wikipedia.org/wiki/Dimensional_weight).
    volume?: number;
    // Weight, kilograms.
    // 
    // When `weight` is not specified, and `volume` is specified, will be calculated from `volume` using [volumetric factor of 200 kg/cbm](https://en.wikipedia.org/wiki/Dimensional_weight).
    weight?: number;
};

export type MovedLoadCost = MovedLoadCostKgKm | MovedLoadCostCountKm;

export type MovedLoadCostCountKm = {
    // Cost of moving 1 item over 1 km, items⋅km.
    per_countkm: number;
};

export type MovedLoadCostKgKm = {
    // Cost of moving 1 kg over 1 km, kg⋅km.
    per_kgkm: number;
};

export type Options = {
    // Matrix of transit distances and durations between all depots and sites.
    cost_matrix?: CostMatrix;
    minimization_target?: ("cost");
    internal?: {
    };
};

export type OsrmCostMatrix = {
    // Cost matrix from OpenStreetMap (OSRM router, car profile)
    type: ("osrm");
};

export type RowMajorMatrix = number[][];

export type RowMajorMatrixWithNegatives = number[][];

export type SameRoute = {
    failure_costs?: {
        // Cost per each site in the group failing the constraint.
        per_site?: number;
    };
};

export type SameRouteSitesDictionary = {[id: string] : SameRoute};

export type Shift = {
    // A key to define group of shifts that will be balanced by total number of stops or total duration.
    // 
    // See `constraints.balanced_shifts`
    balance_key?: string;
    // Maximum transit distance of the shift, meters.
    // 
    // In case when transit distance of a shift route exceeds defined limit, `distance_limit.failure_costs` are added to the total cost of the route proportionaly to excess distance.
    distance_limit?: ShiftDistanceLimit;
    // Maximum duration of the shift, seconds.
    // 
    // In case when duration of the shift exceeds defined limit, `late_operations_costs` are added to the total cost of the route proportionaly to excess time.
    duration_limit?: number;
    // Maximum transit energy of the shift, kWh.
    // 
    // In case when transit energy of a shift route exceeds defined limit, `energy_limit.failure_costs` are added to the total cost of the route proportionaly to excess energy.
    energy_limit?: ShiftEnergyLimit;
    // Delay between consecutive shifts performed by a vehicle, seconds.
    // 
    // The `gap` value can be used to model fixed-time operations between the shifts, such as swapping the driver, or processing the paperwork at the depot.
    gap?: number;
    // Cost of late finish of a shift.
    // 
    // Added to total cost of the solution, when shift is finished later than specified shift time window. Does not apply when `time_window.strict = true`.
    late_operations_costs?: LateOperationsCosts;
    // Minimum number of site stops per each shift route.
    // 
    // Note that co-located sites are accounted as one stop, and depot start and end is not counted.
    stops_limit?: ShiftStopsLimit;
    // Time window of a vehicle shift.
    // 
    // Vehicle should finish the route and optionally return to depot by the end of defined shift time window.
    time_window: TimeWindow;
};

export type ShiftDistanceLimit = {
    // Cost of violating maximum transit distance limit of the route (`distance_limit.max`).
    failure_costs?: DistanceLimitFailureCosts;
    // Maximum transit distance of the route, meters.
    max: number;
};

export type ShiftEnergyLimit = {
    // Cost of violating maximum transit energy limit of the route (`energy_limit.max`).
    failure_costs?: EnergyLimitFailureCosts;
    // Maximum transit energy of the route, kWh.
    max: number;
};

export type ShiftStopsLimit = {
    // Cost of having less than `stops_limit.min` stops in the route.
    // 
    // Added to total cost of the solution, when route has less than required number of stops.
    failure_costs?: StopsLimitFailureCosts;
    // Minumum number of stops a vehicle should made on the route. Note that co-located sites are counted as one stop, and depot start and end is not counted.
    min: number;
};

export type ShiftsDictionary = {[id: string] : Shift};

export type Site = {
    // For `pickup` jobs, specifies `id` of destination site for delivery.
    deliver_to?: string;
    // Duration of the job, performed during the site visit, seconds.
    // 
    // Example: time to handle goods or perform services during the site visit.
    duration?: number;
    // Type of job performed at a site.
    // 
    // Following types are supported:
    // * `delivery` - goods are picked up at depot and delivered to this site;
    // * `pickup` - goods are picked up at this site and delivered to the site specified in `deliver_to` field or to the depot at the end of the route.
    job?: ("pickup" | "delivery");
    load?: Load;
    // Duration of loading the goods at the depot, seconds.
    // 
    // Will be added to `depot.duration` to adjust time spent by vehicle at the depot.
    loading_duration?: number;
    location: GeographicLocation;
    // Time before the job during the site visit, seconds.
    // 
    // For co-located sites, will only be accounted for the first site in sequence.
    // 
    // Example: parking time or time for security clearance during site visit, which will happen once if several sites share the same geo coordinates and time window ("co-located").
    preparing_duration?: number;
    required_capabilities?: string[];
    // Ensure that sites with equal `same_route_key` will appear on the same route.
    // 
    // Note that all unique `same_route_key` values must be also specified at `constraints.same_route_sites`.
    same_route_key?: string;
    // The range of time when a visit to the site is allowed.
    time_window: TimeWindow;
    // Cost of non-performing a visit.
    unperformed_cost?: number;
    // Costs of untimely arrival to the site.
    // 
    // When vehicle arrives to the site too early or too late in respect with the site time window, the corresponding cost is added to the overall cost of the route.
    untimely_operations_costs?: UntimelyOperationsCosts;
};

export type SiteBase = {
    location: GeographicLocation;
    // Time window
    time_window: TimeWindow;
    // Costs of untimely arrival to the site.
    // 
    // When vehicle arrives to the site too early or too late in respect with the site time window, the corresponding cost is added to the overall cost of the route.
    untimely_operations_costs?: UntimelyOperationsCosts;
};

export type SitesDictionary = {[id: string] : Site};

export type StopsLimitFailureCosts = {
    // Cost per each shift violating the limit
    per_event?: number;
    // Cost per each stop violating the limit
    per_stop?: number;
};

export type StraightLineCostMatrix = {
    // Cost matrix calculated using straight line distance [as per US FCC formula](https://www.gpo.gov/fdsys/pkg/CFR-2005-title47-vol4/pdf/CFR-2005-title47-vol4-sec73-208.pdf)
    // 
    // Transit durations are calculated with speed 20 km/h
    // 
    type: ("straight_line");
};

export type ThroughputItems = {
    // Maximum number of items released per hour.
    items_per_hour: number;
};

export type ThroughputViolationCosts = {
    // Cost per each countable item of handled load exceeding defined depot throughput
    per_count?: number;
    // Cost per an event of depot throughput violation
    per_event?: number;
    // Cost per each kg of handled load exceeding defined depot throughput
    per_kg?: number;
};

export type ThroughputWeight = {
    // Maximum weight released per hour, kilograms.
    weight_per_hour: number;
};

export type TimeConstantDepotThroughput = ThroughputItems | ThroughputWeight;

export type TimeDependentThroughputItems = {
    // Maximum number of items released per hour.
    items_per_hour: number;
    // Time point when throughput value starts to apply, ISO8601 datetime format.
    time_point: string;
};

export type TimeDependentThroughputWeight = {
    // Time point when throughput value starts to apply, ISO8601 datetime format.
    time_point: string;
    // Maximum weight released per hour, kilograms.
    weight_per_hour: number;
};

export type TimeVariableDepotThroughput = TimeVariableThroughputWeightList | TimeVariableThroughputItemsList;

export type TimeVariableThroughputItemsList = TimeDependentThroughputItems[];

export type TimeVariableThroughputWeightList = TimeDependentThroughputWeight[];

export type TimeWindow = {
    // Time window end in ISO-8601 format.
    // 
    // Examples:  
    // `2020-01-02T15:30:00Z` for time in UTC;  
    // `2020-01-02T15:30:00+02:00` for time with timezone.  
    // 
    end: string;
    // Time window start in ISO-8601 format.
    // 
    // Examples:  
    // `2020-01-02T15:30:00Z` for time in UTC;  
    // `2020-01-02T15:30:00+02:00` for time with timezone.
    start: string;
    // Indicates that time window can not be failed, i.e. late or early arrival is not possible.
    strict?: boolean;
};

export type UntimelyOperationsCosts = {
    // Cost per a minute of early operations
    per_early_minute?: number;
    // Cost per an event of untimely operations
    per_event?: number;
    // Cost per a minute of late operations
    per_late_minute?: number;
};

export type UrlCostMatrixReference = {
    // Type of available matrix dimensions, that must appear in cost matrix body.
    // 
    // Following types are supported:
    // * `distance_duration` - transit distance and duration;
    // * `distance_duration_energy` - transit distance, duration and energy spent during the transition
    dimensions?: ("distance_duration" | "distance_duration_energy");
    // Cost matrix specified as remote JSON resource, accessible via HTTPS at specified URL. 
    type: ("url");
    // HTTPS URL of remote JSON resource
    url: string;
};

export type Vehicle = {
    capabilities?: string[];
    capacity?: Capacity;
    costs?: VehicleCosts;
    // Identifier of a depot where vehicle will start and optionally finish the route.
    // 
    // If `depot_id` is not defined and `depots` is defined, vehicle will start the route from the first depot in `depots` list.
    depot_id?: string;
    // Optional identifier of a depot, where vehicle will finish the route. 
    // 
    // Can be defined only if `depot_id` and `depots` are defined, otherwise will be ignored.
    end_depot_id?: string;
    min_load?: MinimiumLoad;
    // Return vehicle to the depot at the end of the route.Will be taken into account only when depot is defined.
    // 
    // Setting `roundtrip` to `false` will force a vehicle to finish the route at last visited site.
    roundtrip?: boolean;
    shifts?: ShiftsDictionary;
};

export type VehicleCosts = {
    moved_load?: MovedLoadCost;
    // Cost of the vehicle, added to total route cost when vehicle is included in a route.
    per_event?: number;
    // Cost for each hour of vehicle transit time
    per_hour?: number;
    // Cost for each kilometer of vehicle transit distance
    per_km?: number;
    // Cost of energy, used during transit to a site.
    // 
    // **Note, that setting `per_kwh` cost requires cost matrix with `energy` dimension.**
    per_kwh?: number;
    // Cost of visiting a site
    per_site?: number;
};

export type VehiclesDictionary = {[id: string] : Vehicle};

export type VehiclesLimitFailureCosts = {
    // Cost per an event of constraint failure
    per_event?: number;
    // Cost per each vehicle not satisfying the constraint
    per_vehicle?: number;
};

export type ZeroCostMatrix = {
    // Cost matrix initialized with zeroes, used for debugging of costs and constraints.
    type: ("zero");
};

export type RouteOptimizationRequest = {
    constraints?: Constraints;
    depots?: DepotsDictionary;
    fleet: VehiclesDictionary;
    // Route optimization options.
    options?: Options;
    sites: SitesDictionary;
    depot?: {
        // Costs of delayed start of a route at the depot.
        // 
        // Vehicles dispatched too late after depot or vehicle shift time window start will result corresponding violation cost added to the total cost of the route.
        delayed_start_costs?: DelayedStartCosts;
        // Duration that vehicle spends at a depot (e.g. goods loading), seconds.
        duration?: number;
        location: GeographicLocation;
        throughput?: DepotThroughput;
        // Costs of violating defined depot throughput.
        // 
        // Added to the total cost of the route when load handled by depot exceeds defined throughput limits.
        throughput_violation_costs?: ThroughputViolationCosts;
        // Time window for depot operations.
        //  
        // Range of time, when depot is allowed to dispatch or accept returning vehicles.
        time_window: TimeWindow;
        // Costs for depot time window violation.
        // 
        // Vehicles dispatched too early (before depot time window start) or returned too late (after time window end) will result violation cost added to the total cost of the route.
        untimely_operations_costs?: UntimelyOperationsCosts;
    };
};

export type Request = RouteOptimizationRequest;

export type AccumulativeStatistics = {
    objective_value?: number;
    // Total vehicle cost
    total_cost: number;
    // Total vehicle cost with all violations
    total_cost_and_penalty: number;
    // Total cost of depot throughput violation
    total_depot_throughput_penalty: number;
    // Total time of all routes (end of latest route - begin of earliest route)
    total_duration: number;
    // Total time spent not performing service at site, and not travelling between sites (`total_duration - total_travel_duration - sum(site.duration)`)
    total_idle_duration: number;
    // Total cost of locality violations
    total_locality_penalty: number;
    // Total load in countable units, moved over distance in kilometers
    total_moved_load_countkm?: number;
    // Total load in kilograms, moved over distance in kilometers
    total_moved_load_kgkm?: number;
    // Total violations cost
    total_penalty: number;
    // Total cost of soft same route sites constraint violation
    total_same_route_penalty: number;
    // Total transit distance for all routes
    total_travel_distance: number;
    // Total time spent in transit for all routes
    total_travel_duration: number;
    // Total transit energy for all routes
    total_travel_energy: number;
    untimely_operations: UntimelyOperationsStatistics;
};

export type DepotRouteWaypoint = {
    // Time of arrival to waypoint, ISO8601 timestamp in UTC format
    arrival_time: string;
    // Time of arrival to waypoint, ISO8601 timestamp in UTC format
    departure_time: string;
    // Duration of job at waypoint (handling goods, performing services, etc), seconds.
    duration: number;
    // Idle time during waypoint visit after arrival and before starting the job, seconds.
    idle_duration: number;
    // Travel distance to waypoint, meters
    travel_distance: number;
    // Travel time to waypoint, seconds
    travel_duration: number;
    // Travel energy to waypoint, kWh
    travel_energy: number;
    // Time of untimely arrival to waypoint, seconds. Negative for early arrival (before `time_window.start`), positive for late arrival (after `time_window.end`)
    untimely_arrival_duration: number;
    depot?: {
        // Costs of delayed start of a route at the depot.
        // 
        // Vehicles dispatched too late after depot or vehicle shift time window start will result corresponding violation cost added to the total cost of the route.
        delayed_start_costs?: DelayedStartCosts;
        // Duration that vehicle spends at a depot (e.g. goods loading), seconds.
        duration?: number;
        // Depot unique ID specified in the request
        id: string;
        location: GeographicLocation;
        throughput?: DepotThroughput;
        // Costs of violating defined depot throughput.
        // 
        // Added to the total cost of the route when load handled by depot exceeds defined throughput limits.
        throughput_violation_costs?: ThroughputViolationCosts;
        // Time window for depot operations.
        //  
        // Range of time, when depot is allowed to dispatch or accept returning vehicles.
        time_window: TimeWindow;
        // Costs for depot time window violation.
        // 
        // Vehicles dispatched too early (before depot time window start) or returned too late (after time window end) will result violation cost added to the total cost of the route.
        untimely_operations_costs?: UntimelyOperationsCosts;
    };
};

export type RouteShift = {
    // A key to define group of shifts that will be balanced by total number of stops or total duration.
    // 
    // See `constraints.balanced_shifts`
    balance_key?: string;
    // Maximum transit distance of the shift, meters.
    // 
    // In case when transit distance of a shift route exceeds defined limit, `distance_limit.failure_costs` are added to the total cost of the route proportionaly to excess distance.
    distance_limit?: ShiftDistanceLimit;
    // Maximum duration of the shift, seconds.
    // 
    // In case when duration of the shift exceeds defined limit, `late_operations_costs` are added to the total cost of the route proportionaly to excess time.
    duration_limit?: number;
    // Maximum transit energy of the shift, kWh.
    // 
    // In case when transit energy of a shift route exceeds defined limit, `energy_limit.failure_costs` are added to the total cost of the route proportionaly to excess energy.
    energy_limit?: ShiftEnergyLimit;
    // Delay between consecutive shifts performed by a vehicle, seconds.
    // 
    // The `gap` value can be used to model fixed-time operations between the shifts, such as swapping the driver, or processing the paperwork at the depot.
    gap?: number;
    // Unique ID of the vehicle shift
    id: string;
    // Cost of late finish of a shift.
    // 
    // Added to total cost of the solution, when shift is finished later than specified shift time window. Does not apply when `time_window.strict = true`.
    late_operations_costs?: LateOperationsCosts;
    // Minimum number of site stops per each shift route.
    // 
    // Note that co-located sites are accounted as one stop, and depot start and end is not counted.
    stops_limit?: ShiftStopsLimit;
    // Time window of a vehicle shift.
    // 
    // Vehicle should finish the route and optionally return to depot by the end of defined shift time window.
    time_window: TimeWindow;
};

export type RouteStatistics = {
    objective_value?: number;
    // Total vehicle cost
    total_cost: number;
    // Total vehicle cost with all violations
    total_cost_and_penalty: number;
    // Total cost of depot throughput violation
    total_depot_throughput_penalty: number;
    // Total time of all routes (end of latest route - begin of earliest route)
    total_duration: number;
    // Total time spent not performing service at site, and not travelling between sites (`total_duration - total_travel_duration - sum(site.duration)`)
    total_idle_duration: number;
    // Total cost of locality violations
    total_locality_penalty: number;
    // Total load in countable units, moved over distance in kilometers
    total_moved_load_countkm?: number;
    // Total load in kilograms, moved over distance in kilometers
    total_moved_load_kgkm?: number;
    // Total violations cost
    total_penalty: number;
    // Total cost of soft same route sites constraint violation
    total_same_route_penalty: number;
    // Total transit distance for all routes
    total_travel_distance: number;
    // Total time spent in transit for all routes
    total_travel_duration: number;
    // Total transit energy for all routes
    total_travel_energy: number;
    untimely_operations: UntimelyOperationsStatistics;
};

export type RouteVehicle = {
    capabilities?: string[];
    capacity?: Capacity;
    costs?: VehicleCosts;
    // Identifier of a depot where vehicle will start and optionally finish the route.
    // 
    // If `depot_id` is not defined and `depots` is defined, vehicle will start the route from the first depot in `depots` list.
    depot_id?: string;
    // Optional identifier of a depot, where vehicle will finish the route. 
    // 
    // Can be defined only if `depot_id` and `depots` are defined, otherwise will be ignored.
    end_depot_id?: string;
    id: string;
    min_load?: MinimiumLoad;
    // Return vehicle to the depot at the end of the route.Will be taken into account only when depot is defined.
    // 
    // Setting `roundtrip` to `false` will force a vehicle to finish the route at last visited site.
    roundtrip?: boolean;
    shifts?: ShiftsDictionary;
};

export type SiteRouteWaypoint = {
    // Time of arrival to waypoint, ISO8601 timestamp in UTC format
    arrival_time: string;
    // Time of arrival to waypoint, ISO8601 timestamp in UTC format
    departure_time: string;
    // Duration of job at waypoint (handling goods, performing services, etc), seconds.
    duration: number;
    // Idle time during waypoint visit after arrival and before starting the job, seconds.
    idle_duration: number;
    // The waypoint shares same geo coordinates and time window with one or more other waypoints, and is a part of co-located sequence in the route.
    // 
    // Co-located waypoints affect the way job duration is calculated, see notes for `duration` above.
    is_colocated?: boolean;
    // Travel distance to waypoint, meters
    travel_distance: number;
    // Travel time to waypoint, seconds
    travel_duration: number;
    // Travel energy to waypoint, kWh
    travel_energy: number;
    // Time of untimely arrival to waypoint, seconds. Negative for early arrival (before `time_window.start`), positive for late arrival (after `time_window.end`)
    untimely_arrival_duration: number;
    site?: {
        // For `pickup` jobs, specifies `id` of destination site for delivery.
        deliver_to?: string;
        // Duration of the job, performed during the site visit, seconds.
        // 
        // Example: time to handle goods or perform services during the site visit.
        duration?: number;
        // Site unique ID specified in the request
        id: string;
        // Type of job performed at a site.
        // 
        // Following types are supported:
        // * `delivery` - goods are picked up at depot and delivered to this site;
        // * `pickup` - goods are picked up at this site and delivered to the site specified in `deliver_to` field or to the depot at the end of the route.
        job?: ("pickup" | "delivery");
        load?: Load;
        // Duration of loading the goods at the depot, seconds.
        // 
        // Will be added to `depot.duration` to adjust time spent by vehicle at the depot.
        loading_duration?: number;
        location: GeographicLocation;
        // Time before the job during the site visit, seconds.
        // 
        // For co-located sites, will only be accounted for the first site in sequence.
        // 
        // Example: parking time or time for security clearance during site visit, which will happen once if several sites share the same geo coordinates and time window ("co-located").
        preparing_duration?: number;
        required_capabilities?: string[];
        // Ensure that sites with equal `same_route_key` will appear on the same route.
        // 
        // Note that all unique `same_route_key` values must be also specified at `constraints.same_route_sites`.
        same_route_key?: string;
        // The range of time when a visit to the site is allowed.
        time_window: TimeWindow;
        // Cost of non-performing a visit.
        unperformed_cost?: number;
        // Costs of untimely arrival to the site.
        // 
        // When vehicle arrives to the site too early or too late in respect with the site time window, the corresponding cost is added to the overall cost of the route.
        untimely_operations_costs?: UntimelyOperationsCosts;
    };
};

export type SolutionStatistics = {
    // Number of vehicles utilized in solution routes
    employed_vehicles_count: number;
    // (internal) solution objective value
    objective_value: number;
    // Total vehicle cost
    total_cost: number;
    // Total vehicle cost with all violations
    total_cost_and_penalty: number;
    // Total cost of depot throughput violation
    total_depot_throughput_penalty: number;
    // Total time of all routes (end of latest route - begin of earliest route)
    total_duration: number;
    // Total time spent not performing service at site, and not travelling between sites (`total_duration - total_travel_duration - sum(site.duration)`)
    total_idle_duration: number;
    // Total cost of locality violations
    total_locality_penalty: number;
    // Total load in countable units, moved over distance in kilometers
    total_moved_load_countkm?: number;
    // Total load in kilograms, moved over distance in kilometers
    total_moved_load_kgkm?: number;
    // Total violations cost
    total_penalty: number;
    // Total cost of soft same route sites constraint violation
    total_same_route_penalty: number;
    // Total transit distance for all routes
    total_travel_distance: number;
    // Total time spent in transit for all routes
    total_travel_duration: number;
    // Total transit energy for all routes
    total_travel_energy: number;
    // Number of sites not included in route due to constraints and shortage of vehicles
    unserved_count: number;
    untimely_operations: UntimelyOperationsStatistics;
};

export type UnservedSite = {
    // Reason for site left unserved.
    reason: string;
    // Unserved site definition
    site: Site;
};

export type UnservedSitesDictionary = {[id: string] : UnservedSite};

export type UntimelyOperationsStatistics = {
    // Sum of time deltas for early arrivals (`sum(|arrival_time - site.time_window.start|)`)
    early_duration: number;
    // Number of sites with early arrival (`arrival_time < site.time_window.start`)
    early_sites_count: number;
    // Sum of time deltas for late arrivals (`sum(|arrival_time - time_window.end|)`)
    late_duration: number;
    // Number of sites with early arrival (`arrival_time > time_window.end`)
    late_sites_count: number;
    // Sum of time deltas for untimely arrivals (`sum(|arrival_time - time_window.start|) + sim(|arrival_time - time_window.end|)`
    total_duration: number;
    // Number of sites with untimely (late or early) arrival
    total_sites_count: number;
};

export type VehicleRoute = {
    // Vehicle shift chosen for the route
    active_shift?: RouteShift;
    // Route statistics
    statistics: RouteStatistics;
    // Vehicle on route
    vehicle: RouteVehicle;
    waypoints: DepotRouteWaypoint[] | SiteRouteWaypoint[];
};

export type RouteOptimizationSolution = {
    constraints?: Constraints;
    depots?: DepotsDictionary;
    // Fleet of available vehicles to visit sites.
    fleet: VehiclesDictionary;
    // Route optimization options.
    options: Options;
    routes: VehicleRoute[];
    // Statistics on optimized routes
    statistics: SolutionStatistics;
    // Unserved sites, not planned as a part of any route.
    unserved?: UnservedSitesDictionary;
    depot?: {
        // Costs of delayed start of a route at the depot.
        // 
        // Vehicles dispatched too late after depot or vehicle shift time window start will result corresponding violation cost added to the total cost of the route.
        delayed_start_costs?: DelayedStartCosts;
        // Duration that vehicle spends at a depot (e.g. goods loading), seconds.
        duration?: number;
        location: GeographicLocation;
        throughput?: DepotThroughput;
        // Costs of violating defined depot throughput.
        // 
        // Added to the total cost of the route when load handled by depot exceeds defined throughput limits.
        throughput_violation_costs?: ThroughputViolationCosts;
        // Time window for depot operations.
        //  
        // Range of time, when depot is allowed to dispatch or accept returning vehicles.
        time_window: TimeWindow;
        // Costs for depot time window violation.
        // 
        // Vehicles dispatched too early (before depot time window start) or returned too late (after time window end) will result violation cost added to the total cost of the route.
        untimely_operations_costs?: UntimelyOperationsCosts;
    };
};

export type Response = RouteOptimizationSolution;

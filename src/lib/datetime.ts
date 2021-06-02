import * as luxon from 'luxon';

function formatTime(ts: luxon.DateTime): string
{
    if (ts.second != 0) {
        return ts.toFormat('HH:mm:ss');
    }
    return ts.toFormat('HH:mm');
}

export function parseISO(ts: string): luxon.DateTime
{
    for(let formatAndZone of FORMAT_ZONES) {
        let zoneTs = luxon.DateTime.fromFormat(
            ts.trim(),
            formatAndZone.format,
            formatAndZone.zone
                ? {zone: formatAndZone.zone, setZone: true}
                : {setZone: true}
        );
        if (zoneTs.isValid) {
            return zoneTs;
        }
    }

    return luxon.DateTime.invalid("Unparseable time `" + ts + "`");
}

export function timestampToTime(ts: string, date: string, zone: string, skipOnError?: boolean): string
{
    let zoneTs = parseISO(ts);
    if (!zoneTs.isValid && skipOnError) {
        return ts;
    }

    zoneTs = zoneTs.setZone(zone);
    const zoneDate = luxon.DateTime.fromISO(date, {zone: zone});

    const relDiff = zoneDate.diff(zoneTs!, 'days');
    const daysDiff = -Math.ceil(relDiff.days);

    if (daysDiff != 0) {
        const sign = daysDiff > 0 ? '+' : '';
        return formatTime(zoneTs!) + ' ' + sign + daysDiff + 'd';
    }
    return formatTime(zoneTs!);
}

const MAX_RELATIVE_DAYS = 100;

export function timeToDuration(time: string, zone: string): luxon.Duration
{
    let parsed = luxon.DateTime.fromFormat(time, 'HH:mm', {zone});
    if (!parsed.isValid) {
        parsed = luxon.DateTime.fromFormat(time, 'HH:mm:ss', {zone});
    }

    if (parsed.isValid) {
        return luxon.Duration.fromObject({
            hours: parsed.hour,
            minutes: parsed.minute,
            seconds: parsed.second
        });
    }

    const isTomorrow = time.includes('+'), isYesterday = time.includes('-');
    if (!isTomorrow && !isYesterday) {
        throw new Error("Time can't be parsed from HH:mm or HH:mm:ss formats");
    }

    const parts = time.split(/\+|-/);
    if (parts.length != 2) {
        throw new Error('Relative time must end with number prefixed by "+" or "-" sign followed by letter "d", example: "+1d"');
    }

    if (!parts[1].endsWith('d') && !parts[1].endsWith('D')) {
        throw new Error('Relative time must end with number prefixed by "+" or "-" sign followed by letter "d", example: "+1d"');
    }

    parts[1] = parts[1].substr(0, parts[1].length - 1);

    const days = parseInt(parts[1]);
    if (!isFinite(days)) {
        throw new Error("Relative time day is invalid");
    }
    if (days > MAX_RELATIVE_DAYS) {
        throw new Error(`Maximum relative day offset is ${MAX_RELATIVE_DAYS} days`);
    }

    try
    {
        let result = timeToDuration(parts[0].trim(), zone).plus({
            days: isYesterday ? -days : days
        });
        if (!result.isValid) {
            throw new Error(`Time part of relative datetime time is incorrect, ${result.invalidExplanation}`);
        }
        return result;
    } catch(e) {
        if (e instanceof Error) {
            throw new Error(`Time part of relative datetime time is incorrect, ${e.message}`);
        }
    }

    return luxon.Duration.invalid('Invalid state');
}

export const ISO_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ssZZ";
export const ISO_TIME_FORMAT_MS = "yyyy-MM-dd'T'HH:mm:ss.uZZ";
export const ISO_TIME_FORMAT_UTC = "yyyy-MM-dd'T'HH:mm:ss'Z'";
export const ISO_TIME_FORMAT_MS_UTC = "yyyy-MM-dd'T'HH:mm:ss.u'Z'";

export const FORMAT_ZONES: {format: string, zone?: string}[] = [
    {format: ISO_TIME_FORMAT_UTC, zone: 'UTC'},
    {format: ISO_TIME_FORMAT_MS_UTC, zone: 'UTC'},
    {format: ISO_TIME_FORMAT},
    {format: ISO_TIME_FORMAT_MS}
];

export function timeToTimestamp(time: string, date: string, zone: string): string
{
    const relOffset = timeToDuration(time.trim(), zone);
    const zoneDate = luxon.DateTime.fromISO(date, {zone});

    return zoneDate.plus(relOffset).toFormat(ISO_TIME_FORMAT);
}

export function timeToTimestampValidate(time: string, date: string, zone: string): [string, string]
{
    let value = time;
    let error = '';
    try {
        value = timeToTimestamp(time, date, zone);
    }
    catch(e) {
        if (e instanceof Error) {
            value = time;
            error = e.message; 
        }
    }
    return [value, error]
}

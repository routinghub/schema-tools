import * as dt from './datetime';

test('datetime should convert relative time', () =>
{
    const TZ_LISBON = 'Europe/Lisbon';
    const TZ_MOSCOW = 'Europe/Moscow';
    const DATE_LISBON_GMT_0 = '2018-02-01';
    const DATE_LISBON_GMT_1 = '2018-06-01';
    
    expect(dt.timestampToTime('2018-02-02T14:00:00.000+03:00', DATE_LISBON_GMT_0, TZ_LISBON)).toBe('11:00 +1d');
    expect(dt.timestampToTime('2018-02-01T14:00:00.000+03:00', DATE_LISBON_GMT_0, TZ_LISBON)).toBe('11:00');
    expect(dt.timestampToTime('2018-01-31T14:00:10.000+03:00', DATE_LISBON_GMT_0, TZ_LISBON)).toBe('11:00:10 -1d');

    expect(dt.timeToTimestamp('11:00 -1d', DATE_LISBON_GMT_0, TZ_MOSCOW)).toBe('2018-01-31T11:00:00+03:00');
    expect(dt.timeToTimestamp('11:00 -1d', DATE_LISBON_GMT_0, TZ_LISBON)).toBe('2018-01-31T11:00:00+00:00');
    expect(dt.timeToTimestamp('11:00 -1d', DATE_LISBON_GMT_1, TZ_LISBON)).toBe('2018-05-31T11:00:00+01:00');
});

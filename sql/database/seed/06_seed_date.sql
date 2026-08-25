USE shopsphere360;

INSERT INTO dim_date
(
    DateKey,
    FullDate,
    Day,
    Month,
    MonthName,
    Quarter,
    Year,
    Week,
    DayOfWeek,
    IsWeekend
)
WITH RECURSIVE calendar AS
(
    SELECT DATE('2023-01-01') AS FullDate

    UNION ALL

    SELECT DATE_ADD(FullDate, INTERVAL 1 DAY)
    FROM calendar
    WHERE FullDate < '2026-12-31'
)
SELECT
    YEAR(FullDate) * 10000
        + MONTH(FullDate) * 100
        + DAY(FullDate) AS DateKey,

    FullDate,

    DAY(FullDate) AS Day,

    MONTH(FullDate) AS Month,

    MONTHNAME(FullDate) AS MonthName,

    QUARTER(FullDate) AS Quarter,

    YEAR(FullDate) AS Year,

    WEEK(FullDate, 1) AS Week,

    DAYNAME(FullDate) AS DayOfWeek,

    CASE
        WHEN DAYOFWEEK(FullDate) IN (1, 7)
        THEN 1
        ELSE 0
    END AS IsWeekend

FROM calendar;
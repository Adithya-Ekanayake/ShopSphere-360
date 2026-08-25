USE shopsphere360;

INSERT INTO dim_customer
(
    CustomerID,
    FirstName,
    LastName,
    Gender,
    Age,
    SignupDate,
    CustomerSegment,
    AcquisitionChannel,
    City,
    Country
)
WITH RECURSIVE customer_numbers AS
(
    SELECT 1 AS n

    UNION ALL

    SELECT n + 1
    FROM customer_numbers
    WHERE n < 500
)
SELECT
    CONCAT('C', LPAD(n, 4, '0')) AS CustomerID,

    CASE MOD(n, 20)
        WHEN 0 THEN 'Kasun'
        WHEN 1 THEN 'Nimal'
        WHEN 2 THEN 'Sahan'
        WHEN 3 THEN 'Tharindu'
        WHEN 4 THEN 'Dilan'
        WHEN 5 THEN 'Chamod'
        WHEN 6 THEN 'Ravindu'
        WHEN 7 THEN 'Isuru'
        WHEN 8 THEN 'Pasindu'
        WHEN 9 THEN 'Kavindu'
        WHEN 10 THEN 'Ayesha'
        WHEN 11 THEN 'Tharushi'
        WHEN 12 THEN 'Nethmi'
        WHEN 13 THEN 'Hansika'
        WHEN 14 THEN 'Sachini'
        WHEN 15 THEN 'Dilki'
        WHEN 16 THEN 'Piumi'
        WHEN 17 THEN 'Nadeesha'
        WHEN 18 THEN 'Shenali'
        ELSE 'Hiruni'
    END AS FirstName,

    CASE MOD(n, 15)
        WHEN 0 THEN 'Perera'
        WHEN 1 THEN 'Fernando'
        WHEN 2 THEN 'Silva'
        WHEN 3 THEN 'Bandara'
        WHEN 4 THEN 'Jayasinghe'
        WHEN 5 THEN 'Rathnayake'
        WHEN 6 THEN 'Wijesinghe'
        WHEN 7 THEN 'Gunawardena'
        WHEN 8 THEN 'Dissanayake'
        WHEN 9 THEN 'Karunaratne'
        WHEN 10 THEN 'Ekanayake'
        WHEN 11 THEN 'Senanayake'
        WHEN 12 THEN 'Rajapaksha'
        WHEN 13 THEN 'Herath'
        ELSE 'Wickramasinghe'
    END AS LastName,

    CASE
        WHEN MOD(n, 2) = 0 THEN 'Female'
        ELSE 'Male'
    END AS Gender,

    18 + MOD(n * 7, 48) AS Age,

    DATE_ADD(
        '2023-01-01',
        INTERVAL MOD(n * 13, 1200) DAY
    ) AS SignupDate,

    CASE MOD(n, 4)
        WHEN 0 THEN 'Premium'
        WHEN 1 THEN 'Regular'
        WHEN 2 THEN 'Occasional'
        ELSE 'New'
    END AS CustomerSegment,

    CASE MOD(n, 6)
        WHEN 0 THEN 'Social Media'
        WHEN 1 THEN 'Search'
        WHEN 2 THEN 'Email'
        WHEN 3 THEN 'Referral'
        WHEN 4 THEN 'Direct'
        ELSE 'Paid Ads'
    END AS AcquisitionChannel,

    CASE MOD(n, 10)
        WHEN 0 THEN 'Colombo'
        WHEN 1 THEN 'Kandy'
        WHEN 2 THEN 'Galle'
        WHEN 3 THEN 'Jaffna'
        WHEN 4 THEN 'Negombo'
        WHEN 5 THEN 'Kurunegala'
        WHEN 6 THEN 'Matara'
        WHEN 7 THEN 'Nuwara Eliya'
        WHEN 8 THEN 'Batticaloa'
        ELSE 'Anuradhapura'
    END AS City,

    'Sri Lanka' AS Country

FROM customer_numbers;
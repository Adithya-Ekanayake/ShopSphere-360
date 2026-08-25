USE shopsphere360;

INSERT INTO dim_campaign
    (
        CampaignID,
        CampaignName,
        CampaignType,
        Objective,
        StartDate,
        EndDate,
        Budget
    )
VALUES
    (
        'CMP001',
        'New Year Mega Sale',
        'Seasonal',
        'Increase Sales',
        '2026-01-01',
        '2026-01-15',
        150000.00
    ),
    (
        'CMP002',
        'Valentine Special',
        'Seasonal',
        'Increase Conversions',
        '2026-02-01',
        '2026-02-14',
        100000.00
    ),
    (
        'CMP003',
        'Avurudu Deals',
        'Seasonal',
        'Increase Sales',
        '2026-04-01',
        '2026-04-20',
        200000.00
    ),
    (
        'CMP004',
        'Summer Collection',
        'Product',
        'Promote Products',
        '2026-05-01',
        '2026-05-31',
        175000.00
    ),
    (
        'CMP005',
        'Mid Year Sale',
        'Promotional',
        'Increase Revenue',
        '2026-06-01',
        '2026-06-30',
        250000.00
    ),
    (
        'CMP006',
        'Back to School',
        'Seasonal',
        'Acquire Customers',
        '2026-07-01',
        '2026-07-31',
        180000.00
    ),
    (
        'CMP007',
        'Monsoon Deals',
        'Promotional',
        'Increase Sales',
        '2026-08-01',
        '2026-08-31',
        160000.00
    ),
    (
        'CMP008',
        'Festival Shopping',
        'Seasonal',
        'Increase Revenue',
        '2026-09-01',
        '2026-09-30',
        220000.00
    ),
    (
        'CMP009',
        'Black Friday',
        'Promotional',
        'Maximize Revenue',
        '2026-11-20',
        '2026-11-30',
        350000.00
    ),
    (
        'CMP010',
        'Christmas Deals',
        'Seasonal',
        'Increase Sales',
        '2026-12-01',
        '2026-12-25',
        300000.00
    );
USE shopsphere360;

INSERT INTO dim_channel
    (ChannelName, ChannelType, Platform)
VALUES
    ('Website', 'Online', 'ShopSphere Website'),
    ('Mobile App', 'Online', 'ShopSphere Mobile App'),
    ('Facebook', 'Online', 'Facebook'),
    ('Instagram', 'Online', 'Instagram'),
    ('Google Search', 'Online', 'Google'),
    ('Email', 'Online', 'Email Marketing'),
    ('Affiliate', 'Online', 'Affiliate Network'),
    ('Marketplace', 'Online', 'External Marketplace'),
    ('Physical Store', 'Offline', 'ShopSphere Store');
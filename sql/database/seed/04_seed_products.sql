USE shopsphere360;

INSERT INTO dim_product
(
    ProductID,
    ProductName,
    Category,
    Subcategory,
    Brand,
    Supplier,
    UnitCost,
    UnitPrice
)
VALUES
('P002', 'Smartphone 128GB', 'Electronics', 'Mobile Phones', 'NovaTech', 'Digital World', 72000.00, 89990.00),
('P003', 'USB-C Fast Charger', 'Electronics', 'Accessories', 'PowerPro', 'TechSource Lanka', 1800.00, 2990.00),
('P004', 'Wireless Mouse', 'Electronics', 'Computer Accessories', 'Logitech', 'Computer Hub', 2800.00, 4490.00),
('P005', 'Mechanical Gaming Keyboard', 'Electronics', 'Computer Accessories', 'RedDragon', 'Computer Hub', 7500.00, 11990.00),
('P006', 'Smart Watch', 'Electronics', 'Wearables', 'FitTech', 'Digital World', 9500.00, 14990.00),
('P007', 'Portable Bluetooth Speaker', 'Electronics', 'Audio', 'SoundMax', 'TechSource Lanka', 5200.00, 8490.00),
('P008', 'Power Bank 20000mAh', 'Electronics', 'Mobile Accessories', 'PowerPro', 'Digital World', 4200.00, 6990.00),

('P009', 'Classic Cotton T-Shirt', 'Fashion', 'Men Clothing', 'UrbanWear', 'Fashion Hub', 1600.00, 2990.00),
('P010', 'Slim Fit Jeans', 'Fashion', 'Men Clothing', 'DenimCo', 'Fashion Hub', 4200.00, 6990.00),
('P011', 'Casual Hoodie', 'Fashion', 'Men Clothing', 'UrbanWear', 'StyleSource', 3800.00, 6490.00),
('P012', 'Floral Summer Dress', 'Fashion', 'Women Clothing', 'Elegance', 'StyleSource', 3500.00, 5990.00),
('P013', 'Women''s Handbag', 'Fashion', 'Accessories', 'Elegance', 'Fashion Hub', 4200.00, 7490.00),
('P014', 'Running Shoes', 'Fashion', 'Footwear', 'SportX', 'Sports Lanka', 5500.00, 8990.00),
('P015', 'Casual Sneakers', 'Fashion', 'Footwear', 'UrbanStep', 'Sports Lanka', 4800.00, 7990.00),

('P016', 'Stainless Steel Water Bottle', 'Home & Kitchen', 'Kitchenware', 'HomePlus', 'Lanka Distributors', 1200.00, 2290.00),
('P017', 'Non-Stick Frying Pan', 'Home & Kitchen', 'Cookware', 'KitchenPro', 'Lanka Distributors', 2800.00, 4490.00),
('P018', 'Electric Kettle', 'Home & Kitchen', 'Appliances', 'HomePlus', 'Appliance World', 4200.00, 6990.00),
('P019', 'Coffee Maker', 'Home & Kitchen', 'Appliances', 'BrewMaster', 'Appliance World', 8500.00, 12990.00),
('P020', 'LED Desk Lamp', 'Home & Kitchen', 'Lighting', 'BrightHome', 'Lanka Distributors', 1800.00, 3290.00),
('P021', 'Bed Sheet Set', 'Home & Kitchen', 'Bedding', 'ComfortLiving', 'HomeStyle', 3200.00, 5490.00),
('P022', 'Decorative Wall Clock', 'Home & Kitchen', 'Home Decor', 'HomeStyle', 'HomeStyle', 2200.00, 3990.00),

('P023', 'Face Moisturizer', 'Beauty', 'Skincare', 'GlowCare', 'BeautyWorld', 1800.00, 3290.00),
('P024', 'Vitamin C Serum', 'Beauty', 'Skincare', 'GlowCare', 'BeautyWorld', 2500.00, 4490.00),
('P025', 'Shampoo 500ml', 'Beauty', 'Haircare', 'HairPro', 'BeautyWorld', 1400.00, 2490.00),
('P026', 'Hair Conditioner', 'Beauty', 'Haircare', 'HairPro', 'BeautyWorld', 1300.00, 2390.00),
('P027', 'Perfume 100ml', 'Beauty', 'Fragrance', 'AromaLux', 'Cosmetic House', 4800.00, 7990.00),
('P028', 'Makeup Foundation', 'Beauty', 'Makeup', 'BeautyGlow', 'Cosmetic House', 3200.00, 5490.00),

('P029', 'Yoga Mat', 'Sports', 'Fitness', 'FitLife', 'Sports Lanka', 1800.00, 3290.00),
('P030', 'Adjustable Dumbbells', 'Sports', 'Fitness', 'FitLife', 'Sports Lanka', 6500.00, 9990.00),
('P031', 'Football', 'Sports', 'Outdoor Sports', 'SportX', 'Sports Lanka', 2200.00, 3990.00),
('P032', 'Cricket Bat', 'Sports', 'Cricket', 'ProCricket', 'Sports Lanka', 5500.00, 8990.00),
('P033', 'Tennis Racket', 'Sports', 'Tennis', 'ProSport', 'Sports Lanka', 6200.00, 9990.00),

('P034', 'Business Strategy Book', 'Books', 'Business', 'KnowledgePress', 'BookWorld', 1800.00, 2990.00),
('P035', 'Data Analytics Handbook', 'Books', 'Technology', 'TechBooks', 'BookWorld', 3200.00, 4990.00),
('P036', 'Programming Fundamentals', 'Books', 'Technology', 'TechBooks', 'BookWorld', 2800.00, 4490.00),
('P037', 'Premium Notebook', 'Stationery', 'Notebooks', 'WriteWell', 'OfficeMart', 450.00, 890.00),
('P038', 'Gel Pen Set', 'Stationery', 'Writing', 'WriteWell', 'OfficeMart', 350.00, 690.00),
('P039', 'Desk Organizer', 'Stationery', 'Office Supplies', 'OfficePro', 'OfficeMart', 900.00, 1590.00),

('P040', 'Premium Coffee 250g', 'Grocery', 'Beverages', 'BeanHouse', 'FreshMart', 1100.00, 1890.00),
('P041', 'Green Tea 100 Bags', 'Grocery', 'Beverages', 'TeaGarden', 'FreshMart', 900.00, 1590.00),
('P042', 'Organic Rice 5kg', 'Grocery', 'Staples', 'NatureFarm', 'AgroFoods', 1400.00, 2290.00),
('P043', 'Mixed Nuts 500g', 'Grocery', 'Snacks', 'NutriChoice', 'FreshMart', 1800.00, 2990.00),
('P044', 'Organic Honey 500ml', 'Grocery', 'Natural Foods', 'NatureFarm', 'AgroFoods', 1600.00, 2790.00),

('P045', 'Leather Wallet', 'Accessories', 'Wallets', 'LeatherCraft', 'Fashion Hub', 2200.00, 3990.00),
('P046', 'Sunglasses', 'Accessories', 'Eyewear', 'VisionStyle', 'Fashion Hub', 2800.00, 4990.00),
('P047', 'Travel Backpack', 'Accessories', 'Bags', 'TravelPro', 'Lanka Distributors', 4200.00, 6990.00),
('P048', 'Travel Luggage 24 inch', 'Accessories', 'Travel', 'TravelPro', 'Lanka Distributors', 8500.00, 13990.00),

('P049', 'Baby Cotton Romper', 'Baby & Kids', 'Baby Clothing', 'LittleOne', 'KidsWorld', 1200.00, 2290.00),
('P050', 'Educational Building Blocks', 'Baby & Kids', 'Toys', 'SmartKids', 'KidsWorld', 2200.00, 3990.00);
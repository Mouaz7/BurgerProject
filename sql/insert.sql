USE burger;


-- Ladda data från CSV-filer till ingredients
LOAD DATA LOCAL INFILE 'ingredients_table.csv'
INTO TABLE ingredients
FIELDS TERMINATED BY ',' ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(ingredient_id, ingredient_name, unit, price);

DELETE FROM burgers;

-- Ladda data från CSV-filer till burgers
LOAD DATA LOCAL INFILE 'burgers_table.csv'
INTO TABLE burgers
FIELDS TERMINATED BY ',' ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(burger_id, burger_name, burger_price);

-- Ladda data från CSV-filer till burger_ingredients
LOAD DATA LOCAL INFILE 'burger_ingredients_table.csv'
INTO TABLE burger_ingredients
FIELDS TERMINATED BY ',' ENCLOSED BY '"' 
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(burger_id, ingredient_id, quantity);
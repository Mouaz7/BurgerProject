USE burger;

-- Ta bort existerande tabeller för att återställa databasen
DROP TABLE IF EXISTS finalburger_ingredients;
DROP TABLE IF EXISTS finalburgers;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customburger_ingredients;
DROP TABLE IF EXISTS customburgers;
DROP TABLE IF EXISTS burger_ingredients;
DROP TABLE IF EXISTS burgers;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS customers;

-- Skapa tabeller med rätt struktur
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL DEFAULT 'None'
);

CREATE TABLE ingredients (
    ingredient_id INT PRIMARY KEY AUTO_INCREMENT,
    ingredient_name VARCHAR(255) NOT NULL,
    unit VARCHAR(50),         -- Lägg till enhetskolumnen för att matcha CSV-filen
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE burgers (
    burger_id INT PRIMARY KEY AUTO_INCREMENT,
    burger_name VARCHAR(255) NOT NULL,
    burger_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE burger_ingredients (
    burger_id INT,
    ingredient_id INT,
    quantity INT DEFAULT 1, -- Lägg till kvantitet om den behövs för burger_ingredients-tabellen
    PRIMARY KEY (burger_id, ingredient_id),
    FOREIGN KEY (burger_id) REFERENCES burgers(burger_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
);

CREATE TABLE customburgers (
    custom_burger_id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255),
    burger_id INT,
    custom_name VARCHAR(255),
    total_price DECIMAL(10, 2),
    FOREIGN KEY (burger_id) REFERENCES burgers(burger_id) ON DELETE CASCADE
);

CREATE TABLE customburger_ingredients (
    custom_burger_id INT,
    ingredient_id INT,
    quantity INT DEFAULT 1,
    PRIMARY KEY (custom_burger_id, ingredient_id),
    FOREIGN KEY (custom_burger_id) REFERENCES customburgers(custom_burger_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    custom_burger_id INT,
    total_price DECIMAL(10, 2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (custom_burger_id) REFERENCES customburgers(custom_burger_id) ON DELETE CASCADE
);

CREATE TABLE finalburgers (
    final_burger_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    custom_burger_name VARCHAR(255),
    total_price DECIMAL(10, 2),
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

CREATE TABLE finalburger_ingredients (
    final_burger_id INT,
    ingredient_id INT,
    quantity INT DEFAULT 1,
    PRIMARY KEY (final_burger_id, ingredient_id),
    FOREIGN KEY (final_burger_id) REFERENCES finalburgers(final_burger_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
);
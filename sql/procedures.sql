USE burger;

-- Procedur för att hämta alla fördefinierade hamburgare med pris
DELIMITER //
CREATE PROCEDURE get_all_burgers()
BEGIN
    SELECT 
        b.burger_id, 
        b.burger_name, 
        COALESCE(SUM(i.price), 0) AS burger_price
    FROM 
        burgers b
    LEFT JOIN 
        burger_ingredients bi ON b.burger_id = bi.burger_id
    LEFT JOIN 
        ingredients i ON bi.ingredient_id = i.ingredient_id
    GROUP BY 
        b.burger_id, b.burger_name;
END //
DELIMITER ;

-- Procedur för att hämta ingredienser för en specifik hamburgare
DELIMITER //
CREATE PROCEDURE get_burger_ingredients(IN selected_burger_id INT)
BEGIN
    SELECT 
        i.ingredient_id, 
        i.ingredient_name, 
        COALESCE(i.price, 0) AS ingredient_price -- Använd alias här
    FROM ingredients i
    JOIN burger_ingredients bi ON i.ingredient_id = bi.ingredient_id
    WHERE bi.burger_id = selected_burger_id;
END //
DELIMITER ;

-- Procedur för att skapa en anpassad hamburgare
DELIMITER //
CREATE PROCEDURE create_custom_burger(IN session_id VARCHAR(255), IN burger_id INT)
BEGIN
    IF burger_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'burger_id kan inte vara NULL';
    END IF;

    INSERT INTO customburgers (session_id, burger_id, custom_name)
    SELECT session_id, b.burger_id, b.burger_name
    FROM burgers b
    WHERE b.burger_id = burger_id;

    SET @custom_burger_id = LAST_INSERT_ID();

    INSERT INTO customburger_ingredients (custom_burger_id, ingredient_id, quantity)
    SELECT @custom_burger_id, i.ingredient_id, 1
    FROM ingredients i
    JOIN burger_ingredients bi ON i.ingredient_id = bi.ingredient_id
    WHERE bi.burger_id = burger_id;

    SELECT @custom_burger_id AS custom_burger_id;
END //
DELIMITER ;

-- Procedur för att hämta ingredienser i en anpassad hamburgare
DELIMITER //
CREATE PROCEDURE get_custom_burger_ingredients(IN custom_burger_id INT)
BEGIN
    SELECT 
        i.ingredient_id, 
        i.ingredient_name, 
        COALESCE(i.price, 0) AS ingredient_price, -- Använd alias här
        cbi.quantity
    FROM ingredients i
    JOIN customburger_ingredients cbi ON i.ingredient_id = cbi.ingredient_id
    WHERE cbi.custom_burger_id = custom_burger_id;
END //
DELIMITER ;

-- Procedur för att minska mängden av en ingrediens i en anpassad hamburgare
DELIMITER //
CREATE PROCEDURE reduce_custom_burger_ingredient_quantity(IN custom_burger_id_in INT, IN ingredient_id_in INT)
BEGIN
    UPDATE customburger_ingredients
    SET quantity = IF(quantity > 1, quantity - 1, 0)
    WHERE custom_burger_id = custom_burger_id_in AND ingredient_id = ingredient_id_in;

    DELETE FROM customburger_ingredients 
    WHERE custom_burger_id = custom_burger_id_in AND ingredient_id = ingredient_id_in AND quantity = 0;
END //
DELIMITER ;

-- Procedur för att öka mängden av en ingrediens i en anpassad hamburgare
DELIMITER //
CREATE PROCEDURE increase_custom_burger_ingredient_quantity(IN custom_burger_id_in INT, IN ingredient_id_in INT)
BEGIN
    DECLARE qty INT;
    SELECT quantity INTO qty FROM customburger_ingredients WHERE custom_burger_id = custom_burger_id_in AND ingredient_id = ingredient_id_in;
    IF qty IS NULL THEN
        INSERT INTO customburger_ingredients (custom_burger_id, ingredient_id, quantity)
        VALUES (custom_burger_id_in, ingredient_id_in, 1);
    ELSE
        UPDATE customburger_ingredients
        SET quantity = quantity + 1
        WHERE custom_burger_id = custom_burger_id_in AND ingredient_id = ingredient_id_in;
    END IF;
END //
DELIMITER ;

-- Procedur för att lägga till en ny beställning
DELIMITER //
CREATE PROCEDURE add_order(IN customerID INT, IN customBurgerID INT, IN totalPrice DECIMAL(10, 2))
BEGIN
    INSERT INTO orders (customer_id, custom_burger_id, total_price, status) 
    VALUES (customerID, customBurgerID, totalPrice, 'pending');
END //
DELIMITER ;

-- Procedur för att hämta alla beställningar
DELIMITER //
CREATE PROCEDURE get_all_orders()
BEGIN
    SELECT 
        o.order_id,
        c.name AS customer_name,
        cb.custom_name AS burger_name,
        o.total_price,
        o.order_time,
        GROUP_CONCAT(CONCAT(i.ingredient_name, ' (x', cbi.quantity, ')') SEPARATOR ', ') AS ingredients,
        o.status
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN customburgers cb ON o.custom_burger_id = cb.custom_burger_id
    JOIN customburger_ingredients cbi ON cb.custom_burger_id = cbi.custom_burger_id
    JOIN ingredients i ON cbi.ingredient_id = i.ingredient_id
    GROUP BY o.order_id
    ORDER BY o.order_time DESC;
END //
DELIMITER ;

-- Procedur för att hämta finaliserade beställningar
DELIMITER //
CREATE PROCEDURE get_finalized_orders()
BEGIN
    SELECT 
        o.order_id,
        c.name AS customer_name,
        cb.custom_name AS burger_name,
        o.total_price,
        o.order_time,
        GROUP_CONCAT(CONCAT(i.ingredient_name, ' (x', cbi.quantity, ')') SEPARATOR ', ') AS ingredients
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN customburgers cb ON o.custom_burger_id = cb.custom_burger_id
    JOIN customburger_ingredients cbi ON cb.custom_burger_id = cbi.custom_burger_id
    JOIN ingredients i ON cbi.ingredient_id = i.ingredient_id
    WHERE o.status = 'pending'
    GROUP BY o.order_id
    ORDER BY o.order_time DESC;
END //
DELIMITER ;

-- Procedur för att slutföra en beställning
DELIMITER //
CREATE PROCEDURE complete_order(IN orderID INT)
BEGIN
    UPDATE orders
    SET status = 'completed'
    WHERE order_id = orderID;
END //
DELIMITER ;

-- Procedur för att radera en beställning
DELIMITER //
CREATE PROCEDURE delete_order(IN orderID INT)
BEGIN
    -- Hämta custom_burger_id innan radering
    DECLARE customBurgerID INT;
    SELECT custom_burger_id INTO customBurgerID FROM orders WHERE order_id = orderID;

    -- Ta bort beställningen
    DELETE FROM orders WHERE order_id = orderID;

    -- Ta bort ingredienser kopplade till den anpassade burgaren
    DELETE FROM customburger_ingredients WHERE custom_burger_id = customBurgerID;

    -- Ta bort den anpassade burgaren
    DELETE FROM customburgers WHERE custom_burger_id = customBurgerID;
END //
DELIMITER ;

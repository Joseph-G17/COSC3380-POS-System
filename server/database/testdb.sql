
-- Host:                         127.0.0.1
-- Server version:               8.4.11 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             12.21.1.1
-- --------------------------------------------------------

-- Added for Azure: create the database and select it before the tables are created.
CREATE DATABASE IF NOT EXISTS `COSC3380-PoS` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `COSC3380-PoS`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table COSC3380-PoS.Addresses
CREATE TABLE IF NOT EXISTS `Addresses` (
  `AddressID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `CustomerID` bigint unsigned NOT NULL,
  `Country` varchar(37) DEFAULT NULL,
  `State` varchar(18) DEFAULT NULL,
  `City` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Zipcode` mediumint unsigned DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `AddressType` enum('Billing','Shipping','Both') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`AddressID`),
  KEY `CustomerID` (`CustomerID`),
  CONSTRAINT `CustomerID-Addresses` FOREIGN KEY (`CustomerID`) REFERENCES `Customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AddressLength-Addresses` CHECK ((length(`Address`) > 0)),
  CONSTRAINT `ZipcodeRange-Addresses` CHECK (((`Zipcode` >= 501) and (`Zipcode` <= 99999)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all customer addresses.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Customer Logins
CREATE TABLE IF NOT EXISTS `Customer Logins` (
  `CustomerID` bigint unsigned NOT NULL,
  `CustomerUsername` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CustomerPassword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `Username` (`CustomerUsername`) USING BTREE,
  CONSTRAINT `CustomerID-Customer Logins` FOREIGN KEY (`CustomerID`) REFERENCES `Customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CustomerPasswordLength-Customer Logins` CHECK ((length(`CustomerPassword`) > 0)),
  CONSTRAINT `CustomerUsernameLength-Customer Logins` CHECK ((length(`CustomerUsername`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table holding all login information.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Customers
CREATE TABLE IF NOT EXISTS `Customers` (
  `CustomerID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `FirstName` VARCHAR(30) NOT NULL,
  `LastName` VARCHAR(30) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `PhoneNumber` VARCHAR(10) NOT NULL DEFAULT '',
  `MembershipExpirationDate` DATETIME NOT NULL,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `PhoneNumber` (`PhoneNumber`),
  CONSTRAINT `EmailValidity-Customers`
    CHECK (`Email` LIKE '%_@_%._%'),
  CONSTRAINT `FirstNameLength-Customers`
    CHECK (LENGTH(`FirstName`) > 0),
  CONSTRAINT `LastNameLength-Customers`
    CHECK (LENGTH(`LastName`) > 0),
  CONSTRAINT `PhoneNumberValidity-Customers`
    CHECK (`PhoneNumber` = '' OR `PhoneNumber` REGEXP '^[0-9]{10}$')
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci
  COMMENT='A table of all customers.';
-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Departments
CREATE TABLE IF NOT EXISTS `Departments` (
  `DepartmentID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `DepartmentName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`DepartmentID`),
  UNIQUE KEY `DepartmentName` (`DepartmentName`),
  CONSTRAINT `DepartmentNameLength-Departments` CHECK ((length(`DepartmentName`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all departments.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Discounts
CREATE TABLE IF NOT EXISTS `Discounts` (
  `DiscountID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemID` bigint unsigned DEFAULT NULL,
  `DiscountCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `NewItemPrice` decimal(10,2) unsigned DEFAULT NULL,
  `DiscountPercent` tinyint unsigned NOT NULL,
  `ExpirationDate` datetime DEFAULT NULL,
  PRIMARY KEY (`DiscountID`),
  UNIQUE KEY `DiscountCode` (`DiscountCode`),
  KEY `ItemID` (`ItemID`),
  CONSTRAINT `ItemID-Discounts` FOREIGN KEY (`ItemID`) REFERENCES `Items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DiscountCodeLength-Discounts` CHECK ((length(`DiscountCode`) > 0)),
  CONSTRAINT `DiscountPercentRange-Discounts` CHECK ((`DiscountPercent` <= 100)),
  CONSTRAINT `NewItemPrice-Discounts` CHECK ((`NewItemPrice` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all discounts.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Employee Logins
CREATE TABLE IF NOT EXISTS `Employee Logins` (
  `EmployeeID` bigint unsigned NOT NULL,
  `EmployeeUsername` varchar(30) NOT NULL,
  `EmployeePassword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  UNIQUE KEY `EmployeeUsername` (`EmployeeUsername`),
  CONSTRAINT `EmployeeID-Employee Logins` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EmployeePasswordLength-Employee Logins` CHECK ((length(`EmployeePassword`) > 0)),
  CONSTRAINT `EmployeeUsernameLength-Employee Logins` CHECK ((length(`EmployeeUsername`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table holding all employee login information.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Employees
CREATE TABLE IF NOT EXISTS `Employees` (
  `EmployeeID` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `DepartmentID` BIGINT UNSIGNED NOT NULL,
  `ManagerID` BIGINT UNSIGNED DEFAULT NULL,
  `FirstName` VARCHAR(30) NOT NULL,
  `LastName` VARCHAR(30) NOT NULL,
  `Email` VARCHAR(255) NOT NULL,
  `Role` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `BirthDate` DATE NOT NULL,
  `HireDate` DATE NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `DepartmentID` (`DepartmentID`),
  KEY `ManagerID` (`ManagerID`),
  CONSTRAINT `DepartmentID` FOREIGN KEY (`DepartmentID`)
    REFERENCES `Departments` (`DepartmentID`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ManagerID` FOREIGN KEY (`ManagerID`)
    REFERENCES `Employees` (`EmployeeID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `EmailValidity-Employees`
    CHECK (`Email` LIKE '%_@_%._%'),
  CONSTRAINT `FirstNameLength-Employees`
    CHECK (LENGTH(`FirstName`) > 0),
  CONSTRAINT `LastNameLength-Employees`
    CHECK (LENGTH(`LastName`) > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci
  COMMENT='A table of all employees.';
-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Inventory
CREATE TABLE IF NOT EXISTS `Inventory` (
  `InventoryID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemID` bigint unsigned NOT NULL,
  `EmployeeID` bigint unsigned NOT NULL COMMENT 'Employee who placed the order.',
  `CurrentSupplierName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Stock` smallint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`InventoryID`),
  KEY `ItemID` (`ItemID`),
  KEY `EmployeeID` (`EmployeeID`),
  KEY `CurrentSupplierName` (`CurrentSupplierName`),
  CONSTRAINT `EmployeeID-Inventory` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemID-Inventory` FOREIGN KEY (`ItemID`) REFERENCES `Items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CurrentSupplierNameLength-Inventory` CHECK ((length(`CurrentSupplierName`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of current item stock and supplier orders, see Shipments for all received shipments.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Item Categories
CREATE TABLE IF NOT EXISTS `Item Categories` (
  `ItemCategoryID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Aisle` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`ItemCategoryID`),
  UNIQUE KEY `CategoryName` (`CategoryName`),
  CONSTRAINT `AisleValidity-Item Categories` CHECK (regexp_like(`Aisle`,_utf8mb4'^[A-Z][0-9]$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all item categories.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Items
CREATE TABLE IF NOT EXISTS `Items` (
  `ItemID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemCategoryID` bigint unsigned NOT NULL,
  `ItemName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ItemDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `ItemWeight` double DEFAULT NULL,
  `ItemPrice` double unsigned NOT NULL,
  PRIMARY KEY (`ItemID`),
  UNIQUE KEY `ItemName` (`ItemName`),
  KEY `ItemCategoryID` (`ItemCategoryID`),
  CONSTRAINT `ItemCategoryID` FOREIGN KEY (`ItemCategoryID`) REFERENCES `Item Categories` (`ItemCategoryID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemNameLength-Items` CHECK ((length(`ItemName`) > 0)),
  CONSTRAINT `ItemPriceRange-Items` CHECK ((`ItemPrice` > 0)),
  CONSTRAINT `ItemWeightRange-Items` CHECK ((`ItemWeight` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all items.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Ordered Items
CREATE TABLE IF NOT EXISTS `Ordered Items` (
  `OrderID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `DiscountID` bigint unsigned DEFAULT NULL,
  `QuantityOrdered` smallint unsigned NOT NULL,
  `ItemPrice` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`OrderID`,`ItemID`),
  KEY `DiscountID` (`DiscountID`),
  KEY `OrderID` (`OrderID`) USING BTREE,
  KEY `ItemID` (`ItemID`) USING BTREE,
  CONSTRAINT `DiscountID-Ordered Items` FOREIGN KEY (`DiscountID`) REFERENCES `Discounts` (`DiscountID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemID-Ordered Items` FOREIGN KEY (`ItemID`) REFERENCES `Items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `OrderID-Ordered Items` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemPriceRange-Ordered Items` CHECK ((`ItemPrice` > 0)),
  CONSTRAINT `QuantityOrderedRange-Ordered Items` CHECK ((`QuantityOrdered` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all ordered items.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Orders
CREATE TABLE IF NOT EXISTS `Orders` (
  `OrderID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `EmployeeID` bigint unsigned NOT NULL,
  `CustomerID` bigint unsigned NOT NULL,
  `SeasonID` bigint unsigned DEFAULT NULL,
  `SaleID` bigint unsigned DEFAULT NULL,
  `DiscountID` bigint unsigned DEFAULT NULL,
  `OrderType` enum('In-Store','Pickup','Delivery') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OrderTotal` decimal(10,2) unsigned NOT NULL,
  `PaymentMethod` enum('Card','Cash','Giftcard') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastFourDigits` char(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OrderDate` datetime NOT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `EmployeeID` (`EmployeeID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `DiscountID` (`DiscountID`),
  KEY `SaleID` (`SaleID`),
  KEY `SeasonID` (`SeasonID`),
  KEY `OrderDate` (`OrderDate`),
  CONSTRAINT `CustomerID-Orders` FOREIGN KEY (`CustomerID`) REFERENCES `Customers` (`CustomerID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DiscountID-Orders` FOREIGN KEY (`DiscountID`) REFERENCES `Discounts` (`DiscountID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EmployeeID-Orders` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SaleID-Orders` FOREIGN KEY (`SaleID`) REFERENCES `Sales` (`SaleID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SeasonID-Orders` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CardNumberValidity-Orders` CHECK (regexp_like(`LastFourDigits`,_utf8mb4'^[0-9]{4}$')),
  CONSTRAINT `OrderTotalRange-Orders` CHECK ((`OrderTotal` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all orders, see Ordered Items for all ordered items, or Order Discounts for all applied discounts.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Returned Items
CREATE TABLE IF NOT EXISTS `Returned Items` (
  `ReturnID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `QuantityReturned` smallint unsigned NOT NULL,
  PRIMARY KEY (`ReturnID`,`ItemID`),
  KEY `ItemID` (`ItemID`) USING BTREE,
  KEY `ReturnID` (`ReturnID`) USING BTREE,
  CONSTRAINT `ItemID-Returned Items` FOREIGN KEY (`ItemID`) REFERENCES `Items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ReturnID-Returned Items` FOREIGN KEY (`ReturnID`) REFERENCES `Returns` (`ReturnID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `QuantityReturnedRange-Returned Items` CHECK ((`QuantityReturned` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all returned items.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Returns
CREATE TABLE IF NOT EXISTS `Returns` (
  `ReturnID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `OrderID` bigint unsigned NOT NULL,
  `EmployeeID` bigint unsigned NOT NULL,
  `ReturnTotal` decimal(10,2) unsigned NOT NULL,
  `ReturnDate` datetime NOT NULL,
  PRIMARY KEY (`ReturnID`),
  KEY `OrderID-Returns` (`OrderID`),
  KEY `EmployeeID-Returns` (`EmployeeID`),
  KEY `ReturnDate` (`ReturnDate`),
  CONSTRAINT `EmployeeID-Returns` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `OrderID-Returns` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ReturnTotalRange-Returns` CHECK ((`ReturnTotal` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all returns, see Returned Items for all returned items.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Sale Items
CREATE TABLE IF NOT EXISTS `Sale Items` (
  `SaleID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `NewItemPrice` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`SaleID`,`ItemID`),
  KEY `ItemID-Items` (`ItemID`),
  KEY `SaleID` (`SaleID`),
  CONSTRAINT `ItemID-Items` FOREIGN KEY (`ItemID`) REFERENCES `Items` (`ItemID`),
  CONSTRAINT `SaleID-Sale Items` FOREIGN KEY (`SaleID`) REFERENCES `Sales` (`SaleID`),
  CONSTRAINT `NewItemPriceRange-Sale Items` CHECK ((`NewItemPrice` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all items and their sale values.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Sales
CREATE TABLE IF NOT EXISTS `Sales` (
  `SaleID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `SaleName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SaleStartDate` datetime DEFAULT NULL,
  `SaleEndDate` datetime DEFAULT NULL,
  `RepeatableSaleStartDate` varchar(12) DEFAULT NULL,
  `RepeatableSaleEndDate` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`SaleID`),
  UNIQUE KEY `SaleName` (`SaleName`),
  CONSTRAINT `SaleDateRange-Sales` CHECK ((`SaleStartDate` < `SaleEndDate`)),
  CONSTRAINT `SaleNameLength-Sales` CHECK ((length(`SaleName`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of sales.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Seasonal Deals
CREATE TABLE IF NOT EXISTS `Seasonal Deals` (
  `SeasonID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `NewItemPrice` double unsigned NOT NULL,
  PRIMARY KEY (`SeasonID`,`ItemID`),
  KEY `ItemID` (`ItemID`),
  KEY `SeasonID` (`SeasonID`),
  CONSTRAINT `ItemID-Seasonal Deals` FOREIGN KEY (`ItemID`) REFERENCES `Items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SeasonID-Seasonal Deals` FOREIGN KEY (`SeasonID`) REFERENCES `Seasons` (`SeasonID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `NewItemPriceRange-Seasonal Deals` CHECK ((`NewItemPrice` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of per-item prices that apply during a season.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Seasons
CREATE TABLE IF NOT EXISTS `Seasons` (
  `SeasonID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `SeasonName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SeasonStartDate` varchar(12) NOT NULL DEFAULT '',
  `SeasonEndDate` varchar(12) NOT NULL DEFAULT '',
  PRIMARY KEY (`SeasonID`),
  UNIQUE KEY `SeasonName` (`SeasonName`),
  CONSTRAINT `SeasonNameLength-Seasons` CHECK ((length(`SeasonName`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of seasons.';

-- Data exporting was unselected.

-- Dumping structure for table COSC3380-PoS.Shipments
CREATE TABLE IF NOT EXISTS `Shipments` (
  `ShipmentID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `InventoryID` bigint unsigned NOT NULL,
  `EmployeeID` bigint unsigned NOT NULL,
  `SupplierName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ArrivalDate` datetime DEFAULT NULL,
  `QuantityShipped` smallint unsigned NOT NULL,
  `ShipmentCost` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`ShipmentID`),
  KEY `InventoryID` (`InventoryID`),
  KEY `EmployeeID` (`EmployeeID`),
  KEY `ArrivalDate` (`ArrivalDate`),
  KEY `SupplierName` (`SupplierName`),
  CONSTRAINT `EmployeeID-Shipments` FOREIGN KEY (`EmployeeID`) REFERENCES `Employees` (`EmployeeID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `InventoryID-Shipments` FOREIGN KEY (`InventoryID`) REFERENCES `Inventory` (`InventoryID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `QuantityShippedRange-Shipments` CHECK ((`QuantityShipped` > 0)),
  CONSTRAINT `ShipmentCostRange-Shipments` CHECK ((`ShipmentCost` > 0)),
  CONSTRAINT `SupplierNameLength-Shipments` CHECK ((length(`SupplierName`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all shipments received against inventory orders.';


USE `COSC3380-PoS`;

INSERT INTO Discounts
  (ItemID, DiscountCode, NewItemPrice, DiscountPercent, ExpirationDate)
VALUES
  (NULL, 'TEST30', NULL, 10, DATE_ADD(NOW(), INTERVAL 30 DAY));
  
USE `COSC3380-PoS`;
SHOW TABLES LIKE 'Discounts';
SELECT * FROM `Discounts`;

INSERT INTO `Discounts`
  (`ItemID`, `DiscountCode`, `NewItemPrice`, `DiscountPercent`, `ExpirationDate`)
VALUES
  (NULL, 'TEST10', 9.99, 10, DATE_ADD(NOW(), INTERVAL 30 DAY));
  
USE `COSC3380-PoS`;

INSERT INTO `Item Categories` (`CategoryName`, `Aisle`)
VALUES ('Test Items', 'T1')
ON DUPLICATE KEY UPDATE `Aisle` = VALUES(`Aisle`);

SET @testCategoryID = (
  SELECT `ItemCategoryID`
  FROM `Item Categories`
  WHERE `CategoryName` = 'Test Items'
);

INSERT INTO `Items`
  (`ItemCategoryID`, `ItemName`, `ItemDescription`, `ItemWeight`, `ItemPrice`)
VALUES
  (@testCategoryID, 'Test Apple', 'Sample apple', 0.20, 0.99),
  (@testCategoryID, 'Test Bread', 'Sample loaf of bread', 0.50, 2.49),
  (@testCategoryID, 'Test Milk', 'Sample carton of milk', 1.00, 3.29)
ON DUPLICATE KEY UPDATE `ItemDescription` = VALUES(`ItemDescription`);

SELECT ItemID FROM `Items`;

USE `COSC3380-PoS`;

INSERT INTO `Sales`
  (`SaleName`, `SaleStartDate`, `SaleEndDate`,
   `RepeatableSaleStartDate`, `RepeatableSaleEndDate`)
VALUES
  ('Test Summer Sale', '2026-06-01 00:00:00', '2026-06-30 23:59:59', NULL, NULL),
  ('Test Back to School Sale', '2026-08-01 00:00:00', '2026-08-31 23:59:59', NULL, NULL)
ON DUPLICATE KEY UPDATE
  `SaleStartDate` = VALUES(`SaleStartDate`),
  `SaleEndDate` = VALUES(`SaleEndDate`);

SELECT * FROM `Sales` ORDER BY `SaleEndDate` DESC;
INSERT INTO `Sales`
  (`SaleName`, `SaleStartDate`, `SaleEndDate`,
   `RepeatableSaleStartDate`, `RepeatableSaleEndDate`)
VALUES
  ('Test Current Sale', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, NULL);

SELECT * FROM `Sales` ORDER BY `SaleID` DESC;
SELECT * FROM `Orders`;

USE `COSC3380-PoS`;

INSERT INTO `Departments` (`DepartmentName`)
VALUES ('Test Department')
ON DUPLICATE KEY UPDATE `DepartmentName` = 'Test Department';

SET @testDepartmentID = (
  SELECT `DepartmentID`
  FROM `Departments`
  WHERE `DepartmentName` = 'Test Department'
);

INSERT INTO `Employees`
  (`DepartmentID`, `FirstName`, `LastName`, `Email`, `BirthDate`, `HireDate`)
VALUES
  (@testDepartmentID, 'Test', 'Employee', 'test.employee@example.com', '1990-01-01', '2026-01-01')
ON DUPLICATE KEY UPDATE `Email` = 'test.employee@example.com';

SET @testEmployeeID = (
  SELECT `EmployeeID`
  FROM `Employees`
  WHERE `Email` = 'test.employee@example.com'
);

INSERT INTO `Customers`
  (`FirstName`, `LastName`, `Email`, `PhoneNumber`, `MembershipExpirationDate`)
VALUES
  ('Test', 'Customer', 'test.customer@example.com', '', DATE_ADD(NOW(), INTERVAL 1 YEAR))
ON DUPLICATE KEY UPDATE `Email` = 'test.customer@example.com';

SET @testCustomerID = (
  SELECT `CustomerID`
  FROM `Customers`
  WHERE `Email` = 'test.customer@example.com'
);

INSERT INTO `Orders`
  (`EmployeeID`, `CustomerID`, `OrderType`, `OrderTotal`,
   `PaymentMethod`, `LastFourDigits`, `OrderDate`)
VALUES
  (@testEmployeeID, @testCustomerID, 'In-Store', 34.50, 'Cash', NULL, NOW());

SELECT * FROM `Orders` ORDER BY `OrderID` DESC LIMIT 1;
SELECT * FROM `Items`;
USE `COSC3380-PoS`;

SELECT
  i.`ItemID`,
  i.`ItemName`,
  COALESCE(SUM(inv.`Stock`), 0) AS `Stock`
FROM `Items` AS i
LEFT JOIN `Inventory` AS inv ON inv.`ItemID` = i.`ItemID`
GROUP BY i.`ItemID`, i.`ItemName`
ORDER BY i.`ItemID`;
INSERT INTO `Employees`
  (`DepartmentID`, `FirstName`, `LastName`, `Email`, `Role`, `BirthDate`, `HireDate`)
VALUES
  (1, 'Jane', 'Doe', 'jane.doe@example.com', 1, '1995-04-12', CURDATE());
INSERT INTO `Employee Logins`
  (`EmployeeID`, `EmployeeUsername`, `EmployeePassword`)
VALUES
  (1, 'jane.doe', 'testpassword');
-- --------------------------------------------------------
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
  `CustomerID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PhoneNumber` varchar(10) NOT NULL DEFAULT '',
  `MembershipExpirationDate` datetime NOT NULL,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `PhoneNumber` (`PhoneNumber`) USING BTREE,
  CONSTRAINT `EmailValidity-Customers` CHECK ((`Email` like _utf8mb4'_%@__%._%')),
  CONSTRAINT `FirstNameLength-Customers` CHECK ((length(`FirstName`) > 0)),
  CONSTRAINT `LastNameLength-Customers` CHECK ((length(`LastName`) > 0)),
  CONSTRAINT `PhoneNumberValidity-Customers` CHECK (regexp_like(`PhoneNumber`,_utf8mb4'^[0-9]{10}$'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all customers.';

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
  `EmployeeID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `DepartmentID` bigint unsigned NOT NULL,
  `ManagerID` bigint unsigned DEFAULT NULL,
  `FirstName` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` tinyint unsigned NOT NULL DEFAULT (0),
  `BirthDate` date NOT NULL,
  `HireDate` date NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `DepartmentID` (`DepartmentID`),
  KEY `ManagerID` (`ManagerID`),
  CONSTRAINT `DepartmentID` FOREIGN KEY (`DepartmentID`) REFERENCES `Departments` (`DepartmentID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ManagerID` FOREIGN KEY (`ManagerID`) REFERENCES `Employees` (`EmployeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `EmailValidity-Employees` CHECK ((`Email` like _utf8mb4'_%@__%._%')),
  CONSTRAINT `FirstNameLength-Employees` CHECK ((length(`FirstName`) > 0)),
  CONSTRAINT `LastNameLength-Employees` CHECK ((length(`LastName`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all employees.';

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

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

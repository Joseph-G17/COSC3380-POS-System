-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: saveso.mysql.database.azure.com    Database: saveso
-- ------------------------------------------------------
-- Server version	8.4.11-azure

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

--
-- Table structure for table `addresses`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;

CREATE DATABASE IF NOT EXISTS saveso;
USE saveso;


CREATE TABLE `addresses` (
  `AddressID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `CustomerID` bigint unsigned NOT NULL,
  `Country` varchar(37) DEFAULT NULL,
  `City` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Zipcode` mediumint unsigned DEFAULT NULL,
  `Address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `AddressType` enum('Billing','Shipping','Both') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`AddressID`),
  KEY `CustomerID` (`CustomerID`),
  CONSTRAINT `CustomerID-Addresses` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AddressLength-Addresses` CHECK ((length(`Address`) > 0)),
  CONSTRAINT `ZipcodeRange-Addresses` CHECK (((`Zipcode` >= 501) and (`Zipcode` <= 99999)))
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all customer addresses.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,40,'Fiji','Gatesville',95472,'2637 habitant Bulevard, Gatesville, Fiji','Billing'),(2,7,'Japan','Torrington',86949,'5120 dissident Cutoff, Torrington, Japan','Both'),(149,101,NULL,NULL,NULL,'123 Test St, Houston, TX 77123','Shipping'),(150,101,NULL,NULL,NULL,'123 Houston St, Houston, TX 77123','Shipping'),(151,102,NULL,NULL,NULL,'random street 1011','Shipping'),(152,107,NULL,NULL,NULL,'texas','Shipping'),(153,109,NULL,NULL,NULL,'567 Austin St, Houston, TX 77876','Shipping'),(154,110,NULL,NULL,NULL,'999 Dallas St, Houston, TX 77654','Shipping');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer logins`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer logins` (
  `CustomerID` bigint unsigned NOT NULL,
  `CustomerUsername` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CustomerPassword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`CustomerID`),
  UNIQUE KEY `Username` (`CustomerUsername`) USING BTREE,
  CONSTRAINT `CustomerID-Customer Logins` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CustomerPasswordLength-Customer Logins` CHECK ((length(`CustomerPassword`) > 0)),
  CONSTRAINT `CustomerUsernameLength-Customer Logins` CHECK ((length(`CustomerUsername`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table holding all login information.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer logins`
--

LOCK TABLES `customer logins` WRITE;
/*!40000 ALTER TABLE `customer logins` DISABLE KEYS */;
INSERT INTO `customer logins` VALUES (1,'Lenore_Watkins','Macaroni-Upcountry-Daydream-Quaintly-Applicant-Tacky-76'),(3,'Alexander_Hawley','Lunchroom-Snooper-Feeble-Unadorned-Gangrene-Dotted-59'),(7,'Iris_Clanton','Everglade-Footing-Stagnate-Wavy-Yesterday-Thinner-20'),(40,'Ben_Sharp','Spruce-Pushchair-Rifling-Overflow-Preview-Shredder-13'),(101,'Kayden','Kiet1234'),(102,'JAG123','password'),(103,'ViNg','Kiet1234'),(104,'Hello','Hello1234'),(107,'bee','password'),(109,'johndep','kiet1234'),(110,'steven','kiet1234');
/*!40000 ALTER TABLE `customer logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `customerreport`
--

SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `customerreport` AS SELECT 
 1 AS `CustomerID`,
 1 AS `CustomerName`,
 1 AS `Membership`,
 1 AS `OrderCount`,
 1 AS `TotalSpent`,
 1 AS `AvgOrder`,
 1 AS `LastOrderDate`,
 1 AS `TotalReturned`,
 1 AS `NetSpent`,
 1 AS `CanceledOrders`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `customers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
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
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all customers.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Lenore','Watkins','Lenore_Watkins.shopping@icloud.com','3428610895','2027-09-07 08:40:09'),(2,'Guest','Member','name@saveso.com','0000000000','2026-11-26 15:51:00'),(3,'Alexander','Hawley','Alexander-Hawley.Shopping@yahoo.com','4581510769','2026-10-22 05:45:44'),(7,'Iris','Clanton','Iris-Clanton.shopping@outlook.com','5663131463','2027-07-23 20:46:14'),(40,'Ben','Sharp','BenSharp.saveso@gmail.com','7477658088','2026-06-02 08:14:44'),(101,'Dang','Nguyen','tuankiet01062004@gmail.com','3466641822','2027-11-08 21:16:04'),(102,'Joseph','Guzman','joseph@saveso.com','1112223333','2027-11-08 21:53:47'),(103,'Vi','Nguyen','kaynguyenz2k4@gmail.com','9526888854','2027-11-08 22:27:31'),(104,'Hello','Hi','hellohi@gmail.com','1234567890','2027-11-09 01:36:02'),(107,'bee','boo','beeboo@saveso.com','0123456789','2027-11-11 15:48:34'),(109,'John','Deep','johndeep@gmail.com','1231231234','2027-11-11 22:54:56'),(110,'Steve','Nguyen','steveng@gmail.com','7776665678','2027-11-11 23:28:35');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `DepartmentID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `DepartmentName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ManagerID` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`DepartmentID`),
  UNIQUE KEY `DepartmentName` (`DepartmentName`),
  KEY `ManagerID-Departments` (`ManagerID`),
  CONSTRAINT `ManagerID-Departments` FOREIGN KEY (`ManagerID`) REFERENCES `employees` (`EmployeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `DepartmentNameLength-Departments` CHECK ((length(`DepartmentName`) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all departments.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Bakery',NULL),(2,'Deli',NULL),(3,'Produce',NULL),(8,'Checkout',26),(11,'Inventory Management',34),(12,'Stocking',37),(14,'Management',1);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discounts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `DiscountID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemID` bigint unsigned DEFAULT NULL,
  `DiscountCode` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `NewItemPrice` decimal(10,2) unsigned DEFAULT NULL,
  `DiscountPercent` tinyint unsigned NOT NULL,
  `ExpirationDate` datetime DEFAULT NULL,
  PRIMARY KEY (`DiscountID`),
  UNIQUE KEY `DiscountCode` (`DiscountCode`),
  KEY `ItemID` (`ItemID`),
  CONSTRAINT `ItemID-Discounts` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DiscountCodeLength-Discounts` CHECK ((length(`DiscountCode`) > 0)),
  CONSTRAINT `DiscountPercentRange-Discounts` CHECK ((`DiscountPercent` <= 100)),
  CONSTRAINT `NewItemPrice-Discounts` CHECK ((`NewItemPrice` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all discounts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
INSERT INTO `discounts` VALUES (1,NULL,'WELCOMETOSAVESO',NULL,10,'2026-11-26 19:55:00'),(2,NULL,'BLACKFRIDAY',NULL,20,'2026-11-28 00:00:00'),(3,NULL,'DISCOUNT',NULL,20,'2026-11-11 17:04:00');
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee hours`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee hours` (
  `EmployeeID` bigint unsigned NOT NULL,
  `PayPeriodStart` date NOT NULL,
  `PayPeriodEnd` date NOT NULL,
  `HoursWorked` decimal(6,2) unsigned NOT NULL,
  `HourlyRate` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`EmployeeID`,`PayPeriodStart`),
  KEY `PayPeriodStart` (`PayPeriodStart`),
  CONSTRAINT `EmployeeID-Employee Hours` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `HoursWorkedRange-Employee Hours` CHECK ((`HoursWorked` <= 336)),
  CONSTRAINT `PayPeriodRange-Employee Hours` CHECK ((`PayPeriodStart` < `PayPeriodEnd`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of hours worked by employees per pay period.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee hours`
--

LOCK TABLES `employee hours` WRITE;
/*!40000 ALTER TABLE `employee hours` DISABLE KEYS */;
INSERT INTO `employee hours` VALUES (20,'2026-11-01','2026-12-01',0.00,27.00),(25,'2026-11-01','2026-12-01',0.00,28.00),(26,'2026-11-01','2026-12-01',0.00,30.00),(34,'2026-11-01','2026-12-01',0.00,28.00),(37,'2026-11-01','2026-12-01',0.00,29.00),(53,'2026-11-01','2026-12-01',0.00,32.00),(70,'2026-11-01','2026-12-01',0.00,34.00);
/*!40000 ALTER TABLE `employee hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee logins`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee logins` (
  `EmployeeID` bigint unsigned NOT NULL,
  `EmployeeUsername` varchar(30) NOT NULL,
  `EmployeePassword` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  UNIQUE KEY `EmployeeUsername` (`EmployeeUsername`),
  CONSTRAINT `EmployeeID-Employee Logins` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EmployeePasswordLength-Employee Logins` CHECK ((length(`EmployeePassword`) > 0)),
  CONSTRAINT `EmployeeUsernameLength-Employee Logins` CHECK ((length(`EmployeeUsername`) > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table holding all employee login information.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee logins`
--

LOCK TABLES `employee logins` WRITE;
/*!40000 ALTER TABLE `employee logins` DISABLE KEYS */;
INSERT INTO `employee logins` VALUES (1,'admin@saveso.com','password'),(20,'Matthew_Fisher','Stroller-Improper-Snare-Pantomime-Deflation-Nervous-63'),(25,'Kelsie_Hines','Euphemism-Sharpness-Prism-Feminism-Polyester-Vocalist-69'),(26,'Bernice_Bolden','Yearbook-Huntress-Ipad-Unguided-Motivate-Reply-31'),(34,'Justine_Story','Mushily-Lash-Capable-Clay-Hungry-Washbowl-60'),(37,'Priscilla_Weigel','Coasting-Pueblo-Footprint-Scion-Shading-Musket-98'),(53,'Faye_McNair','Script-Patchy-Unread-Shrunk-Giblet-Always-67'),(59,'cashier@saveso.com','password'),(70,'Phillip_Coles','Mantis-Unwoven-Spoof-Species-Glancing-Husband-88'),(72,'ghost','ghost'),(73,'ghost1','ghost');
/*!40000 ALTER TABLE `employee logins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `EmployeeID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `DepartmentID` bigint unsigned NOT NULL,
  `FirstName` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastName` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Role` tinyint unsigned NOT NULL DEFAULT (0),
  `BirthDate` date NOT NULL,
  `HireDate` date NOT NULL,
  PRIMARY KEY (`EmployeeID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `DepartmentID` (`DepartmentID`),
  CONSTRAINT `DepartmentID` FOREIGN KEY (`DepartmentID`) REFERENCES `departments` (`DepartmentID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EmailValidity-Employees` CHECK ((`Email` like _utf8mb4'_%@__%._%')),
  CONSTRAINT `FirstNameLength-Employees` CHECK ((length(`FirstName`) > 0)),
  CONSTRAINT `LastNameLength-Employees` CHECK ((length(`LastName`) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all employees.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,14,'The','Admin','admin@saveso.com',2,'2000-01-01','2020-01-01'),(2,14,'Guest','Account','name@example.com',0,'2026-11-10','2026-11-10'),(20,3,'Matthew','Fisher','MatthewFisher.Shopping@gmail.com',0,'2007-10-19','2026-08-20'),(25,8,'Kelsie','Hines','Kelsie-Hines.saveso@keemail.me',0,'1976-05-20','2023-12-25'),(26,8,'Bernice','Bolden','Bernice_Bolden.shopping@aol.com',0,'1955-09-06','2012-02-17'),(34,11,'Justine','Story','JustineStory.SaveSo@protonmail.com',0,'1991-08-18','2021-02-04'),(37,12,'Priscilla','Weigel','Priscilla_Weigel@keemail.me',0,'2004-07-21','2026-03-10'),(53,3,'Faye','McNair','Faye-McNair.Shopping@gmail.com',0,'1993-04-10','2021-03-26'),(59,8,'Cashier','Example','cashier@saveso.com',0,'2000-02-16','2026-11-08'),(70,2,'Phillip','Coles','Phillip_Coles.Shopping@tutamail.com',0,'1949-10-23','1974-08-27'),(72,14,'Nick','Sankar','name1@example.com',0,'2026-11-11','2026-11-11'),(73,8,'Ghost 2','Ghost','ghost@saveso.com',0,'2026-11-11','2026-11-11');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `InventoryID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemID` bigint unsigned NOT NULL,
  `EmployeeID` bigint unsigned DEFAULT NULL COMMENT 'Employee who placed the order.',
  `CurrentSupplierName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Stock` smallint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`InventoryID`),
  KEY `ItemID` (`ItemID`),
  KEY `EmployeeID` (`EmployeeID`),
  KEY `CurrentSupplierName` (`CurrentSupplierName`),
  CONSTRAINT `EmployeeID-Inventory` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ItemID-Inventory` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CurrentSupplierNameLength-Inventory` CHECK ((length(`CurrentSupplierName`) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=241 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of current item stock and supplier orders, see Shipments for all received shipments.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (233,1,1,'Random Supplier',0),(235,3,1,NULL,97),(236,4,1,NULL,11),(237,5,1,'Yuca Supplier',19),(238,6,1,'Jalapeno Supplier',18),(239,7,1,'Random Supplier',15),(240,236,NULL,'admin',20);
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_Inventory_AfterUpdate` AFTER UPDATE ON `inventory` FOR EACH ROW BEGIN

  DECLARE v_threshold INT DEFAULT 10;

  DECLARE v_onorder   INT;

  DECLARE v_manager   BIGINT UNSIGNED;

  DECLARE v_item      VARCHAR(255);

  DECLARE v_msg       VARCHAR(1000);



  IF NEW.Stock < OLD.Stock AND NEW.Stock <= v_threshold THEN



    SELECT it.ItemName INTO v_item

      FROM items it

     WHERE it.ItemID = NEW.ItemID;



    IF NEW.Stock = 0

       OR NOT EXISTS (SELECT 1 FROM notifications n

                       WHERE n.NotificationType = 'Shipment'

                         AND n.IsRead = 0

                         AND n.Message LIKE CONCAT('%: ', v_item, ' is down to %')) THEN



      SELECT MAX(d.ManagerID) INTO v_manager

        FROM employees e

        JOIN departments d ON d.DepartmentID = e.DepartmentID

       WHERE e.EmployeeID = NEW.EmployeeID;



      SELECT COALESCE(SUM(QuantityShipped), 0) INTO v_onorder

        FROM shipments

       WHERE InventoryID = NEW.InventoryID

         AND ArrivalDate IS NULL;



      IF NEW.Stock = 0 AND v_onorder = 0 THEN

        SET v_msg = CONCAT('OUT OF STOCK: ', v_item, ' just sold out and nothing is on order. Order more now.');

      ELSEIF NEW.Stock = 0 THEN

        SET v_msg = CONCAT('OUT OF STOCK: ', v_item, ' just sold out. ', v_onorder, ' units are on order.');

      ELSEIF (NEW.Stock + v_onorder) <= v_threshold THEN

        SET v_msg = CONCAT('LOW STOCK ALERT: ', v_item, ' is down to ', NEW.Stock, ' in stock with ',

                           v_onorder, ' on order. Projected stock is ', (NEW.Stock + v_onorder),

                           '. Order more now.');

      ELSE

        SET v_msg = CONCAT('Low stock heads-up: ', v_item, ' is down to ', NEW.Stock, ' in stock. ',

                           v_onorder, ' units are on order.');

      END IF;



      INSERT INTO notifications

        (NotificationType, RecipientEmployeeID, RecipientCustomerID, Message, RelatedID)

      VALUES

        ('Shipment', v_manager, NULL, v_msg, NULL);

    END IF;

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `item categories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item categories` (
  `ItemCategoryID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Aisle` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`ItemCategoryID`),
  UNIQUE KEY `CategoryName` (`CategoryName`),
  CONSTRAINT `AisleValidity-Item Categories` CHECK (regexp_like(`Aisle`,_utf8mb4'^[A-Z][0-9]$'))
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all item categories.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item categories`
--

LOCK TABLES `item categories` WRITE;
/*!40000 ALTER TABLE `item categories` DISABLE KEYS */;
INSERT INTO `item categories` VALUES (1,'Produce','A1'),(3,'Dairy','B1'),(6,'Frozen Food','C1'),(8,'Meat','D1'),(9,'Deli','E1'),(12,'Grains','F2');
/*!40000 ALTER TABLE `item categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `itemperformance`
--

SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `itemperformance` AS SELECT 
 1 AS `ItemID`,
 1 AS `ItemName`,
 1 AS `Category`,
 1 AS `ItemPrice`,
 1 AS `UnitsSold`,
 1 AS `Revenue`,
 1 AS `UnitsReturned`,
 1 AS `NetUnits`,
 1 AS `ReturnRatePct`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `ItemID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ItemCategoryID` bigint unsigned NOT NULL,
  `ItemName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ItemDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `ItemImage` varchar(2048) DEFAULT NULL,
  `ItemWeight` double DEFAULT NULL,
  `ItemPrice` double unsigned NOT NULL,
  PRIMARY KEY (`ItemID`),
  UNIQUE KEY `ItemName` (`ItemName`),
  KEY `ItemCategoryID` (`ItemCategoryID`),
  CONSTRAINT `ItemCategoryID` FOREIGN KEY (`ItemCategoryID`) REFERENCES `item categories` (`ItemCategoryID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemNameLength-Items` CHECK ((length(`ItemName`) > 0)),
  CONSTRAINT `ItemPriceRange-Items` CHECK ((`ItemPrice` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all items.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,1,'Green pears (per lb)',NULL,'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwebstockreview.net%2Fimages%2Fpear-clipart-single-fruit-17.png&f=1&nofb=1&ipt=7f35182536dd5ccb60e2147cb5d5eee252ed88c077c1a0f7a5b56ce8ce5260f4&ipo=images',1,2.49),(3,1,'Grapefruit (each)',NULL,'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpngimg.com%2Fuploads%2Fgrapefruit%2Fgrapefruit_PNG15243.png&f=1&nofb=1&ipt=a26cbedc6f44e1b90fe1c404b8699d72e0a3ffcf579fab45809834cf9f96e65a&ipo=images',0,1.49),(4,1,'Plantains (per lb)',NULL,'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ffreepngimg.com%2Fthumb%2Fgreen%2F155984-green-organic-plantain-free-clipart-hd.png&f=1&nofb=1&ipt=e3c6293b14d1e6a0be3fd9a9f66fc018a13867c87e1b11746ce916a45a081ea7&ipo=images',1,1.49),(5,1,'Yuca (per lb)',NULL,'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgruporamos.vteximg.com.br%2Farquivos%2Fids%2F175029%2F1-lb-02296.webp%3Fv%3D639154032060170000&f=1&nofb=1&ipt=72402569442d12826c58e1d9d270ac7df47c534719ad8b7ce52932f072b49c1f&ipo=images',1,2.49),(6,1,'Jalapeño peppers (per lb)',NULL,'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpngimg.com%2Fd%2Fjalapeno_PNG2.png&f=1&nofb=1&ipt=1f73127fe70140f7cc831b7345f34b85f4be7b114fd8099e1ae00f06f25489b0&ipo=images',1,1.99),(7,1,'Apple','This is an apple!','https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fclipart-library.com%2Fimage_gallery2%2FApple-Fruit-Transparent.png&f=1&nofb=1&ipt=cda3f3a5226924106d5e564a0c5206352aefd85d36f7460a3fa7d3496575d046&ipo=images',4,1.49),(236,8,'Beef',NULL,NULL,NULL,2);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `NotificationID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `NotificationType` enum('OrderCancelation','Shipment','SeasonalDeal') NOT NULL,
  `RecipientEmployeeID` bigint unsigned DEFAULT NULL,
  `RecipientCustomerID` bigint unsigned DEFAULT NULL,
  `Message` varchar(1000) NOT NULL,
  `RelatedID` bigint unsigned DEFAULT NULL COMMENT 'OrderID, ShipmentID or SeasonID/ItemID depending on type.',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsRead` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`NotificationID`),
  KEY `Employee-Unread` (`RecipientEmployeeID`,`IsRead`),
  KEY `Customer-Unread` (`RecipientCustomerID`,`IsRead`),
  KEY `CreatedAt` (`CreatedAt`),
  CONSTRAINT `CustomerID-Notifications` FOREIGN KEY (`RecipientCustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `EmployeeID-Notifications` FOREIGN KEY (`RecipientEmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `MessageLength-Notifications` CHECK ((length(`Message`) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Messages created for triggers for the app to display.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'Shipment',1,NULL,'Shipment #3 received from Banana Supplier: +100 of Plantains (per lb). Stock is now 103.',3,'2026-11-11 04:50:18',1),(2,'Shipment',1,NULL,'Shipment #4 received from Banana\'s: +50 of Green pears (per lb). Stock is now 50.',4,'2026-11-11 04:52:42',1),(3,'Shipment',1,NULL,'Shipment #5 received from Grapefruit: +100 of Grapefruit (each). Stock is now 104.',5,'2026-11-11 05:00:27',1),(4,'Shipment',1,NULL,'Shipment #6 received from Plantains: +50 of Plantains (per lb). Stock is now 54.',6,'2026-11-11 05:02:04',1),(5,'Shipment',1,NULL,'LOW STOCK ALERT: Yuca (per lb) has 0 in stock and 10 on order (shipment #7 from Yuca Supplier). Projected stock is 10. Order more now.',7,'2026-11-11 06:53:11',1),(6,'Shipment',1,NULL,'Shipment #7 received from Yuca Supplier: +100 of Yuca (per lb). Stock is now 100.',7,'2026-11-11 06:55:44',1),(7,'Shipment',1,NULL,'OUT OF STOCK: Green pears (per lb) just sold out and nothing is on order. Order more now.',NULL,'2026-11-11 06:56:18',1),(8,'Shipment',1,NULL,'LOW STOCK ALERT: Green pears (per lb) is down to 10 in stock with 0 on order. Projected stock is 10. Order more now.',NULL,'2026-11-11 06:57:05',1),(9,'SeasonalDeal',NULL,NULL,'New Spring deal: Grapefruit (each) is now $0.99 (regular $1.49, save 34%).',1,'2026-11-11 15:51:38',0),(10,'SeasonalDeal',NULL,NULL,'New saveso deal: Apple is now $0.99 (regular $1.49, save 34%).',5,'2026-11-11 15:53:05',0),(11,'Shipment',1,NULL,'Shipment #8 received from Admin: +9 of Yuca (per lb). Stock is now 27.',8,'2026-11-11 16:05:56',1),(12,'OrderCancelation',NULL,101,'Your order #28 ($1.49) was canceled on Nov 11, 2026.',28,'2026-11-11 18:03:20',0),(13,'OrderCancelation',1,NULL,'Order #28 for Dang Nguyen ($1.49) was canceled. Handled by The Admin.',28,'2026-11-11 18:03:20',0),(14,'SeasonalDeal',NULL,NULL,'New Summer deal: Apple is now $1.00 (regular $1.49, save 33%).',2,'2026-11-11 18:41:49',0),(15,'SeasonalDeal',NULL,NULL,'New Summer deal: Grapefruit (each) is now $1.00 (regular $1.49, save 33%).',2,'2026-11-11 18:42:01',0),(16,'SeasonalDeal',NULL,NULL,'New Summer deal: Plantains (per lb) is now $1.00 (regular $1.49, save 33%).',2,'2026-11-11 18:42:16',0),(17,'SeasonalDeal',NULL,NULL,'New fall deal: Apple is now $0.99 (regular $1.49, save 34%).',6,'2026-11-11 20:25:25',0),(18,'Shipment',1,NULL,'Shipment #9 ordered from Admin: 10 of Jalapeño peppers (per lb) on the way. Stock 20, on order 10.',9,'2026-11-11 20:27:09',1),(19,'SeasonalDeal',NULL,NULL,'New fall deal: Grapefruit (each) is now $0.99 (regular $1.49, save 34%).',6,'2026-11-11 21:33:48',0),(20,'Shipment',1,NULL,'Shipment #10 ordered from Admin: 1 of Jalapeño peppers (per lb) on the way. Stock 20, on order 1.',10,'2026-11-11 21:37:29',1),(35,'SeasonalDeal',NULL,NULL,'New Fall deal: Apple is now $1.00 (regular $1.49, save 33%).',7,'2026-11-11 22:44:25',0),(36,'Shipment',1,NULL,'LOW STOCK ALERT: Grapefruit (each) is down to 10 in stock with 0 on order. Projected stock is 10. Order more now.',NULL,'2026-11-11 22:48:49',1),(37,'Shipment',1,NULL,'LOW STOCK ALERT: Green pears (per lb) is down to 10 in stock with 0 on order. Projected stock is 10. Order more now.',NULL,'2026-11-11 22:59:25',1),(38,'Shipment',1,NULL,'OUT OF STOCK: Grapefruit (each) just sold out and nothing is on order. Order more now.',NULL,'2026-11-11 22:59:25',1),(39,'Shipment',1,NULL,'Shipment #19 received from admin: +20 of Grapefruit (each). Stock is now 20.',19,'2026-11-11 23:01:53',1),(40,'SeasonalDeal',NULL,NULL,'New Fall deal: Grapefruit (each) is now $1.00 (regular $1.49, save 33%).',9,'2026-11-11 23:03:45',0),(41,'Shipment',1,NULL,'LOW STOCK ALERT: Green pears (per lb) is down to 9 in stock with 0 on order. Projected stock is 9. Order more now.',NULL,'2026-11-11 23:29:59',1),(42,'Shipment',1,NULL,'LOW STOCK ALERT: Grapefruit (each) is down to 9 in stock with 0 on order. Projected stock is 9. Order more now.',NULL,'2026-11-11 23:29:59',1),(43,'Shipment',1,NULL,'OUT OF STOCK: Grapefruit (each) just sold out and nothing is on order. Order more now.',NULL,'2026-11-11 23:32:46',1),(44,'Shipment',1,NULL,'LOW STOCK ALERT: Plantains (per lb) is down to 10 in stock with 0 on order. Projected stock is 10. Order more now.',NULL,'2026-11-11 23:32:47',1),(45,'Shipment',1,NULL,'OUT OF STOCK: Green pears (per lb) just sold out and nothing is on order. Order more now.',NULL,'2026-11-11 23:33:28',1),(46,'Shipment',1,NULL,'Shipment #20 received from Admin: +100 of Grapefruit (each). Stock is now 100.',20,'2026-11-11 23:35:14',1),(47,'SeasonalDeal',NULL,NULL,'New Fall deal: Grapefruit (each) is now $1.00 (regular $1.49, save 33%).',9,'2026-11-11 23:38:36',0);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ordered items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ordered items` (
  `OrderID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `DiscountID` bigint unsigned DEFAULT NULL,
  `QuantityOrdered` smallint unsigned NOT NULL,
  `ItemPrice` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`OrderID`,`ItemID`),
  KEY `DiscountID` (`DiscountID`),
  KEY `OrderID` (`OrderID`) USING BTREE,
  KEY `ItemID` (`ItemID`) USING BTREE,
  CONSTRAINT `DiscountID-Ordered Items` FOREIGN KEY (`DiscountID`) REFERENCES `discounts` (`DiscountID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemID-Ordered Items` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `OrderID-Ordered Items` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ItemPriceRange-Ordered Items` CHECK ((`ItemPrice` > 0)),
  CONSTRAINT `QuantityOrderedRange-Ordered Items` CHECK ((`QuantityOrdered` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all ordered items.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ordered items`
--

LOCK TABLES `ordered items` WRITE;
/*!40000 ALTER TABLE `ordered items` DISABLE KEYS */;
INSERT INTO `ordered items` VALUES (18,1,NULL,1,2.49),(19,1,NULL,1,2.49),(20,1,NULL,2,2.49),(21,1,NULL,4,2.49),(22,1,NULL,3,2.49),(24,1,NULL,10,2.49),(25,1,NULL,40,2.49),(26,5,NULL,2,2.49),(27,3,NULL,2,1.49),(28,3,NULL,1,1.49),(41,3,NULL,2,1.49),(42,5,NULL,1,2.49),(43,3,NULL,1,1.49),(44,3,NULL,1,1.49),(45,3,NULL,3,1.49),(45,4,NULL,3,1.49),(45,7,NULL,3,1.49),(46,1,NULL,3,2.49),(46,4,NULL,3,1.49),(47,1,NULL,7,2.49),(47,3,NULL,6,1.49),(48,3,NULL,4,1.00),(49,3,NULL,1,1.00),(50,3,NULL,3,1.49),(50,4,NULL,2,1.49),(50,5,NULL,2,2.49),(51,1,NULL,2,2.49),(51,3,NULL,3,1.49),(51,6,NULL,2,1.99),(51,7,NULL,2,1.49),(52,3,NULL,7,1.49),(52,5,NULL,4,2.49),(53,1,NULL,9,2.49),(54,3,NULL,3,1.00);
/*!40000 ALTER TABLE `ordered items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `OrderID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `EmployeeID` bigint unsigned DEFAULT NULL,
  `CustomerID` bigint unsigned NOT NULL DEFAULT '2',
  `SeasonID` bigint unsigned DEFAULT NULL,
  `SaleID` bigint unsigned DEFAULT NULL,
  `DiscountID` bigint unsigned DEFAULT NULL,
  `OrderType` enum('In-Store','Pickup','Delivery') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `OrderTotal` decimal(10,2) unsigned NOT NULL,
  `PaymentMethod` enum('Card','Cash','Giftcard') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `LastFourDigits` char(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `OrderDate` datetime NOT NULL,
  `OrderStatus` enum('Completed','Canceled') NOT NULL DEFAULT 'Completed',
  `CanceledDate` datetime DEFAULT NULL,
  `ShippingAddressID` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `EmployeeID` (`EmployeeID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `DiscountID` (`DiscountID`),
  KEY `SaleID` (`SaleID`),
  KEY `SeasonID` (`SeasonID`),
  KEY `OrderDate` (`OrderDate`),
  KEY `ShippingAddressID-Orders` (`ShippingAddressID`),
  CONSTRAINT `CustomerID-Orders` FOREIGN KEY (`CustomerID`) REFERENCES `customers` (`CustomerID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DiscountID-Orders` FOREIGN KEY (`DiscountID`) REFERENCES `discounts` (`DiscountID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EmployeeID-Orders` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `SaleID-Orders` FOREIGN KEY (`SaleID`) REFERENCES `sales` (`SaleID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SeasonID-Orders` FOREIGN KEY (`SeasonID`) REFERENCES `seasons` (`SeasonID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ShippingAddressID-Orders` FOREIGN KEY (`ShippingAddressID`) REFERENCES `addresses` (`AddressID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CardNumberValidity-Orders` CHECK (regexp_like(`LastFourDigits`,_utf8mb4'^[0-9]{4}$')),
  CONSTRAINT `OrderTotalRange-Orders` CHECK ((`OrderTotal` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all orders, see Ordered Items for all ordered items, or Order Discounts for all applied discounts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,1,NULL,NULL,NULL,'In-Store',8.25,'Cash',NULL,'2026-08-14 00:00:00','Completed',NULL,NULL),(2,NULL,40,NULL,NULL,NULL,'Pickup',18.50,'Card','4242','2026-08-22 00:00:00','Completed',NULL,NULL),(3,1,3,NULL,NULL,NULL,'Delivery',15.00,'Card','1111','2026-09-03 00:00:00','Completed',NULL,NULL),(4,1,1,NULL,NULL,NULL,'Pickup',3.49,'Card',NULL,'2026-11-05 03:34:11','Completed',NULL,NULL),(5,1,1,NULL,NULL,NULL,'Pickup',3.99,'Card',NULL,'2026-11-05 03:43:52','Completed',NULL,NULL),(6,1,1,NULL,NULL,NULL,'Pickup',1.49,'Card',NULL,'2026-11-04 21:45:43','Completed',NULL,NULL),(7,1,7,NULL,NULL,NULL,'Pickup',20.94,'Card',NULL,'2026-11-07 12:24:13','Completed',NULL,NULL),(8,1,1,NULL,NULL,NULL,'Pickup',7.48,'Card',NULL,'2026-11-07 12:24:27','Completed',NULL,NULL),(9,1,101,NULL,NULL,1,'Pickup',1.34,'Card',NULL,'2026-11-08 15:19:36','Completed',NULL,NULL),(10,1,102,NULL,NULL,NULL,'Pickup',224.87,'Card',NULL,'2026-11-08 15:56:16','Completed',NULL,NULL),(11,1,103,NULL,NULL,1,'Pickup',16.17,'Card',NULL,'2026-11-08 16:28:58','Completed',NULL,NULL),(12,1,102,NULL,NULL,NULL,'Pickup',59.90,'Card',NULL,'2026-11-08 17:25:11','Completed',NULL,NULL),(13,1,102,NULL,NULL,1,'Pickup',59.30,'Card',NULL,'2026-11-08 17:25:30','Completed',NULL,NULL),(14,1,102,NULL,NULL,2,'Pickup',170.77,'Card',NULL,'2026-11-08 18:13:23','Completed',NULL,NULL),(15,1,102,NULL,NULL,NULL,'Pickup',14.45,'Card',NULL,'2026-11-08 19:11:04','Completed',NULL,NULL),(16,1,104,NULL,NULL,1,'Pickup',13.01,'Card',NULL,'2026-11-08 19:37:27','Completed',NULL,NULL),(17,1,101,NULL,NULL,NULL,'Delivery',17.97,'Card',NULL,'2026-11-09 13:34:49','Completed',NULL,149),(18,1,102,NULL,NULL,NULL,'Pickup',2.49,'Card',NULL,'2026-11-09 20:47:48','Completed',NULL,NULL),(19,1,101,NULL,NULL,NULL,'Delivery',2.49,'Card',NULL,'2026-11-10 12:10:02','Completed',NULL,150),(20,1,102,NULL,NULL,NULL,'Delivery',4.98,'Card',NULL,'2026-11-10 12:58:58','Completed',NULL,151),(21,59,1,NULL,NULL,NULL,'In-Store',9.96,'Card',NULL,'2026-11-10 13:57:20','Completed',NULL,NULL),(22,59,2,NULL,NULL,NULL,'In-Store',7.47,'Cash',NULL,'2026-11-10 15:57:07','Completed',NULL,NULL),(24,1,102,NULL,NULL,NULL,'Pickup',24.90,'Card',NULL,'2026-11-11 00:44:13','Completed',NULL,NULL),(25,1,102,NULL,NULL,NULL,'Pickup',99.60,'Card',NULL,'2026-11-11 00:44:40','Completed',NULL,NULL),(26,1,102,NULL,NULL,NULL,'Pickup',4.98,'Card',NULL,'2026-11-11 00:59:28','Completed',NULL,NULL),(27,1,107,NULL,NULL,1,'Delivery',2.68,'Card',NULL,'2026-11-11 09:49:37','Canceled','2026-11-11 15:50:31',152),(28,1,101,NULL,NULL,NULL,'Pickup',1.49,'Card',NULL,'2026-11-11 12:02:45','Canceled','2026-11-11 12:03:20',NULL),(41,59,2,NULL,NULL,NULL,'In-Store',2.98,'Cash',NULL,'2026-11-11 16:41:49','Completed',NULL,NULL),(42,59,2,NULL,NULL,NULL,'In-Store',2.49,'Cash',NULL,'2026-11-11 16:42:11','Completed',NULL,NULL),(43,59,2,NULL,NULL,NULL,'In-Store',1.49,'Cash',NULL,'2026-11-11 16:47:26','Completed',NULL,NULL),(44,59,2,NULL,NULL,NULL,'In-Store',1.49,'Cash',NULL,'2026-11-11 16:51:38','Completed',NULL,NULL),(45,1,109,NULL,NULL,NULL,'Pickup',13.41,'Card',NULL,'2026-11-11 16:55:47','Completed',NULL,NULL),(46,1,109,NULL,NULL,NULL,'Delivery',11.94,'Card',NULL,'2026-11-11 16:56:36','Completed',NULL,153),(47,72,2,NULL,NULL,NULL,'In-Store',26.37,'Cash',NULL,'2026-11-11 16:59:25','Completed',NULL,NULL),(48,1,109,9,NULL,3,'Pickup',3.20,'Card',NULL,'2026-11-11 17:05:38','Completed',NULL,NULL),(49,59,2,9,NULL,NULL,'In-Store',1.00,'Card',NULL,'2026-11-11 17:09:38','Completed',NULL,NULL),(50,1,110,NULL,NULL,NULL,'Pickup',12.43,'Card',NULL,'2026-11-11 17:29:22','Completed',NULL,NULL),(51,1,110,NULL,NULL,NULL,'Delivery',16.41,'Card',NULL,'2026-11-11 17:29:59','Completed',NULL,154),(52,73,2,NULL,NULL,NULL,'In-Store',20.39,'Cash',NULL,'2026-11-11 17:32:19','Completed',NULL,NULL),(53,73,2,NULL,NULL,NULL,'In-Store',22.41,'Cash',NULL,'2026-11-11 17:33:28','Completed',NULL,NULL),(54,1,110,9,NULL,NULL,'Pickup',3.00,'Card',NULL,'2026-11-11 17:39:58','Completed',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_OrderCancelation_BeforeUpdate` BEFORE UPDATE ON `orders` FOR EACH ROW BEGIN
  IF OLD.OrderStatus = 'Canceled' AND NEW.OrderStatus <> 'Canceled' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A canceled order cannot be reinstated.';
  END IF;

  IF OLD.OrderStatus <> 'Canceled' AND NEW.OrderStatus = 'Canceled' THEN
    IF EXISTS (SELECT 1 FROM `returns` r WHERE r.OrderID = OLD.OrderID) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This order has a return on file and cannot be canceled.';
    END IF;

    IF NEW.CanceledDate IS NULL THEN
      SET NEW.CanceledDate = CONVERT_TZ(UTC_TIMESTAMP(), '+00:00', 'America/Chicago');
    END IF;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_OrderCancelation_AfterUpdate` AFTER UPDATE ON `orders` FOR EACH ROW BEGIN

  IF OLD.OrderStatus <> 'Canceled' AND NEW.OrderStatus = 'Canceled' THEN

 

    

    INSERT INTO notifications

      (NotificationType, RecipientEmployeeID, RecipientCustomerID, Message, RelatedID)

    VALUES

      ('OrderCancelation', NULL, NEW.CustomerID,

       CONCAT('Your order #', NEW.OrderID, ' ($', FORMAT(NEW.OrderTotal, 2),

              ') was canceled on ', DATE_FORMAT(NEW.CanceledDate, '%b %e, %Y'), '.'),

       NEW.OrderID);

 

    

    INSERT INTO notifications

      (NotificationType, RecipientEmployeeID, RecipientCustomerID, Message, RelatedID)

    SELECT

      'OrderCancelation', d.ManagerID, NULL,

      CONCAT('Order #', NEW.OrderID, ' for ', c.FirstName, ' ', c.LastName,

             ' ($', FORMAT(NEW.OrderTotal, 2), ') was canceled. Handled by ',

             e.FirstName, ' ', e.LastName, '.'),

      NEW.OrderID

    FROM employees e

    JOIN departments d ON d.DepartmentID = e.DepartmentID

    JOIN customers  c ON c.CustomerID   = NEW.CustomerID

    WHERE e.EmployeeID = NEW.EmployeeID;

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `returned items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `returned items` (
  `ReturnID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `QuantityReturned` smallint unsigned NOT NULL,
  PRIMARY KEY (`ReturnID`,`ItemID`),
  KEY `ItemID` (`ItemID`) USING BTREE,
  KEY `ReturnID` (`ReturnID`) USING BTREE,
  CONSTRAINT `ItemID-Returned Items` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ReturnID-Returned Items` FOREIGN KEY (`ReturnID`) REFERENCES `returns` (`ReturnID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `QuantityReturnedRange-Returned Items` CHECK ((`QuantityReturned` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all returned items.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returned items`
--

LOCK TABLES `returned items` WRITE;
/*!40000 ALTER TABLE `returned items` DISABLE KEYS */;
/*!40000 ALTER TABLE `returned items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `returns` (
  `ReturnID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `OrderID` bigint unsigned NOT NULL,
  `EmployeeID` bigint unsigned DEFAULT NULL,
  `ReturnTotal` decimal(10,2) unsigned NOT NULL,
  `ReturnDate` datetime NOT NULL,
  PRIMARY KEY (`ReturnID`),
  KEY `OrderID-Returns` (`OrderID`),
  KEY `EmployeeID-Returns` (`EmployeeID`),
  KEY `ReturnDate` (`ReturnDate`),
  CONSTRAINT `EmployeeID-Returns` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `OrderID-Returns` FOREIGN KEY (`OrderID`) REFERENCES `orders` (`OrderID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ReturnTotalRange-Returns` CHECK ((`ReturnTotal` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all returns, see Returned Items for all returned items.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
INSERT INTO `returns` VALUES (1,1,1,2.00,'2026-10-02 00:00:00');
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale items` (
  `SaleID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `NewItemPrice` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`SaleID`,`ItemID`),
  KEY `ItemID-Items` (`ItemID`),
  KEY `SaleID` (`SaleID`),
  CONSTRAINT `ItemID-Items` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`),
  CONSTRAINT `SaleID-Sale Items` FOREIGN KEY (`SaleID`) REFERENCES `sales` (`SaleID`),
  CONSTRAINT `NewItemPriceRange-Sale Items` CHECK ((`NewItemPrice` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all items and their sale values.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale items`
--

LOCK TABLES `sale items` WRITE;
/*!40000 ALTER TABLE `sale items` DISABLE KEYS */;
/*!40000 ALTER TABLE `sale items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of sales.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (2,'Thanksgiving',NULL,NULL,'11/20','11/28'),(4,'Christmas',NULL,NULL,'12/1','1/1'),(5,'New Years',NULL,NULL,'1/1','1/2'),(6,'4th of July',NULL,NULL,'7/4','7/5'),(7,'Halloween',NULL,NULL,'10/1','11/1');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `salessummary`
--

SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `salessummary` AS SELECT 
 1 AS `SaleDate`,
 1 AS `OrderCount`,
 1 AS `TotalSales`,
 1 AS `AvgOrder`,
 1 AS `ReturnCount`,
 1 AS `ReturnTotal`,
 1 AS `NetSales`,
 1 AS `InStoreSales`,
 1 AS `PickupSales`,
 1 AS `DeliverySales`,
 1 AS `CardSales`,
 1 AS `CashSales`,
 1 AS `GiftcardSales`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `seasonal deals`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasonal deals` (
  `SeasonID` bigint unsigned NOT NULL,
  `ItemID` bigint unsigned NOT NULL,
  `NewItemPrice` double unsigned NOT NULL,
  PRIMARY KEY (`SeasonID`,`ItemID`),
  KEY `ItemID` (`ItemID`),
  KEY `SeasonID` (`SeasonID`),
  CONSTRAINT `ItemID-Seasonal Deals` FOREIGN KEY (`ItemID`) REFERENCES `items` (`ItemID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SeasonID-Seasonal Deals` FOREIGN KEY (`SeasonID`) REFERENCES `seasons` (`SeasonID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `NewItemPriceRange-Seasonal Deals` CHECK ((`NewItemPrice` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of per-item prices that apply during a season.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasonal deals`
--

LOCK TABLES `seasonal deals` WRITE;
/*!40000 ALTER TABLE `seasonal deals` DISABLE KEYS */;
INSERT INTO `seasonal deals` VALUES (9,3,1);
/*!40000 ALTER TABLE `seasonal deals` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_SeasonalDeal_BeforeInsert` BEFORE INSERT ON `seasonal deals` FOR EACH ROW BEGIN

  DECLARE v_regular DOUBLE;

 

  SELECT ItemPrice INTO v_regular FROM items WHERE ItemID = NEW.ItemID;

 

  IF NEW.NewItemPrice >= v_regular THEN

    SIGNAL SQLSTATE '45000'

      SET MESSAGE_TEXT = 'Seasonal deal price must be lower than the item regular price.';

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_SeasonalDeal_AfterInsert` AFTER INSERT ON `seasonal deals` FOR EACH ROW BEGIN

  INSERT INTO notifications

    (NotificationType, RecipientEmployeeID, RecipientCustomerID, Message, RelatedID)

  SELECT

    'SeasonalDeal', NULL, NULL,

    CONCAT('New ', s.SeasonName, ' deal: ', it.ItemName, ' is now $',

           FORMAT(NEW.NewItemPrice, 2), ' (regular $', FORMAT(it.ItemPrice, 2),

           ', save ', ROUND((1 - NEW.NewItemPrice / it.ItemPrice) * 100), '%).'),

    NEW.SeasonID

  FROM seasons s

  JOIN items  it ON it.ItemID = NEW.ItemID

  WHERE s.SeasonID = NEW.SeasonID;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_SeasonalDeal_BeforeUpdate` BEFORE UPDATE ON `seasonal deals` FOR EACH ROW BEGIN

  DECLARE v_regular DOUBLE;

 

  SELECT ItemPrice INTO v_regular FROM items WHERE ItemID = NEW.ItemID;

 

  IF NEW.NewItemPrice >= v_regular THEN

    SIGNAL SQLSTATE '45000'

      SET MESSAGE_TEXT = 'Seasonal deal price must be lower than the item regular price.';

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `seasons`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seasons` (
  `SeasonID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `SeasonName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SeasonStartDate` varchar(12) NOT NULL DEFAULT '',
  `SeasonEndDate` varchar(12) NOT NULL DEFAULT '',
  PRIMARY KEY (`SeasonID`),
  UNIQUE KEY `SeasonName` (`SeasonName`),
  CONSTRAINT `SeasonNameLength-Seasons` CHECK ((length(`SeasonName`) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of seasons.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seasons`
--

LOCK TABLES `seasons` WRITE;
/*!40000 ALTER TABLE `seasons` DISABLE KEYS */;
INSERT INTO `seasons` VALUES (1,'Spring','3/19','6/20'),(4,'Winter','12/20','3/19'),(9,'Fall','11/01','12/01');
/*!40000 ALTER TABLE `seasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `ShipmentID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `InventoryID` bigint unsigned NOT NULL,
  `EmployeeID` bigint unsigned DEFAULT NULL,
  `SupplierName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ArrivalDate` datetime DEFAULT NULL,
  `QuantityShipped` smallint unsigned NOT NULL,
  `ShipmentCost` decimal(10,2) unsigned NOT NULL,
  PRIMARY KEY (`ShipmentID`),
  KEY `InventoryID` (`InventoryID`),
  KEY `EmployeeID` (`EmployeeID`),
  KEY `ArrivalDate` (`ArrivalDate`),
  KEY `SupplierName` (`SupplierName`),
  CONSTRAINT `EmployeeID-Shipments` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`EmployeeID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryID-Shipments` FOREIGN KEY (`InventoryID`) REFERENCES `inventory` (`InventoryID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `QuantityShippedRange-Shipments` CHECK ((`QuantityShipped` > 0)),
  CONSTRAINT `ShipmentCostRange-Shipments` CHECK ((`ShipmentCost` > 0)),
  CONSTRAINT `SupplierNameLength-Shipments` CHECK ((length(`SupplierName`) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='A table of all shipments received against inventory orders.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
INSERT INTO `shipments` VALUES (4,233,1,'Banana\'s','2026-11-11 22:52:00',50,200.00),(5,235,1,'Grapefruit','2026-11-10 23:01:00',100,100.00),(6,236,1,'Plantains','2026-11-10 20:01:00',50,100.00),(7,237,1,'Yuca Supplier','2026-11-11 00:55:00',100,100.00),(8,237,1,'Admin','2026-11-11 10:05:00',9,20.00),(19,235,NULL,'admin','2026-11-09 17:01:00',20,100.00),(20,235,NULL,'Admin','2026-11-09 17:34:00',100,50.00);
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_Shipment_BeforeInsert` BEFORE INSERT ON `shipments` FOR EACH ROW BEGIN

  IF NEW.ArrivalDate IS NOT NULL AND NEW.ArrivalDate > NOW() THEN

    SIGNAL SQLSTATE '45000'

      SET MESSAGE_TEXT = 'Arrival date cannot be in the future. Leave it empty until the shipment is received.';

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_Shipment_AfterInsert` AFTER INSERT ON `shipments` FOR EACH ROW BEGIN

  DECLARE v_threshold INT DEFAULT 10;

  DECLARE v_stock     INT;

  DECLARE v_onorder   INT;

  DECLARE v_manager   BIGINT UNSIGNED;

  DECLARE v_item      VARCHAR(255);

  DECLARE v_msg       VARCHAR(1000);



  IF NEW.ArrivalDate IS NOT NULL THEN

    UPDATE inventory

       SET Stock = Stock + NEW.QuantityShipped

     WHERE InventoryID = NEW.InventoryID;

  END IF;



  -- LEFT JOINs: the inventory row may have no employee, or the department no manager

  SELECT i.Stock, it.ItemName, d.ManagerID

    INTO v_stock, v_item, v_manager

    FROM inventory i

    JOIN items            it ON it.ItemID      = i.ItemID

    LEFT JOIN employees   e  ON e.EmployeeID   = i.EmployeeID

    LEFT JOIN departments d  ON d.DepartmentID = e.DepartmentID

   WHERE i.InventoryID = NEW.InventoryID;



  SELECT COALESCE(SUM(QuantityShipped), 0)

    INTO v_onorder

    FROM shipments

   WHERE InventoryID = NEW.InventoryID

     AND ArrivalDate IS NULL;



  IF (v_stock + v_onorder) <= v_threshold THEN

    -- Proactive part even with everything on order and it stock stays low

    SET v_msg = CONCAT('LOW STOCK ALERT: ', v_item, ' has ', v_stock,

                       ' in stock and ', v_onorder, ' on order (shipment #', NEW.ShipmentID,

                       ' from ', NEW.SupplierName, '). Projected stock is ',

                       (v_stock + v_onorder), '. Order more now.');

  ELSEIF v_stock <= v_threshold THEN

    -- Stock is low right now, but enough is already on the way

    SET v_msg = CONCAT('Low stock heads-up: ', v_item, ' has ', v_stock,

                       ' in stock. ', v_onorder, ' units are on order (shipment #',

                       NEW.ShipmentID, ' from ', NEW.SupplierName, ').');

  ELSEIF NEW.ArrivalDate IS NOT NULL THEN

    SET v_msg = CONCAT('Shipment #', NEW.ShipmentID, ' received from ', NEW.SupplierName,

                       ': +', NEW.QuantityShipped, ' of ', v_item, '. Stock is now ', v_stock, '.');

  ELSE

    SET v_msg = CONCAT('Shipment #', NEW.ShipmentID, ' ordered from ', NEW.SupplierName,

                       ': ', NEW.QuantityShipped, ' of ', v_item, ' on the way. Stock ',

                       v_stock, ', on order ', v_onorder, '.');

  END IF;



  INSERT INTO notifications

    (NotificationType, RecipientEmployeeID, RecipientCustomerID, Message, RelatedID)

  VALUES

    ('Shipment', v_manager, NULL, v_msg, NEW.ShipmentID);

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_Shipment_BeforeUpdate` BEFORE UPDATE ON `shipments` FOR EACH ROW BEGIN

  IF NEW.ArrivalDate IS NOT NULL AND NEW.ArrivalDate > NOW() THEN

    SIGNAL SQLSTATE '45000'

      SET MESSAGE_TEXT = 'Arrival date cannot be in the future. Leave it empty until the shipment is received.';

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_Shipment_AfterUpdate` AFTER UPDATE ON `shipments` FOR EACH ROW BEGIN

  DECLARE v_threshold INT DEFAULT 10;

  DECLARE v_stock     INT;

  DECLARE v_onorder   INT;

  DECLARE v_manager   BIGINT UNSIGNED;

  DECLARE v_item      VARCHAR(255);

  DECLARE v_msg       VARCHAR(1000);



  IF OLD.ArrivalDate IS NULL AND NEW.ArrivalDate IS NOT NULL THEN



    UPDATE inventory

       SET Stock = Stock + NEW.QuantityShipped

     WHERE InventoryID = NEW.InventoryID;



    SELECT i.Stock, it.ItemName, d.ManagerID

      INTO v_stock, v_item, v_manager

      FROM inventory i

      JOIN items            it ON it.ItemID      = i.ItemID

      LEFT JOIN employees   e  ON e.EmployeeID   = i.EmployeeID

      LEFT JOIN departments d  ON d.DepartmentID = e.DepartmentID

     WHERE i.InventoryID = NEW.InventoryID;



    SELECT COALESCE(SUM(QuantityShipped), 0)

      INTO v_onorder

      FROM shipments

     WHERE InventoryID = NEW.InventoryID

       AND ArrivalDate IS NULL;



    IF (v_stock + v_onorder) <= v_threshold THEN

      SET v_msg = CONCAT('LOW STOCK ALERT: shipment #', NEW.ShipmentID, ' arrived, but ',

                         v_item, ' is still at ', v_stock, ' in stock with ', v_onorder,

                         ' on order. Order more now.');

    ELSEIF v_stock <= v_threshold THEN

      SET v_msg = CONCAT('Shipment #', NEW.ShipmentID, ' arrived for ', v_item,

                         ', but stock is still low at ', v_stock, '. ', v_onorder,

                         ' more units are on order.');

    ELSE

      SET v_msg = CONCAT('Shipment #', NEW.ShipmentID, ' received from ', NEW.SupplierName,

                         ': +', NEW.QuantityShipped, ' of ', v_item, '. Stock is now ', v_stock, '.');

    END IF;



    INSERT INTO notifications

      (NotificationType, RecipientEmployeeID, RecipientCustomerID, Message, RelatedID)

    VALUES

      ('Shipment', v_manager, NULL, v_msg, NEW.ShipmentID);

  END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'saveso'
--

--
-- Final view structure for view `customerreport`
--

/*!50001 DROP VIEW IF EXISTS `customerreport`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `customerreport` AS select `c`.`CustomerID` AS `CustomerID`,concat(`c`.`FirstName`,' ',`c`.`LastName`) AS `CustomerName`,(convert((case when (`c`.`MembershipExpirationDate` >= now()) then 'Active' else 'Expired' end) using utf8mb4) collate utf8mb4_0900_ai_ci) AS `Membership`,count((case when (`o`.`OrderStatus` <> 'Canceled') then `o`.`OrderID` end)) AS `OrderCount`,coalesce(sum((case when (`o`.`OrderStatus` <> 'Canceled') then `o`.`OrderTotal` end)),0) AS `TotalSpent`,round(coalesce(avg((case when (`o`.`OrderStatus` <> 'Canceled') then `o`.`OrderTotal` end)),0),2) AS `AvgOrder`,cast(max((case when (`o`.`OrderStatus` <> 'Canceled') then `o`.`OrderDate` end)) as date) AS `LastOrderDate`,coalesce(sum(`r`.`ReturnTotal`),0) AS `TotalReturned`,(coalesce(sum((case when (`o`.`OrderStatus` <> 'Canceled') then `o`.`OrderTotal` end)),0) - coalesce(sum(`r`.`ReturnTotal`),0)) AS `NetSpent`,count((case when (`o`.`OrderStatus` = 'Canceled') then `o`.`OrderID` end)) AS `CanceledOrders` from ((`customers` `c` left join `orders` `o` on((`o`.`CustomerID` = `c`.`CustomerID`))) left join (select `returns`.`OrderID` AS `OrderID`,sum(`returns`.`ReturnTotal`) AS `ReturnTotal` from `returns` group by `returns`.`OrderID`) `r` on((`r`.`OrderID` = `o`.`OrderID`))) group by `c`.`CustomerID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `itemperformance`
--

/*!50001 DROP VIEW IF EXISTS `itemperformance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `itemperformance` AS select `it`.`ItemID` AS `ItemID`,`it`.`ItemName` AS `ItemName`,`c`.`CategoryName` AS `Category`,`it`.`ItemPrice` AS `ItemPrice`,coalesce(`s`.`Units`,0) AS `UnitsSold`,coalesce(`s`.`Revenue`,0) AS `Revenue`,coalesce(`rt`.`Units`,0) AS `UnitsReturned`,(coalesce(`s`.`Units`,0) - coalesce(`rt`.`Units`,0)) AS `NetUnits`,round(((coalesce(`rt`.`Units`,0) / nullif(`s`.`Units`,0)) * 100),1) AS `ReturnRatePct` from (((`items` `it` join `item categories` `c` on((`c`.`ItemCategoryID` = `it`.`ItemCategoryID`))) left join (select `oi`.`ItemID` AS `ItemID`,sum(`oi`.`QuantityOrdered`) AS `Units`,sum((`oi`.`QuantityOrdered` * `oi`.`ItemPrice`)) AS `Revenue` from (`ordered items` `oi` join `orders` `o` on((`o`.`OrderID` = `oi`.`OrderID`))) where (`o`.`OrderStatus` <> 'Canceled') group by `oi`.`ItemID`) `s` on((`s`.`ItemID` = `it`.`ItemID`))) left join (select `returned items`.`ItemID` AS `ItemID`,sum(`returned items`.`QuantityReturned`) AS `Units` from `returned items` group by `returned items`.`ItemID`) `rt` on((`rt`.`ItemID` = `it`.`ItemID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `salessummary`
--

/*!50001 DROP VIEW IF EXISTS `salessummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `salessummary` AS select `d`.`SaleDate` AS `SaleDate`,coalesce(`s`.`OrderCount`,0) AS `OrderCount`,coalesce(`s`.`TotalSales`,0) AS `TotalSales`,coalesce(`s`.`AvgOrder`,0) AS `AvgOrder`,coalesce(`r`.`ReturnCount`,0) AS `ReturnCount`,coalesce(`r`.`ReturnTotal`,0) AS `ReturnTotal`,(coalesce(`s`.`TotalSales`,0) - coalesce(`r`.`ReturnTotal`,0)) AS `NetSales`,coalesce(`s`.`InStoreSales`,0) AS `InStoreSales`,coalesce(`s`.`PickupSales`,0) AS `PickupSales`,coalesce(`s`.`DeliverySales`,0) AS `DeliverySales`,coalesce(`s`.`CardSales`,0) AS `CardSales`,coalesce(`s`.`CashSales`,0) AS `CashSales`,coalesce(`s`.`GiftcardSales`,0) AS `GiftcardSales` from (((select cast(`o`.`OrderDate` as date) AS `SaleDate` from `orders` `o` where (`o`.`OrderStatus` <> 'Canceled') union select cast(`rt`.`ReturnDate` as date) AS `cast(rt.``ReturnDate`` as date)` from (`returns` `rt` join `orders` `o` on((`o`.`OrderID` = `rt`.`OrderID`))) where (`o`.`OrderStatus` <> 'Canceled')) `d` left join (select cast(`o`.`OrderDate` as date) AS `SaleDate`,count(0) AS `OrderCount`,sum(`o`.`OrderTotal`) AS `TotalSales`,round(avg(`o`.`OrderTotal`),2) AS `AvgOrder`,sum((case when (`o`.`OrderType` = 'In-Store') then `o`.`OrderTotal` else 0 end)) AS `InStoreSales`,sum((case when (`o`.`OrderType` = 'Pickup') then `o`.`OrderTotal` else 0 end)) AS `PickupSales`,sum((case when (`o`.`OrderType` = 'Delivery') then `o`.`OrderTotal` else 0 end)) AS `DeliverySales`,sum((case when (`o`.`PaymentMethod` = 'Card') then `o`.`OrderTotal` else 0 end)) AS `CardSales`,sum((case when (`o`.`PaymentMethod` = 'Cash') then `o`.`OrderTotal` else 0 end)) AS `CashSales`,sum((case when (`o`.`PaymentMethod` = 'Giftcard') then `o`.`OrderTotal` else 0 end)) AS `GiftcardSales` from `orders` `o` where (`o`.`OrderStatus` <> 'Canceled') group by cast(`o`.`OrderDate` as date)) `s` on((`s`.`SaleDate` = `d`.`SaleDate`))) left join (select cast(`rt`.`ReturnDate` as date) AS `SaleDate`,count(0) AS `ReturnCount`,sum(`rt`.`ReturnTotal`) AS `ReturnTotal` from (`returns` `rt` join `orders` `o` on((`o`.`OrderID` = `rt`.`OrderID`))) where (`o`.`OrderStatus` <> 'Canceled') group by cast(`rt`.`ReturnDate` as date)) `r` on((`r`.`SaleDate` = `d`.`SaleDate`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-15 18:29:38

CREATE TABLE ADDRESSES (ID INTEGER AUTO_INCREMENT NOT NULL, CITY VARCHAR(255) NOT NULL, COUNTRY VARCHAR(255), LATITUDE DOUBLE, LONGITUDE DOUBLE, NAME VARCHAR(255), STREET VARCHAR(255) NOT NULL, STREETNR VARCHAR(255), ZIP VARCHAR(255) NOT NULL, ITEM_ID INTEGER, USER_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE BANK_ACCOUNTS (ID INTEGER AUTO_INCREMENT NOT NULL, BANKNAME VARCHAR(255), BIC VARCHAR(255) NOT NULL, IBAN VARCHAR(255) NOT NULL, NAME VARCHAR(255), USER_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE COLORS (ID INTEGER AUTO_INCREMENT NOT NULL, HEX VARCHAR(255) NOT NULL, NAME VARCHAR(255) NOT NULL, PRIMARY KEY (ID))
CREATE TABLE COMMENTS (ID INTEGER AUTO_INCREMENT NOT NULL, CONTENT VARCHAR(255) NOT NULL, TIMESTAMP DATETIME NOT NULL, AUTHOR INTEGER NOT NULL, ITEM INTEGER NOT NULL, PARENT_ID INTEGER, CHILDREN INTEGER, PRIMARY KEY (ID))
CREATE TABLE ENTRY_CATEGORIES (ID INTEGER NOT NULL, CATEGORY INTEGER NOT NULL, NAME VARCHAR(255) NOT NULL, PRIMARY KEY (ID))
CREATE TABLE ENTRIES (ID INTEGER AUTO_INCREMENT NOT NULL, ACTUALVALUE DECIMAL(12,2) NOT NULL, COMMENT VARCHAR(255), DATE DATETIME NOT NULL, IS_INCOME TINYINT(1) default 0, NAME VARCHAR(255) NOT NULL, VALUE DECIMAL(12,2) NOT NULL, CATEGORY_ID INTEGER NOT NULL, ITEM_ID INTEGER NOT NULL, PRIMARY KEY (ID))
CREATE TABLE IMAGES (ID INTEGER AUTO_INCREMENT NOT NULL, FILENAME VARCHAR(255), ENTRY_ID INTEGER, ITEM_ID INTEGER, USER_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE ORDERS (ID INTEGER AUTO_INCREMENT NOT NULL, METHOD INTEGER, TEXT VARCHAR(255), TIMESTAMP DATETIME NOT NULL, BANKACCOUNT_ID INTEGER, USER_ID INTEGER NOT NULL, PRIMARY KEY (ID))
CREATE TABLE ORDERED_ITEMS (ID INTEGER AUTO_INCREMENT NOT NULL, IS_DRIVER TINYINT(1) default 0, NEEDS_TICKET TINYINT(1) default 0, PRICE DECIMAL(38), SIZE VARCHAR(255), STATUS INTEGER, COLOR_ID INTEGER, ITEM_ID INTEGER NOT NULL, ORDER_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE PERMISSION_STATES (ID INTEGER AUTO_INCREMENT NOT NULL, FUNDS INTEGER, MERCH INTEGER, PARTY INTEGER, SETTINGS INTEGER, STOCK INTEGER, TOUR INTEGER, USERMANAGEMENT INTEGER, PRIMARY KEY (ID))
CREATE TABLE SHOP_ITEMS (ID INTEGER AUTO_INCREMENT NOT NULL, CAPACITY INTEGER NOT NULL, DATE DATETIME NOT NULL, DESCRIPTION LONGTEXT, EXPECTEDCHECKINROLE INTEGER, EXPECTEDREADROLE INTEGER, EXPECTEDWRITEROLE INTEGER, MATERIAL VARCHAR(255), MILES INTEGER, PRICE DECIMAL(12,2) NOT NULL, TITLE VARCHAR(255) NOT NULL, TYPE INTEGER NOT NULL, VEHICLE VARCHAR(255), GROUPPICTURE_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE STOCK (ID INTEGER AUTO_INCREMENT NOT NULL, AMOUNT INTEGER, SIZE VARCHAR(255), COLOR_ID INTEGER, ITEM_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE SIZE_TABLE (ID INTEGER AUTO_INCREMENT NOT NULL, MAX INTEGER, MIN INTEGER NOT NULL, NAME VARCHAR(255) NOT NULL, STOCK_ID INTEGER, SIZETABLE_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE USERS (ID INTEGER AUTO_INCREMENT NOT NULL, BIRTHDAY DATE NOT NULL, CLUBROLE INTEGER, EMAIL VARCHAR(255) NOT NULL, FIRST_NAME VARCHAR(255) NOT NULL, GENDER VARCHAR(255), HASDEBITAUTH TINYINT(1) default 0, HAS_SEASON_TICKET TINYINT(1) default 0, ISSTUDENT TINYINT(1) default 0, IS_WOELFE_CLUB_MEMBER TINYINT(1) default 0, JOIN_DATE DATE NOT NULL, MILES INTEGER NOT NULL, MOBILE VARCHAR(255), PASSWORD VARCHAR(255) NOT NULL, SURNAME VARCHAR(255) NOT NULL, TELEPHONE VARCHAR(255), PERMISSIONS_ID INTEGER, PRIMARY KEY (ID))
CREATE TABLE user_authoreditems (author_id INTEGER NOT NULL, authoreditems_id INTEGER NOT NULL, PRIMARY KEY (author_id, authoreditems_id))
CREATE TABLE user_reportresponsibilities (reportwriters_id INTEGER NOT NULL, reportresponsibilities_id INTEGER NOT NULL, PRIMARY KEY (reportwriters_id, reportresponsibilities_id))
ALTER TABLE ADDRESSES ADD CONSTRAINT FK_ADDRESSES_ITEM_ID FOREIGN KEY (ITEM_ID) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE ADDRESSES ADD CONSTRAINT FK_ADDRESSES_USER_ID FOREIGN KEY (USER_ID) REFERENCES USERS (ID)
ALTER TABLE BANK_ACCOUNTS ADD CONSTRAINT FK_BANK_ACCOUNTS_USER_ID FOREIGN KEY (USER_ID) REFERENCES USERS (ID)
ALTER TABLE COMMENTS ADD CONSTRAINT FK_COMMENTS_AUTHOR FOREIGN KEY (AUTHOR) REFERENCES USERS (ID)
ALTER TABLE COMMENTS ADD CONSTRAINT FK_COMMENTS_ITEM FOREIGN KEY (ITEM) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE COMMENTS ADD CONSTRAINT FK_COMMENTS_PARENT_ID FOREIGN KEY (PARENT_ID) REFERENCES COMMENTS (ID)
ALTER TABLE COMMENTS ADD CONSTRAINT FK_COMMENTS_CHILDREN FOREIGN KEY (CHILDREN) REFERENCES COMMENTS (ID)
ALTER TABLE ENTRIES ADD CONSTRAINT FK_ENTRIES_CATEGORY_ID FOREIGN KEY (CATEGORY_ID) REFERENCES ENTRY_CATEGORIES (ID)
ALTER TABLE ENTRIES ADD CONSTRAINT FK_ENTRIES_ITEM_ID FOREIGN KEY (ITEM_ID) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE IMAGES ADD CONSTRAINT FK_IMAGES_ENTRY_ID FOREIGN KEY (ENTRY_ID) REFERENCES ENTRIES (ID)
ALTER TABLE IMAGES ADD CONSTRAINT FK_IMAGES_ITEM_ID FOREIGN KEY (ITEM_ID) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE IMAGES ADD CONSTRAINT FK_IMAGES_USER_ID FOREIGN KEY (USER_ID) REFERENCES USERS (ID)
ALTER TABLE ORDERS ADD CONSTRAINT FK_ORDERS_BANKACCOUNT_ID FOREIGN KEY (BANKACCOUNT_ID) REFERENCES BANK_ACCOUNTS (ID)
ALTER TABLE ORDERS ADD CONSTRAINT FK_ORDERS_USER_ID FOREIGN KEY (USER_ID) REFERENCES USERS (ID)
ALTER TABLE ORDERED_ITEMS ADD CONSTRAINT FK_ORDERED_ITEMS_ORDER_ID FOREIGN KEY (ORDER_ID) REFERENCES ORDERS (ID)
ALTER TABLE ORDERED_ITEMS ADD CONSTRAINT FK_ORDERED_ITEMS_COLOR_ID FOREIGN KEY (COLOR_ID) REFERENCES COLORS (ID)
ALTER TABLE ORDERED_ITEMS ADD CONSTRAINT FK_ORDERED_ITEMS_ITEM_ID FOREIGN KEY (ITEM_ID) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE SHOP_ITEMS ADD CONSTRAINT FK_SHOP_ITEMS_GROUPPICTURE_ID FOREIGN KEY (GROUPPICTURE_ID) REFERENCES IMAGES (ID)
ALTER TABLE STOCK ADD CONSTRAINT FK_STOCK_ITEM_ID FOREIGN KEY (ITEM_ID) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE STOCK ADD CONSTRAINT FK_STOCK_COLOR_ID FOREIGN KEY (COLOR_ID) REFERENCES COLORS (ID)
ALTER TABLE SIZE_TABLE ADD CONSTRAINT FK_SIZE_TABLE_STOCK_ID FOREIGN KEY (STOCK_ID) REFERENCES STOCK (ID)
ALTER TABLE SIZE_TABLE ADD CONSTRAINT FK_SIZE_TABLE_SIZETABLE_ID FOREIGN KEY (SIZETABLE_ID) REFERENCES STOCK (ID)
ALTER TABLE USERS ADD CONSTRAINT FK_USERS_PERMISSIONS_ID FOREIGN KEY (PERMISSIONS_ID) REFERENCES PERMISSION_STATES (ID)
ALTER TABLE user_authoreditems ADD CONSTRAINT FK_user_authoreditems_author_id FOREIGN KEY (author_id) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE user_authoreditems ADD CONSTRAINT FK_user_authoreditems_authoreditems_id FOREIGN KEY (authoreditems_id) REFERENCES USERS (ID)
ALTER TABLE user_reportresponsibilities ADD CONSTRAINT FK_user_reportresponsibilities_reportwriters_id FOREIGN KEY (reportwriters_id) REFERENCES SHOP_ITEMS (ID)
ALTER TABLE user_reportresponsibilities ADD CONSTRAINT userreportresponsibilitiesreportresponsibilitiesid FOREIGN KEY (reportresponsibilities_id) REFERENCES USERS (ID)

package lib.database;


import org.springframework.jdbc.core.JdbcTemplate;
import lib.model.User;


/**
 * Created by gzae on 1/6/17.
 */
public class DatabaseHandler {


    private final JdbcTemplate jdbc;




    public DatabaseHandler(){

        jdbc = new JdbcTemplate();
        InitializeTables();
    }


    private void InitializeTables(){
        //TODO: Implement

        jdbc.execute("DROP TABLE IF EXISTS clubRole");
        jdbc.execute("CREATE TABLE clubRole(" +
                "clubRoleID                 TINYINT PRIMARY KEY," +
                "roleName                   VARCHAR(32))");

        jdbc.execute("DROP TABLE IF EXISTS permission");
        jdbc.execute("CREATE TABLE permission(" +
                "permissionID               TINYINT PRIMARY KEY," +
                "permissionName             VARCHAR(32))");

        jdbc.execute("DROP TABLE IF EXISTS category");
        jdbc.execute("CREATE TABLE category(" +
                "categoryID                 TINYINT PRIMARY KEY," +
                "categoryName               VARCHAR(32))");

        jdbc.execute("DROP TABLE IF EXISTS entry ");
        jdbc.execute("CREATE TABLE entry(" +
                "entryID                     INT PRIMARY KEY," +
                "entryName                   VARCHAR(64)," +
                "categoryID                  TINYINT)");

        jdbc.execute("DROP TABLE IF EXISTS merchSize");
        jdbc.execute("CREATE TABLE merchSize(" +
                "sizeID                      INT PRIMARY KEY," +
                "SizeName                    VARCHAR(64))");

        jdbc.execute("DROP TABLE IF EXISTS itemType");
        jdbc.execute("CREATE TABLE itemType(" +
                "typeID                     INT PRIMARY KEY," +
                "typeName                   VARCHAR(32))");

        jdbc.execute("DROP TABLE IF EXISTS address");
        jdbc.execute("CREATE TABLE address(" +
                "adressID                   INT PRIMARY KEY," +
                "name                       VARCHAR(64)," +
                "street                     VARCHAR(64)," +
                "streetnr                   VARCHAR(8) ," +
                "zip                        VARCHAR(16)," +
                "city                       VARCHAR(64)," +
                "country                    VARCHAR(64))");

        jdbc.execute("DROP TABLE IF EXISTS bankAccount");
        jdbc.execute("CREATE TABLE bankAccount( " +
                "AccountID                  INT PRIMARY KEY, " +
                "FullName                   VARCHAR(128)," +
                "IBAN                       VARCHAR(34)," +
                "BIC                        VARCHAR(11))");

        jdbc.execute("DROP TABLE IF EXISTS user");
        jdbc.execute("CREATE TABLE user(" +
                "userID                   INT PRIMARY KEY," +
                "lastName                   VARCHAR(64)," +
                "firstName                  VARCHAR(64)," +
                "birthday                   DATE, " +
                "telephone                  VARCHAR(40)," +
                "clubRoleID                 TINYINT, " +
                "merchPermissionID          TINYINT, " +
                "userManagementPermissionID TINYINT, " +
                "tourPermissionID           TINYINT," +
                "partyPermissionID          TINYINT, " +
                "fundsPermissionID          TINYINT, " +
                "miles                      INT, " +
                "picPath                    VARCHAR(255)," +
                "email                      VARCHAR(128)," +
                "passwordHash               VARCHAR(255)," +
                "isStudent                  BOOLEAN, " +
                "hasDebitAuth               BOOLEAN, " +
                "bankAccountID              INT," +
                "addressID                  INT," +
                "FOREIGN KEY (bankAccountID) REFERENCES bankAccount(accountID)," +
                "FOREIGN KEY (addressID) REFERENCES  address(addressID)," +
                "FOREIGN KEY (clubRoleID) REFERENCES clubRole(clubRoleID)," +
                "FOREIGN KEY (merchPermissionID) REFERENCES  permission(permissionID)," +
                "FOREIGN KEY (userManagementPermissionID) REFERENCES  permission(permissionID)," +
                "FOREIGN KEY (tourPermissionID) REFERENCES  permission(permissionID)," +
                "FOREIGN KEY (partyPermissionID) REFERENCES  permission(permissionID)," +
                "FOREIGN KEY (fundsPermissionID) REFERENCES  permission(permissionID))");

        jdbc.execute("DROP TABLE IF EXISTS item");
        jdbc.execute("CREATE TABLE item(" +
                "itemID                      INT PRIMARY KEY," +
                "title                       VARCHAR(64)," +
                "date                        DATETIME," +
                "description                 TEXT," +
                "expectedRoleID              TINYINT," +
                "picPath                     VARCHAR(255)," +
                "capacity                    INT," +
                "priceMember                 INT," +
                "price                       INT," +
                "meetingPointID              INT," +
                "vehicle                     VARCHAR(64)," +
                "miles                       INT," +
                "destination                 VARCHAR(64)," +
                "emptySeats                  INT," +
                "responsableID               INT," +
                "typeID                      INT," +
                "FOREIGN KEY (expectedRoleID) REFERENCES clubRole(clubRoleID)," +
                "FOREIGN KEY (responsableID) REFERENCES user(userID)," +
                "FOREIGN KEY (typeID) REFERENCES itemType (typeID))");

        jdbc.execute("DROP TABLE IF EXISTS inStock");
        jdbc.execute("CREATE TABLE inStock(" +
                "itemID                     INT," +
                "sizeID                     INT," +
                "count                      INT," +
                "PRIMARY KEY (itemID,sizeID)," +
                "FOREIGN KEY (itemID) REFERENCES event(itemID)," +
                "FOREIGN KEY (sizeID) REFERENCES merchSize(sizeID))");

        jdbc.execute("DROP TABLE IF EXISTS hasEntry");
        jdbc.execute("CREATE TABLE hasEntry(" +
                "itemID                     INT," +
                "entryID                    INT," +
                "PRIMARY KEY (itemID,entryID)," +
                "FOREIGN KEY (itemID) REFERENCES item(itemID)," +
                "FOREIGN KEY (entryID) REFERENCES entry(entryID))");

        jdbc.execute("DROP TABLE IF EXISTS participates");
        jdbc.execute("CREATE TABLE participates(" +
                "userID                     INT," +
                "itemID                    INT," +
                "isDriver                   BOOLEAN," +
                "hasTicket                  BOOLEAN," +
                "status                     TINYINT," +
                "description                TEXT," +
                "PRIMARY KEY (userID,eventID)," +
                "FOREIGN KEY (userID) REFERENCES user(userID)," +
                "FOREIGN KEY (itemID) REFERENCES item(itemID))");
    }

    public User getUser(int ID){

        //TODO: implement
        return null;
    }


}


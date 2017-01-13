package lib.database;


import lib.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Created by gzae on 1/6/17.
 */
public class DatabaseHandler {

//    @Autowired
//    private JdbcTemplate jdbc;


    public DatabaseHandler() {

    }


    private void InitializeTables() {
        //TODO: Implement
//        jdbc.execute("DROP TABLE address IF EXISTS");
//        jdbc.execute("CREATE TABLE address(" +
//                "adressID : int," +
//                "name     : VARCHAR(64)," +
//                "street   : VARCHAR(64)," +
//                "streetnr : VARCHAR(8)," +
//                "zip      : VARCHAR(16)," +
//                "city     : VARCHAR(64)," +
//                "country  : VARCHAR(64)," +
//                "PRIMARY KEY (addressID))");
//        jdbc.execute("DROP TABLE bankAccount IF EXISTS");
//        jdbc.execute("CREATE TABLE bankAccount( " +
//                "AccountID : VARCHAR(10), " +
//                "FullName  : VARCHAR(128)," +
//                "IBAN      : VARCHAR(34)," +
//                "BIC       : VARCHAR(11)");
//
//        jdbc.execute("DROP TABLE user IF EXISTS");
//        jdbc.execute("CREATE TABLE user(" +
//                "memberID                   : VARCHAR(10) ," +
//                "lastName                   : VARCHAR(64)," +
//                "firstName                  : VARCHAR(64)," +
//                "birthday                   : DATE, " +
//                "telephone                  : VARCHAR(40)," +
//                "clubRole                   : SMALLINT, " +
//                "merchPermission            : SMALLINT, " +
//                "userManagementPermission   : SMALLINT, " +
//                "tourPermission             : SMALLINT," +
//                "partyPermission            : SMALLINT, " +
//                "fundsPermission            : SMALLINT, " +
//                "miles                      : INT, " +
//                "email                      : VARCHAR(128)," +
//                "passwordHash               : VARCHAR(255)," +
//                "isStudent                  : BOOLEAN, " +
//                "hasDebitAuth               : BOOLEAN, " +
//                "bankAccountID              : INT," +
//                "addressID                  : INT," +
//                "PRIMARY KEY (memberID)," +
//                "FOREIGN KEY (bankAccountID) REFERENCES bankAccount(accountID)," +
//                "FOREIGN KEY (addressID) REFERENCES  address(addressID))");
    }

    public User getUser(int ID) {

        //TODO: implement
        return null;
    }
}


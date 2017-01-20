package lib.model;

import java.util.Date;

/**
 * Created by gzae on 12/13/16.
 */
public class User {

    public int memberID;
    public String firstName;
    public String LastName;
    public Date birthDate;
    public String telephone;
    public ClubRole ClubRole;
    public Permission merchPermission;
    public Permission userManagementPermission;
    public Permission tourPermission;
    public Permission partyPermission;
    public Permission fundsPermission;
    public int miles;
    public String picPath;
    public String email;
    public String passwordHash;
    public Boolean isStudent;
    public Boolean hasDebitAuth;
    public BankAccount bankAccount;
    public Address address;


    public User() {

    }


}

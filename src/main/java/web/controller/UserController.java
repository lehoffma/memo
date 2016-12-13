package web.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import shared.model.*;

import java.util.Date;

/**
 * Created by gzae on 12/13/16.
 */

@RestController
public class UserController {


    @RequestMapping("/user")
    public User getUser ()//@RequestParam(value="ID")int ID)
    {
        int ID = 1;
        //TODO: Ask SQL for UserData

        User _user = new User();
        _user.birthDate = new Date(1994,8,12);
        _user.ClubRole = ClubRole.Kasse;
        _user.email = "nils.poecking@hotmail.de";
        _user.fundsPermission = Permission.write;
        _user.hasDebitAuth = true;
        _user.isStudent = true;
        _user.memberID = ID;
        _user.merchPermission = Permission.read;
        _user.miles = 1337;
        _user.firstName = "Nils";
        _user.partyPermission = Permission.read;
        _user.passwordHash = "tohuuihgrohujt0uiwe89jg7";
        _user.surname = "Pöcking";
        _user.telephone = "+(49) 176 / 84 80 62 85";
        _user.userManagementPermission = Permission.read;
        _user.tourPermission = Permission.read;
        _user.bankAccount = new BankAccount("Nils Pöcking", "DE31270200001514940236","VOWADE2BXXX");
        _user.address = new Address(1,"Nils Pöcking","Helmstedter Str.", "58", "39112", "Magdeburg", "Deutschland");

        // TODO: HIDE SOME DATA (JSON IGNORE PROPERTY)
        // HINT: JSON VIEW

        return _user;
    }
}

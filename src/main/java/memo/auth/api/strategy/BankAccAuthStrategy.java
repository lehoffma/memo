package memo.auth.api.strategy;

import memo.model.BankAcc;
import memo.model.Permission;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.*;

public class BankAccAuthStrategy implements AuthenticationStrategy<BankAcc> {

    @Override
    public boolean isAllowedToRead(User user, BankAcc object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //  user fulfills the minimum permissions
                userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.read),
                //  user is author of bankAcc object
                userIsAuthor(BankAcc::getUser),

                //if the user is logged out:
                //  only return true if account hasnt been assigned anything (i.e. user is in registration process)
                userIsInRegistrationProcess(BankAcc::getUser)
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<BankAcc> root, User user) {
        return null;
    }

    @Override
    public boolean isAllowedToCreate(User user, BankAcc object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //  user fulfills the minimum permissions
                userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.create),
                //  user is author of bankAcc object
                userIsAuthor(BankAcc::getUser),

                //if the user is logged out:
                //  only return true if account hasnt been assigned anything (i.e. user is in registration process)
                userIsInRegistrationProcess(BankAcc::getUser)
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, BankAcc object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //  user fulfills the minimum permissions
                userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.write),
                //  user is author of bankAcc object
                userIsAuthor(BankAcc::getUser),

                //if the user is logged out:
                //  only return true if account hasnt been assigned anything (i.e. user is in registration process)
                userIsInRegistrationProcess(BankAcc::getUser)
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, BankAcc object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //if user is logged in:
                //  user fulfills the minimum permissions
                userHasCorrectPermission(it -> it.getPermissions().getUserManagement(), Permission.delete),
                //  user is author of bankAcc object
                userIsAuthor(BankAcc::getUser),

                //if the user is logged out:
                //  only return true if account hasnt been assigned anything (i.e. user is in registration process)
                userIsInRegistrationProcess(BankAcc::getUser)
        ));
    }
}

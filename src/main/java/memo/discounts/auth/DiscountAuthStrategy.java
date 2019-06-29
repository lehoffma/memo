package memo.discounts.auth;

import memo.auth.api.strategy.AuthenticationStrategy;
import memo.discounts.model.DiscountEntity;
import memo.model.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;

@Named
@ApplicationScoped
public class DiscountAuthStrategy implements AuthenticationStrategy<DiscountEntity> {
    @Override
    public boolean isAllowedToRead(User user, DiscountEntity object) {
        return true;
    }

    @Override
    public boolean isAllowedToCreate(User user, DiscountEntity object) {
        return false;
    }

    @Override
    public boolean isAllowedToModify(User user, DiscountEntity object) {
        return false;
    }

    @Override
    public boolean isAllowedToDelete(User user, DiscountEntity object) {
        return false;
    }
}

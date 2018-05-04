package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.data.util.PredicateFactory;
import memo.model.ClubRole;
import memo.model.Image;
import memo.model.User;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

public class ImageAuthStrategy implements AuthenticationStrategy<Image> {
    @Override
    public boolean isAllowedToRead(User user, Image object) {
        return true;
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Image> root, User user) {
        return PredicateFactory.isTrue(builder);
    }

    @Override
    public boolean isAllowedToCreate(User user, Image object) {
        return true;
    }

    @Override
    public boolean isAllowedToModify(User user, Image object) {
        return false;
    }

    @Override
    public boolean isAllowedToDelete(User user, Image object) {
        return userIsAuthorized(user, object, Arrays.asList(
                AuthenticationConditionFactory.userIsAuthor(Image::getUser),
                AuthenticationConditionFactory.userFulfillsMinimumRole(() -> ClubRole.Admin)
        ));
    }
}

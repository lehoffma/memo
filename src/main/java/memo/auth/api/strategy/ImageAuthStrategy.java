package memo.auth.api.strategy;

import memo.auth.api.AuthenticationConditionFactory;
import memo.model.ClubRole;
import memo.model.Image;
import memo.model.User;

import java.util.Arrays;

public class ImageAuthStrategy implements AuthenticationStrategy<Image> {
    @Override
    public boolean isAllowedToRead(User user, Image object) {
        return true;
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

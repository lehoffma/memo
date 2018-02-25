package memo.auth.api;

import memo.model.ClubRole;
import memo.model.Comment;
import memo.model.ShopItem;
import memo.model.User;

import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.*;

public class CommentAuthStrategy implements AuthenticationStrategy<Comment> {
    @Override
    public boolean isAllowedToRead(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRole(Comment::getItem, ShopItem::getExpectedReadRole)
        ));
    }

    @Override
    public boolean isAllowedToCreate(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRole(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRole(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //only the author can change the content of a comment
                        .and(userIsAuthor(comment -> Arrays.asList(comment.getAuthor()))),

                //user has to be able to view the associated shopItem
                userFulfillsMinimumRole(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //admins can change the content of a comment, too
                        .and(userFulfillsMinimumRole(Comment::getItem, shopItem -> ClubRole.Admin))
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRole(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //only the author can change the content of a comment
                        .and(userIsAuthor(comment -> Arrays.asList(comment.getAuthor()))),

                //user has to be able to view the associated shopItem
                userFulfillsMinimumRole(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //admins can change the content of a comment, too
                        .and(userFulfillsMinimumRole(Comment::getItem, shopItem -> ClubRole.Admin))
        ));
    }
}

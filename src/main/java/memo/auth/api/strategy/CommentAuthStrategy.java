package memo.auth.api.strategy;

import memo.auth.api.AuthenticationPredicateFactory;
import memo.model.ClubRole;
import memo.model.Comment;
import memo.model.ShopItem;
import memo.model.User;

import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;

import static memo.auth.api.AuthenticationConditionFactory.*;

@Named
@ApplicationScoped
public class CommentAuthStrategy implements AuthenticationStrategy<Comment> {
    @Override
    public boolean isAllowedToRead(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRoleOfItem(Comment::getItem, ShopItem::getExpectedReadRole)
        ));
    }

    @Override
    public Predicate isAllowedToRead(CriteriaBuilder builder, Root<Comment> root, User user) {
        return AuthenticationPredicateFactory.userFulfillsMinimumRoleOfItem(builder, user, root,
                "item", "expectedReadRole");
    }

    @Override
    public boolean isAllowedToCreate(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRoleOfItem(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
        ));
    }

    @Override
    public boolean isAllowedToModify(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRoleOfItem(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //only the author can change the content of a comment
                        .and(userIsAuthor(Comment::getAuthor)),

                //user has to be able to view the associated shopItem
                userFulfillsMinimumRoleOfItem(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //admins can change the content of a comment, too
                        .and(userFulfillsMinimumRoleOfItem(Comment::getItem, shopItem -> ClubRole.Admin))
        ));
    }

    @Override
    public boolean isAllowedToDelete(User user, Comment object) {
        return userIsAuthorized(user, object, Arrays.asList(
                //user has to be able to view the associated shopItem
                userFulfillsMinimumRoleOfItem(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //only the author can change the content of a comment
                        .and(userIsAuthor(Comment::getAuthor)),

                //user has to be able to view the associated shopItem
                userFulfillsMinimumRoleOfItem(Comment::getItem, ShopItem::getExpectedReadRole)
                        //user has to be logged in to comment
                        .and(userIsLoggedOut().negate())
                        //admins can change the content of a comment, too
                        .and(userFulfillsMinimumRoleOfItem(Comment::getItem, shopItem -> ClubRole.Admin))
        ));
    }
}

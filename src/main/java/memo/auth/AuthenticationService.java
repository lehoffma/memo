package memo.auth;

import memo.data.UserRepository;
import memo.model.ClubRole;
import memo.model.Permission;
import memo.model.User;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.function.BiPredicate;
import java.util.function.Function;
import java.util.stream.Collectors;

public class AuthenticationService {

    public static boolean hasMinimumRole(ClubRole role, ClubRole minimumRole) {
        return role.ordinal() >= minimumRole.ordinal();
    }

    public static boolean hasMinimumPermission(Permission permission, Permission minimumPermission) {
        return permission.ordinal() >= minimumPermission.ordinal();
    }

    public static boolean isAuthorized(ClubRole userRole, Permission userPermission,
                                       ClubRole minimumRole, Permission minimumPermission) {
        return hasMinimumRole(userRole, minimumRole) || hasMinimumPermission(userPermission, minimumPermission);
    }

    public static boolean isAuthorized(User user,
                                       Function<User, ClubRole> clubRoleSupplier,
                                       Function<User, Permission> permissionSupplier,
                                       ClubRole minimumRole, Permission minimumPermission) {
        return isAuthorized(clubRoleSupplier.apply(user), permissionSupplier.apply(user), minimumRole, minimumPermission);
    }

    public static Optional<User> parseUserFromRequestHeader(HttpServletRequest request) {
        return TokenService.getJwtFromRequest(request)
                .flatMap(jwt -> TokenService.getSubjectOfToken(KeyGenerator.getAccessKey(), jwt))
                .map(email -> UserRepository.getInstance().getUserByEmail(email))
                .map(users -> users.get(0));
    }

    public static <T> List<T> filterUnauthorized(List<T> items,
                                                 BiPredicate<User, T> itemIsAllowed,
                                                 HttpServletRequest request) {
        //parse user from authorization header of request
        User authorizedUser = parseUserFromRequestHeader(request)
                .orElse(null);

        return items.stream()
                .filter(item -> itemIsAllowed.test(authorizedUser, item))
                .collect(Collectors.toList());
    }


    public static <T> boolean userIsAuthorized(HttpServletRequest request,
                                               BiPredicate<User, T> isAllowed,
                                               T item) {
        //todo doesnt work when registering a new user
        return AuthenticationService.parseUserFromRequestHeader(request)
                .map(user -> isAllowed.test(user, item))
                .orElse(false);
    }
}

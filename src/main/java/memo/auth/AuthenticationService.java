package memo.auth;

import memo.data.UserRepository;
import memo.model.User;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.function.BiPredicate;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class AuthenticationService {
    private UserRepository userRepository;

    public AuthenticationService() {

    }

    @Inject
    public AuthenticationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private Optional<User> parseUserFromRequestHeader(HttpServletRequest request) {
        return TokenService.getJwtFromRequest(request)
                .flatMap(jwt -> TokenService.getSubjectOfToken(KeyGenerator.getAccessKey(), jwt))
                .map(email -> userRepository.findByEmail(email))
                .filter(users -> users.size() > 0)
                .map(users -> users.get(0));
    }


    public Optional<User> parseUserFromToken(String jwt) {
        return TokenService.getSubjectOfToken(KeyGenerator.getAccessKey(), jwt)
                .map(email -> userRepository.findByEmail(email))
                .filter(users -> users.size() > 0)
                .map(users -> users.get(0));
    }

    public User parseNullableUserFromRequestHeader(HttpServletRequest request) {
        return parseUserFromRequestHeader(request).orElse(null);
    }

    public <T> List<T> filterUnauthorized(List<T> items,
                                          BiPredicate<User, T> itemIsAllowed,
                                          HttpServletRequest request) {
        //parse user from authorization header of request
        User authorizedUser = parseNullableUserFromRequestHeader(request);
        return items.stream()
                .filter(item -> itemIsAllowed.test(authorizedUser, item))
                .collect(Collectors.toList());
    }


    public <T> boolean userIsAuthorized(HttpServletRequest request,
                                        BiPredicate<User, T> isAllowed,
                                        T item) {
        User user = this.parseNullableUserFromRequestHeader(request);
        return isAllowed.test(user, item);
    }
}

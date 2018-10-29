package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.AuthenticationService;
import memo.auth.BCryptHelper;
import memo.auth.api.strategy.UserAuthStrategy;
import memo.communication.strategy.UserNotificationStrategy;
import memo.data.UserRepository;
import memo.model.*;
import memo.util.JsonHelper;
import org.apache.logging.log4j.LogManager;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.List;

@Path("/user")
@Named
@RequestScoped
public class UserServlet extends AbstractApiServlet<User> {
    private UserRepository userRepository;

    public UserServlet() {
        super();
    }

    @Inject
    public UserServlet(UserRepository userRepository,
                       UserAuthStrategy authStrategy,
                       UserNotificationStrategy notifyStrategy,
                       AuthenticationService authService) {
        logger = LogManager.getLogger(UserServlet.class);
        this.userRepository = userRepository;
        this.authenticationStrategy = authStrategy;
        this.notificationStrategy = notifyStrategy;
        this.authenticationService = authService;
    }


    /**
     * Hashes the password of a user, if it hasn't been hashed already.
     *
     * @param user the user whose password we want to hash
     * @return the modified user
     */
    private User hashPassword(User user) {
        String password = user.getPassword();
        if (!BCryptHelper.isBCryptHash(password)) {
            String hashedPassword = BCryptHelper.hashPassword(password);
            user.setPassword(hashedPassword);
        }
        return user;
    }

    /**
     * @param user
     * @return
     */
    private User setDefaultPermissions(User user) {
        if (user.getPermissions() == null) {
            user.setPermissions(new PermissionState(user));
        } else {
            user.getPermissions().updateFromClubRole(user.getClubRole());
        }

        return user;
    }

    /**
     * @param user
     * @return
     */
    private User setDefaultValues(User user) {
        user = this.hashPassword(user);
        return this.setDefaultPermissions(user);
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Object get(@Context HttpServletRequest request) {
        return this.get(request, userRepository);
    }

    @HEAD
    @Produces({MediaType.APPLICATION_JSON})
    public Response head(@QueryParam("email") String email, @Context HttpServletRequest request) {
        logger.trace("HEAD called with email = " + email);

        List<User> users = userRepository.findByEmail(email);

        if (users.isEmpty()) {
            logger.trace("Email is not used yet.");
            return Response.ok().build();
        } else {
            logger.trace("Email is already taken.");
            return Response.status(Response.Status.CONFLICT)
                    .entity("Email already taken")
                    .build();
        }
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, User object) {
        this.oneToMany(object, Address.class, User::getAddresses, address -> address::setUser);
        this.oneToMany(object, BankAcc.class, User::getBankAccounts, bankAcc -> bankAcc::setUser);
        this.oneToMany(object, Image.class, User::getImages, image -> image::setUser);
        this.oneToMany(object, Comment.class, User::getComments, comment -> comment::setAuthor);
        this.oneToMany(object, Order.class, User::getOrders, order -> order::setUser);
        this.manyToMany(object, ShopItem.class, User::getAuthoredItems, User::getId, ShopItem::getAuthor, shopItem -> shopItem::setAuthor);
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(@Context HttpServletRequest request, String body) {
        User createdUser = this.post(request, body, new ApiServletPostOptions<>(
                        "user", new User(), User.class, User::getId
                )
                        .setTransform(this::setDefaultValues)
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
                                        user -> user.getEmail() == null,
                                        "Email must not be empty",
                                        Response.Status.BAD_REQUEST
                                ),
                                new ModifyPrecondition<>(
                                        user -> !(userRepository.findByEmail(user.getEmail()).isEmpty()),
                                        "Email already taken",
                                        Response.Status.BAD_REQUEST
                                )
                        ))
        );

        return this.respond(createdUser, "id", User::getId);
    }

    @PUT
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response put(@Context HttpServletRequest request, String body) {

        User updatedUser = this.put(request, body, new ApiServletPutOptions<>(
                        "user", User.class, User::getId, "id"
                )
                        .setTransform(this::setDefaultValues)
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
//                                        user -> userRepository
//                                                .get(String.valueOf(user.getId()), user.getEmail(), null, null)
//                                                .isEmpty(),
                                        user -> !userRepository
                                                .getById(user.getId())
                                                .isPresent(),
                                        "Not found",
                                        Response.Status.NOT_FOUND
                                ),
                                new ModifyPrecondition<>(
                                        user -> userRepository.get(user.getId().toString()).size() > 1,
                                        "Ambiguous results",
                                        Response.Status.NOT_FOUND
                                )
                        ))
        );

        return this.respond(updatedUser, "id", User::getId);
    }

    @DELETE
    public Response delete(@Context HttpServletRequest request) {
        this.delete(User.class, request);
        return Response.status(Response.Status.OK).build();
    }


    private User updateUserFromJson(JsonNode jsonUser, User user) {
        if (jsonUser.has("clubRole")) {
            user.setClubRole(ClubRole.Gast);
            UserRepository.clubRoleFromString(jsonUser.get("clubRole").asText())
                    .ifPresent(user::setClubRole);
        }

        if (user.getJoinDate() == null) {
            user.setJoinDate(new java.sql.Date(new java.util.Date().getTime()));
        }

        if (jsonUser.has("permissions")) {
            PermissionState permissions = new PermissionState(user.getClubRole());

            //If null, use a default value
            JsonNode jsonPermissions = jsonUser.get("permissions");
            if (!(jsonPermissions == null || jsonPermissions.isNull())) {
                permissions = JsonHelper.updateFromJson(jsonPermissions, permissions, PermissionState.class);
            }

            user.setPermissions(permissions);
        }

        return user;
    }

}

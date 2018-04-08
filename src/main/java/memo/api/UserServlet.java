package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.BCryptHelper;
import memo.auth.api.UserAuthStrategy;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.UserRepository;
import memo.model.ClubRole;
import memo.model.PermissionState;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.Configuration;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Servlet implementation class UserServlet
 */

@WebServlet(name = "UserServlet", value = "/api/user")
public class UserServlet extends AbstractApiServlet<User> {

    public UserServlet() {
        super(new UserAuthStrategy());
        logger = Logger.getLogger(UserServlet.class);
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

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response,
                (paramMap, _response) -> UserRepository.getInstance().get(
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "email"),
                        getParameter(paramMap, "searchTerm"),
                        getParameter(paramMap, "participantId")
                ),
                "users"
        );
    }

    protected void doHead(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        String email = request.getParameter("email");
        logger.trace("HEAD called with email = " + email);

        String adminEmail = Configuration.get("admin.email");
        List<User> users = adminEmail.equalsIgnoreCase(email)
                ? Collections.singletonList(UserRepository.getInstance().getAdmin())
                : UserRepository.getInstance().getUserByEmail(email);

        if (users.isEmpty()) {
            logger.trace("Email is not used yet.");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().append("Okay");
        } else {
            logger.trace("Email is already taken.");
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.getWriter().append("Email already taken");
        }
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, User object) {
        updateUserFromJson(jsonNode, object);
        DatabaseManager.getInstance().save(object.getPermissions());

        this.oneToMany(object, User::getAddresses, address -> address::setUser);
        this.oneToMany(object, User::getBankAccounts, bankAcc -> bankAcc::setUser);
        this.oneToMany(object, User::getImages, image -> image::setUser);
        this.oneToMany(object, User::getComments, comment -> comment::setAuthor);
        this.oneToMany(object, User::getOrders, order -> order::setUser);
        this.manyToMany(object, User::getAuthoredItems, User::getId, ShopItem::getAuthor, shopItem -> shopItem::setAuthor);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        User createdUser = this.post(request, response, new ApiServletPostOptions<>(
                        "user", new User(), User.class, User::getId
                )
                        .setTransform(this::hashPassword)
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
                                        user -> user.getEmail() == null,
                                        "Email must not be empty",
                                        () -> response.setStatus(HttpServletResponse.SC_BAD_REQUEST)
                                ),
                                new ModifyPrecondition<>(
                                        user -> !(UserRepository.getInstance().getUserByEmail(user.getEmail()).isEmpty()),
                                        "Email already taken",
                                        () -> response.setStatus(HttpServletResponse.SC_BAD_REQUEST)
                                )
                        ))
        ).item;

        if (createdUser != null) {
            CommunicationManager.getInstance().send(createdUser, null, MessageType.REGISTRATION);
        }
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.put(request, response, new ApiServletPutOptions<>(
                        "user", User.class, User::getId, "id"
                )
                        .setTransform(this::hashPassword)
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
                                        user -> UserRepository.getInstance()
                                                .get(String.valueOf(user.getId()), user.getEmail(), null, null)
                                                .isEmpty(),
                                        "Not found",
                                        () -> response.setStatus(HttpServletResponse.SC_NOT_FOUND)
                                ),
                                new ModifyPrecondition<>(
                                        user -> UserRepository.getInstance()
                                                .get(String.valueOf(user.getId()), user.getEmail(), null, null)
                                                .size() > 1,
                                        "Ambiguous results",
                                        () -> response.setStatus(HttpServletResponse.SC_NOT_FOUND)
                                )
                        ))
        );
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.delete(User.class, request, response);
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
                permissions = ApiUtils.getInstance().updateFromJson(jsonPermissions, permissions, PermissionState.class);
            }

            user.setPermissions(permissions);
        }

        return user;
    }

}

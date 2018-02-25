package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.api.util.ModifyPrecondition;
import memo.auth.api.UserAuthStrategy;
import memo.data.UserRepository;
import memo.model.ClubRole;
import memo.model.PermissionState;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Servlet implementation class UserServlet
 */

//TODO: checks for address and bank account in database

@WebServlet(name = "UserServlet", value = "/api/user")
public class UserServlet extends AbstractApiServlet<User> {

    public UserServlet() {
        super(new UserAuthStrategy());
        logger = Logger.getLogger(UserServlet.class);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.get(request, response,
                (paramMap, _response) -> UserRepository.getInstance().get(
                        getParameter(paramMap, "id"),
                        getParameter(paramMap, "email"),
                        getParameter(paramMap, "searchTerm")
                ),
                "users"
        );
    }

    protected void doHead(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        String email = request.getParameter("email");
        logger.trace("HEAD called with email = " + email);

        List<User> users = UserRepository.getInstance().getUserByEmail(email);

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

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.post(request, response, new ApiServletPostOptions<>(
                        "user", new User(), User.class, User::getId,
                        (jsonNode, user) -> {
                            updateUserFromJson(jsonNode, user);
                            DatabaseManager.getInstance().save(user.getPermissions());
                            user.getAddresses().forEach(it -> it.setUser(user));
                        }
                )
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
                                        user -> user.getEmail() == null,
                                        "Email must not be empty",
                                        () -> response.setStatus(HttpServletResponse.SC_BAD_REQUEST)
                                ),
                                new ModifyPrecondition<>(
                                        user -> (UserRepository.getInstance().getUserByEmail(user.getEmail()).isEmpty()),
                                        "Email already taken",
                                        () -> response.setStatus(HttpServletResponse.SC_BAD_REQUEST)
                                )
                        ))

        );
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.put(request, response, new ApiServletPutOptions<>(
                        "user", User.class, User::getId, "id",
                        (jsonNode, user) -> {
                            updateUserFromJson(jsonNode, user);
                            user.getAddresses().forEach(it -> it.setUser(user));
                        }
                )
                        .setPreconditions(Arrays.asList(
                                new ModifyPrecondition<>(
                                        user -> UserRepository.getInstance()
                                                .get(String.valueOf(user.getId()), user.getEmail(), null)
                                                .isEmpty(),
                                        "Not found",
                                        () -> response.setStatus(HttpServletResponse.SC_NOT_FOUND)
                                ),
                                new ModifyPrecondition<>(
                                        user -> UserRepository.getInstance()
                                                .get(String.valueOf(user.getId()), user.getEmail(), null)
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
            user.setClubRole(ClubRole.None);
            UserRepository.clubRoleFromString(jsonUser.get("clubRole").asText())
                    .ifPresent(user::setClubRole);
        }

        //todo remove demo
        user.setClubRole(ClubRole.Admin);

        if (user.getJoinDate() == null) {
            user.setJoinDate(LocalDateTime.now());
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

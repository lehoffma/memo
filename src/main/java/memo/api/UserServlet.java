package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.data.UserRepository;
import memo.model.ClubRole;
import memo.model.PermissionState;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Servlet implementation class UserServlet
 */

//TODO: checks for address and bank account in database
//TODO: REFACTORING - response is passed around just for IO

@WebServlet(name = "UserServlet", value = "/api/user")
public class UserServlet extends HttpServlet {

    private static final Logger logger = Logger.getLogger(UserServlet.class);

    private static final long serialVersionUID = 1L;


    public UserServlet() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        String userId = request.getParameter("id");
        String email = request.getParameter("email");
        String searchTerm = request.getParameter("searchTerm");

        logger.trace("GET called with parameters userId = " + userId + ", email = " + email + ", searchTerm = " + searchTerm);

        List<User> users = UserRepository.getInstance().get(userId, email, searchTerm);

        if (users.isEmpty()) {
            logger.warn("No users were found");
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.getWriter().append("Not found");
            return;
        }

        logger.trace("At least one user was found");
        ApiUtils.getInstance().serializeObject(response, users, "users");
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

        ApiUtils.getInstance().setContentType(request, response);

        logger.trace("POST called");

        Optional<JsonNode> jsonUserOptional = ApiUtils.getInstance().getJsonObject(request);

        if (jsonUserOptional.isPresent()) {
            JsonNode jsonUser = jsonUserOptional.get();
            String email = jsonUser.get("email").asText();

            if (email == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().append("Email must not be empty");
                return;
            }

            //check if email is in db
            List<User> users = UserRepository.getInstance().getUserByEmail(email);

            if (!users.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().append("email already taken");
                return;
            }

            User newUser = createUserFromJson(jsonUser);
            DatabaseManager.getInstance().saveAll(Arrays.asList(newUser, newUser.getPermissions()));

            response.setStatus(HttpServletResponse.SC_CREATED);
            ApiUtils.getInstance().serializeObject(response, newUser.getId(), "id");
        } else {
            logger.error("Could not parse JSON.");
            ApiUtils.getInstance().processInvalidError(response);
        }


    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);

        logger.trace("PUT called");

        Optional<JsonNode> jsonUserOptional = ApiUtils.getInstance().getJsonObject(request);

        if (jsonUserOptional.isPresent()) {
            JsonNode jsonUser = jsonUserOptional.get();

            String email = jsonUser.get("email").asText();
            Integer id = jsonUser.get("id").asInt();

            List<User> users = UserRepository.getInstance().get(id.toString(), email, null);

            if (users.isEmpty()) {
                response.getWriter().append("Not found");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            if (users.size() > 1) {
                response.getWriter().append("Ambiguous results");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            User user = users.get(0);

            user = updateUserFromJson(jsonUser, user);
            User finalUser = user;
            user.getAddresses().forEach(it -> it.setUser(finalUser));

            DatabaseManager.getInstance().update(user);

            response.setStatus(HttpServletResponse.SC_OK);
            ApiUtils.getInstance().serializeObject(response, user.getId(), "id");
        } else {
            logger.error("Could not parse JSON.");
            ApiUtils.getInstance().processInvalidError(response);
        }
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().deleteFromDatabase(User.class, request, response);
    }


    private User createUserFromJson(JsonNode jsonUser) {
        return updateUserFromJson(jsonUser, new User());
    }

    private User updateUserFromJson(JsonNode jsonUser, User user) {

        // save params to new user
        user = ApiUtils.getInstance().updateFromJson(jsonUser, user, User.class);

        if (jsonUser.has("clubRole")) {
            user.setClubRole(ClubRole.None);
            UserRepository.clubRoleFromString(jsonUser.get("clubRole").asText())
                    .ifPresent(user::setClubRole);
        }

        //todo remove demo
        user.setClubRole(ClubRole.Admin);

        //todo überhaupt noch nötig?
//        if (jsonUser.has("birthday")) {
//            TemporalAccessor birthday = DateTimeFormatter.ISO_DATE_TIME.parse(jsonUser.get("birthday").asText());
//            LocalDateTime date = LocalDateTime.from(birthday);
//            user.setBirthday(date);
//        }

//        if (jsonUser.has("addresses")) {
//            ArrayNode jsonAddresses = (ArrayNode) jsonUser.get("addresses");
//
//            StreamSupport.stream(jsonAddresses.spliterator(), false)
//                    .map(jsonId -> DatabaseManager.createEntityManager().find(Address.class, jsonId.asInt()))
//                    .forEach(user::addAddress);
//        }
//        if (jsonUser.has("bankAccounts")) {
//            ArrayNode jsonBankAccounts = (ArrayNode) jsonUser.get("bankAccounts");
//
//            StreamSupport.stream(jsonBankAccounts.spliterator(), false)
//                    .map(jsonId -> DatabaseManager.createEntityManager().find(BankAcc.class, jsonId.asInt()))
//                    .forEach(user::addBankAccount);
//        }


        //todo überhaupt noch nötig?
//        if (jsonUser.has("joinDate")) {
//            TemporalAccessor join = DateTimeFormatter.ISO_DATE_TIME.parse(jsonUser.get("joinDate").getAsString());
//            LocalDateTime jDate = LocalDateTime.from(join);
//            user.setJoinDate(jDate);
//
//        } else {
//            user.setJoinDate(LocalDateTime.now());
//        }
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

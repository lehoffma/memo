package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import memo.model.*;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Type;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servlet implementation class UserServlet
 */

//TODO: checks for address and bank account in database
//TODO: REFACTORING - response is passed around just for IO

@WebServlet(name = "UserServlet", value = "/api/user")
public class UserServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;


    public UserServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");
        String email = request.getParameter("email");
        String searchTerm = request.getParameter("searchTerm");

        List<User> users = getUsersFromDatabase(Sid, email, searchTerm, response);

        if (users.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output = gson.toJson(users);

        response.getWriter().append("{ \"users\": " + output + " }");

    }

    protected void doHead(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String email = request.getParameter("email");

        List<User> users = getUserByEmail(email);

        if (users.isEmpty()) {
            response.setStatus(200);
            response.getWriter().append("Okay");
            return;
        } else {
            response.setStatus(409);
            response.getWriter().append("Email already taken");
            return;
        }

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jUser = getJsonUser(request, response);


        String email = jUser.get("email").getAsString();


        if (email == null) {
            response.setStatus(400);
            response.getWriter().append("Email must not be empty");
            return;
        }

        //check if email is in db
        List<User> users = getUserByEmail(email);


        if (!users.isEmpty()) {
            response.setStatus(400);
            response.getWriter().append("email already taken");
            return;
        }

        User newUser = createUserFromJson(jUser);
        saveUserToDatabase(newUser);

        response.setStatus(201);
        response.getWriter().append("{ \"id\": " + newUser.getId() + " }");

        System.out.println(newUser.toString());

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        JsonObject jUser = getJsonUser(request, response);

        String email = jUser.get("email").getAsString();
        Integer id = jUser.get("id").getAsInt();

        List<User> users = getUsersFromDatabase(id.toString(), email, null, response);

        if (users.isEmpty()) {
            response.getWriter().append("Not found");
            response.setStatus(404);
            return;
        }

        if (users.size() > 1) {
            response.getWriter().append("Ambiguous results");
            response.setStatus(400);
            return;
        }

        User u = users.get(0);

        u = updateUserFromJson(jUser, u);
        u.setId(jUser.get("id").getAsInt());

        updateUserAtDatabase(u);

        response.setStatus(200);
        response.getWriter().append("{ \"id\": " + u.getId() + " }");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request, response);

        String Sid = request.getParameter("id");

        User u = getUserByID(Sid, response);

        if (u == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeUserFromDatabase(u);

    }


    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private User getUserByID(String Sid, HttpServletResponse response) throws IOException {

        try {
            Integer id = Integer.parseInt(Sid);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().find(User.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<User> getUserByEmail(String email) {

        return DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u " +
                " WHERE u.email = :email", User.class)
                .setParameter("email", email)
                .getResultList();
    }

    private List<User> getUserBySearchterm(String searchTerm) {

        return DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u " +
                " WHERE UPPER(u.surname) LIKE UPPER(:searchTerm) OR UPPER(u.firstName) LIKE UPPER(:searchTerm)", User.class)
                .setParameter("searchTerm", "%" + searchTerm + "%")
                .getResultList();
    }

    private List<User> getUsers() {
        return DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u", User.class).getResultList();
    }

    private JsonObject getJsonUser(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("user");
    }

    private User createUserFromJson(JsonObject jUser) {

        return updateUserFromJson(jUser, new User());
    }

    private User updateUserFromJson(JsonObject jUser, User u) {

        final User existing = u;
        InstanceCreator<User> creator = new InstanceCreator<User>() {
            public User createInstance(Type type) { return existing; }
        };

        Gson gson = new GsonBuilder().registerTypeAdapter(User.class,creator).excludeFieldsWithoutExposeAnnotation().create();
        // save params to new user
        u = gson.fromJson(jUser, User.class);


        if (jUser.has("clubRole")) {
            String srole = jUser.get("clubRole").getAsString();
            switch (srole) {
                case "none":
                    u.setClubRole(ClubRole.none);
                    break;

                case "mitglied":
                    u.setClubRole(ClubRole.Mitglied);
                    break;

                case "vorstand":
                    u.setClubRole(ClubRole.Vorstand);
                    break;

                case "schriftfuehrer":
                    u.setClubRole(ClubRole.Schriftführer);
                    break;

                case "kassenwart":
                    u.setClubRole(ClubRole.Kassenwart);
                    break;

                case "organizer":
                    u.setClubRole(ClubRole.Organisator);
                    break;

                case "admin":
                    u.setClubRole(ClubRole.Admin);
                    break;

                default:
                    u.setClubRole(ClubRole.none);
            }
        }
        //todo remove demo
        u.setClubRole(ClubRole.Admin);

        if (jUser.has("birthday")) {
            TemporalAccessor birthday = DateTimeFormatter.ISO_DATE_TIME.parse(jUser.get("birthday").getAsString());
            LocalDateTime date = LocalDateTime.from(birthday);
            u.setBirthday(date);
        }

        if (jUser.has("addresses")) {
            Type collectionType = new TypeToken<List<Integer>>() {
            }.getType();
            List<Integer> addresses = gson.fromJson(jUser.getAsJsonArray("addresses"), collectionType);

            for (Integer i: addresses) {

                Address addr = DatabaseManager.createEntityManager().find(Address.class,i);
                u.addAddress(addr);
            }
        }
        if (jUser.has("bankAccounts")) {
            Type collectionType = new TypeToken<List<Integer>>() {
            }.getType();
            List<Integer> bankAccounts = gson.fromJson(jUser.getAsJsonArray("bankAccounts"), collectionType);

            for (Integer i: bankAccounts) {

                BankAcc bank = DatabaseManager.createEntityManager().find(BankAcc.class,i);
                u.addBankAccount(bank);
            }

        }

        if (jUser.has("joinDate")) {

            TemporalAccessor join = DateTimeFormatter.ISO_DATE_TIME.parse(jUser.get("joinDate").getAsString());
            LocalDateTime jDate = LocalDateTime.from(join);
            u.setJoinDate(jDate);

        } else {
            u.setJoinDate(LocalDateTime.now());
        }


        if (jUser.has("permissions")) {


            PermissionState permissions = new PermissionState(u.getClubRole());

            //If null, use a default value
            JsonElement nullableText = jUser.get("permissions");
            if (!(nullableText instanceof JsonNull)) {
                JsonObject jPermissions = jUser.getAsJsonObject("permissions");
                permissions = gson.fromJson(jPermissions, PermissionState.class);

            }

            u.setPermissions(permissions);
        }

        return u;
    }

    private void saveUserToDatabase(User newUser) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.persist(newUser.getPermissions());
        em.persist(newUser);
        em.getTransaction().commit();
    }

    private void updateUserAtDatabase(User newUser) {


        DatabaseManager.createEntityManager().getTransaction().begin();
        DatabaseManager.createEntityManager().merge(newUser.getPermissions());
        DatabaseManager.createEntityManager().merge(newUser);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }

    private void removeUserFromDatabase(User u) {

        DatabaseManager.createEntityManager().getTransaction().begin();
        u = DatabaseManager.createEntityManager().merge(u);
        DatabaseManager.createEntityManager().remove(u);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }

    private List<User> getUsersFromDatabase(String Sid, String email, String searchTerm, HttpServletResponse response) throws IOException {
        List<User> users = new ArrayList<>();

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {

            User u = getUserByID(Sid, response);
            if (u != null) {
                users.add(u);
                return users;
            }
        }

        if (isStringNotEmpty(email)) return getUserByEmail(email);

        if (isStringNotEmpty(searchTerm)) return getUserBySearchterm(searchTerm);

        return getUsers();

    }
}

package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import memo.model.ClubRole;
import memo.model.PermissionState;
import memo.model.User;

import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class UserServlet
 */

//TODO: checks for address and bank account in database
//TODO: REFACTORING - response is passed around just for IO

@WebServlet("/api/user")
public class UserServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;


	public UserServlet() {
		super();
		// TODO Auto-generated constructor stub
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		setContentType(request,response);

		String Sid = request.getParameter("id");
		String email = request.getParameter("email");
		String searchTerm = request.getParameter("searchTerm");

		List<User> users = getUsersFromDatabase(Sid,email,searchTerm,response);

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

        setContentType(request,response);

        String Sid = request.getParameter("id");
        String email = request.getParameter("email");
        String searchTerm = request.getParameter("searchTerm");

        List<User> users = getUsersFromDatabase(Sid,email,searchTerm,response);

        if (users.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not found");
            return;
        }

    }

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		setContentType(request,response);

		JsonObject jUser = getJsonUser(request,response);


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
		// TODO: refactor

		request.setCharacterEncoding("UTF-8");
		response.setContentType("charset=UTF-8");
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		//ToDo: refactor

		String body = CharStreams.toString(request.getReader());

		JsonElement jElement = new JsonParser().parse(body);
		JsonObject juser = jElement.getAsJsonObject().getAsJsonObject("user");
		//ToDo: delete email

		String email = juser.get("email").getAsString();
		Integer id = juser.get("id").getAsInt();

		// get JPA Entity Manager
		EntityManager em = DatabaseManager.createEntityManager();

		User user;

		if (id == null) {
			//only use email
			if (!(email != null && !email.isEmpty())) {
				// neither email nor id
				response.setStatus(400);
				response.getWriter().append("Bad Data");
				return;
			}

			List<User> users;
			users = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class).setParameter("email", email).getResultList();


			if (!users.isEmpty()) {

				user = users.get(0);
				em.getTransaction().begin();
				user = gson.fromJson(juser, User.class);

				if (juser.has("addresses")) {
					Type collectionType = new TypeToken<List<Integer>>() {
					}.getType();
					List<Integer> addresses = gson.fromJson(juser.getAsJsonArray("addresses"), collectionType);
					user.setAdresses(addresses);
				}


				if (juser.has("bankAccounts")) {
					Type collectionType = new TypeToken<List<Integer>>() {
					}.getType();
					List<Integer> bankAccounts = gson.fromJson(juser.getAsJsonArray("bankAccounts"), collectionType);
					user.setAdresses(bankAccounts);
				}


				if (juser.has("birthday"))
					user.setBirthday(new Date(juser.get("birthday").getAsLong()));


				if (juser.has("joinDate"))
					user.setJoinDate(new Date(juser.get("joinDate").getAsLong()));


				em.getTransaction().begin();
				if (!juser.has("permissions")) {


					JsonObject jPer = juser.getAsJsonObject("permissions");
					PermissionState permission = gson.fromJson(jPer, PermissionState.class);
					user.setPermissions(permission);
					em.persist(permission);
				}

				// save new User

				em.persist(user);
				em.getTransaction().commit();
				response.setStatus(200);
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().append("{ id: " + user.getId() + " }");
				return;


			} else {
				//no user with that email
				response.getWriter().append("Not found");
				response.setStatus(404);
				return;
			}
		} else {
			user = em.find(User.class, id);
			List<User> users;
			users = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class).setParameter("email", email).getResultList();

			if (user == null) {
				response.getWriter().append("Not found");
				response.setStatus(404);
				return;
			}


			em.getTransaction().begin();
			user = gson.fromJson(juser, User.class);


			if (juser.has("birthday"))
				user.setBirthday(new Date(juser.get("birthday").getAsLong()));

			if (juser.has("addresses")) {
				Type collectionType = new TypeToken<List<Integer>>() {
				}.getType();
				List<Integer> addresses = gson.fromJson(juser.getAsJsonArray("addresses"), collectionType);
				user.setAdresses(addresses);
			}


			if (juser.has("bankAccounts")) {
				Type collectionType = new TypeToken<List<Integer>>() {
				}.getType();
				List<Integer> bankAccounts = gson.fromJson(juser.getAsJsonArray("bankAccounts"), collectionType);
				user.setAdresses(bankAccounts);
			}

			if (juser.has("joinDate"))
				user.setJoinDate(new Date(juser.get("joinDate").getAsLong()));

			if (juser.has("permissions")) {

				JsonObject jPer = juser.getAsJsonObject("permissions");
				PermissionState permission;
				permission = gson.fromJson(jPer, PermissionState.class);
				user.setPermissions(permission);
				em.persist(permission);

			}

			em.getTransaction().commit();
			response.setStatus(200);
			response.setContentType("application/json;charset=UTF-8");
			response.getWriter().append("{ \"id\": " + user.getId() + " }");
			return;
		}

	}

	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		setContentType(request,response);

		String Sid = request.getParameter("id");


		boolean miss = false;
		User u = getUserByID(Sid,response);

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
				.setParameter("email", "%" + email + "%")
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

		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
		// save params to new user
		User newUser = gson.fromJson(jUser, User.class);


		if (jUser.has("birthday")){
			//todo rest der date parser an ISO format anpassen
			TemporalAccessor birthday = DateTimeFormatter.ISO_DATE_TIME.parse(jUser.get("birthday").getAsString());
			LocalDate date = LocalDate.from(birthday);
			newUser.setBirthday(Date.valueOf(date));
		}


		if (jUser.has("addresses")) {
			Type collectionType = new TypeToken<List<Integer>>() {
			}.getType();
			List<Integer> addresses = gson.fromJson(jUser.getAsJsonArray("addresses"), collectionType);
			newUser.setAdresses(addresses);
		}


		if (jUser.has("bankAccounts")) {
			Type collectionType = new TypeToken<List<Integer>>() {
			}.getType();
			List<Integer> bankAccounts = gson.fromJson(jUser.getAsJsonArray("bankAccounts"), collectionType);
			newUser.setAdresses(bankAccounts);
		}

		if (jUser.has("joinDate")) {
			Date joinDate = new Date(Calendar.getInstance().getTime().getTime());

			try {
				joinDate = new Date(jUser.get("joinDate").getAsLong());
			} catch (Exception e) {
				// TODO: Log Error
				System.out.println(e);
			}
			newUser.setJoinDate(joinDate);
		}


		if (jUser.has("permissions")) {


			PermissionState permissions = new PermissionState(ClubRole.Admin);


			//If null, use a default value
			JsonElement nullableText = jUser.get("permissions");
			if (!(nullableText instanceof JsonNull)) {
				JsonObject jPermissions = jUser.getAsJsonObject("permissions");
				permissions = gson.fromJson(jPermissions, PermissionState.class);

			}

			newUser.setPermissions(permissions);
		}

		return newUser;
	}

	private void saveUserToDatabase(User newUser) {

		EntityManager em = DatabaseManager.createEntityManager();

		em.getTransaction().begin();
		em.persist(newUser.getPermissions());
		em.persist(newUser);
		em.getTransaction().commit();
	}

	private void removeUserFromDatabase(User u)	{

		DatabaseManager.createEntityManager().getTransaction().begin();
		u = DatabaseManager.createEntityManager().merge(u);
		DatabaseManager.createEntityManager().remove(u);
		DatabaseManager.createEntityManager().getTransaction().commit();
	}

	private List<User> getUsersFromDatabase(String Sid, String email, String searchTerm,HttpServletResponse response) throws IOException {
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

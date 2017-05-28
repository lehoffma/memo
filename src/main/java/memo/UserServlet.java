package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;
import memo.model.PermissionState;
import memo.model.User;

import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.Date;
import java.util.ArrayList;
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

//TODO: checks for address and bankaccout in database

@WebServlet("/api/user")
public class UserServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	

    public UserServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		response.setContentType("application/json;charset=UTF-8");

		String Sid = request.getParameter("id");

		String searchTerm = request.getParameter("searchTerm");


		List<User> users = new ArrayList<>();
		if (Sid != null && !Sid.isEmpty()) {

			try {
				Integer id = Integer.parseInt(Sid);
				users.add(DatabaseManager.createEntityManager().find(User.class,id));
			}
			catch (NumberFormatException e){
				response.getWriter().append("Bad ID Value");
				response.setStatus(400);
			}



		}else{
			if (searchTerm != null && !searchTerm.isEmpty()){
				users = DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u " +
						" WHERE UPPER(u.surname) LIKE UPPER(:searchTerm) OR UPPER(u.firstName) LIKE UPPER(:searchTerm)", User.class)
						.setParameter("searchTerm","%"+ searchTerm + "%")
						.getResultList();
			}
			else users = DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u",User.class).getResultList();
		}

		if (users.isEmpty())
		{
			response.setStatus(404);
			response.getWriter().append("Not found");
			return;
		}

		Gson gson = new GsonBuilder().serializeNulls().create();
		String output = gson.toJson(users);

		/*
		for (int i=0;i<users.size();++i) {
			output += gson.toJson(users.get(i));
			response.getWriter().append(users.get(i).toString() + "\n");
		}
		*/
		response.getWriter().append(output);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		response.setContentType("application/json;charset=UTF-8");
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();


		String body = CharStreams.toString(request.getReader());

		JsonElement jElement = new JsonParser().parse(body);
		JsonObject juser = jElement.getAsJsonObject().getAsJsonObject("user");


		String email = juser.get("email").getAsString();



		if (email == null)
		{
			response.setStatus(400);
			response.getWriter().append("Email must not be empty");
			return;
		}

		//check if email is in db
		List<User> users;
		users = DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u WHERE u.email = :email", User.class).setParameter("email", email).getResultList();


		// get JPA Entity Manager
		EntityManager em = DatabaseManager.createEntityManager();

		if (!users.isEmpty())
		{
			response.setStatus(400);
			response.getWriter().append("email already taken");
			return;
		}

		else
		{
			// save params to new user
			User newUser = gson.fromJson(juser,User.class);



			if (juser.get("birthDate") != null)
				newUser.setBirthday(new Date(juser.get("birthDate").getAsLong()));

			if (juser.has("addresses"))
			{
				Type collectionType = new TypeToken<List<Integer>>() {}.getType();
				List<Integer> addresses = gson.fromJson(juser.getAsJsonArray("addresses"),collectionType);
				newUser.setAdresses(addresses);
			}


			if (juser.has("bankAccounts"))
			{
				Type collectionType = new TypeToken<List<Integer>>() {}.getType();
				List<Integer> bankAccounts = gson.fromJson(juser.getAsJsonArray("bankAccounts"),collectionType);
				newUser.setAdresses(bankAccounts);
			}

			if (juser.get("joinDate") != null)
				newUser.setJoinDate(new Date(juser.get("joinDate").getAsLong()));


			em.getTransaction().begin();
			if (juser.has("permissions"))
			{
				JsonObject jPermissions = juser.getAsJsonObject("permissions");
				PermissionState permissions = gson.fromJson(jPermissions, PermissionState.class);
				newUser.setPermissions(permissions);
				em.persist(permissions);
			}



			// save new User

			em.persist(newUser);
			em.getTransaction().commit();
			response.setStatus(201);
			response.getWriter().append("{ id: " + newUser.getId()+ " }");



			System.out.println(newUser.toString());
		}

	}

	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException	{
		request.setCharacterEncoding("UTF-8");
		response.setContentType("charset=UTF-8");
		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();


		String body = CharStreams.toString(request.getReader());

		JsonElement jElement = new JsonParser().parse(body);
		JsonObject juser = jElement.getAsJsonObject().getAsJsonObject("user");


		String email = juser.get("email").getAsString();
		Integer id = juser.get("id").getAsInt();

		// get JPA Entity Manager
		EntityManager em = DatabaseManager.createEntityManager();

		User user;

		if (id==null){
			//only use email
			if (!(email != null && !email.isEmpty()))
			{
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

				if (juser.has("addresses"))
				{
					Type collectionType = new TypeToken<List<Integer>>() {}.getType();
					List<Integer> addresses = gson.fromJson(juser.getAsJsonArray("addresses"),collectionType);
					user.setAdresses(addresses);
				}


				if (juser.has("bankAccounts"))
				{
					Type collectionType = new TypeToken<List<Integer>>() {}.getType();
					List<Integer> bankAccounts = gson.fromJson(juser.getAsJsonArray("bankAccounts"),collectionType);
					user.setAdresses(bankAccounts);
				}



				if (juser.has("birthDate"))
					user.setBirthday(new Date(juser.get("birthDate").getAsLong()));





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
		}else
		{
			user = em.find(User.class,id);
			List<User> users;
			users = em.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class).setParameter("email", email).getResultList();

			if (user==null) {
				response.getWriter().append("Not found");
				response.setStatus(404);
				return;
			}



			em.getTransaction().begin();
			user = gson.fromJson(juser, User.class);




			if (juser.has("birthDate") )
				user.setBirthday(new Date(juser.get("birthDate").getAsLong()));

			if (juser.has("addresses"))
			{
				Type collectionType = new TypeToken<List<Integer>>() {}.getType();
				List<Integer> addresses = gson.fromJson(juser.getAsJsonArray("addresses"),collectionType);
				user.setAdresses(addresses);
			}


			if (juser.has("bankAccounts"))
			{
				Type collectionType = new TypeToken<List<Integer>>() {}.getType();
				List<Integer> bankAccounts = gson.fromJson(juser.getAsJsonArray("bankAccounts"),collectionType);
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
			response.getWriter().append("{ id: " + user.getId() + " }");
			return;
		}

	}

	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		//response.setContentType("application/json;charset=UTF-8");

		String Sid = request.getParameter("id");


		boolean miss = false;
		User u;
			try {
				Integer id = Integer.parseInt(Sid);
				u = DatabaseManager.createEntityManager().find(User.class,id);


			}
			catch (NumberFormatException e){
				response.getWriter().append("Bad ID Value");
				response.setStatus(400);
				return;
			}

		if (u==null)
		{
			response.setStatus(404);
			response.getWriter().append("Not Found");
			return;
		}

		DatabaseManager.createEntityManager().getTransaction().begin();
			 u = DatabaseManager.createEntityManager().merge(u);
			DatabaseManager.createEntityManager().remove(u);
		DatabaseManager.createEntityManager().getTransaction().commit();


	}

}

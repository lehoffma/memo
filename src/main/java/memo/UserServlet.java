package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.User;

import java.io.IOException;
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
@WebServlet("/api/user")
public class UserServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UserServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		request.setCharacterEncoding("UTF-8");
		//response.setContentType("application/json;charset=UTF-8");

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

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
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
			User user = users.get(0);
			em.getTransaction().begin();
			user = gson.fromJson(juser,User.class);

			//TODO: ClubRole role;
			// Als IDs

			//TODO: private Address address;
			// Adress IDs aus der Datenbank?

			user.setBirthday(new Date(juser.get("birthDate").getAsLong()));


			//TODO: private String imagePath;
			// Als BLOB in die db

			//TODO: private BankAcc bankAccount;
			// keine Testdaten

			user.setJoinDate(new Date(juser.get("joinDate").getAsLong()));


			em.getTransaction().commit();
			response.setStatus(200);

			response.getWriter().append("{ id: " + user.getId()+ " }");


		}
		else
		{
			// save params to new user
			User newUser = gson.fromJson(juser,User.class);



			//TODO: ClubRole role;
			// Als IDs

			//TODO: private Address address;
			// Adress IDs aus der Datenbank?

			newUser.setBirthday(new Date(juser.get("birthDate").getAsLong()));


			//TODO: private String imagePath;
			// Als BLOB in die db

			//TODO: private BankAcc bankAccount;
			// keine Testdaten

			newUser.setJoinDate(new Date(juser.get("joinDate").getAsLong()));




			// save new User
			em.getTransaction().begin();
			em.persist(newUser);
			em.getTransaction().commit();
			response.setStatus(201);
			response.getWriter().append("{ id: " + newUser.getId()+ " }");



			System.out.println(newUser.toString());
		}




	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */

	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub

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

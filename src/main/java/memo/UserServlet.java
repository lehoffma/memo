package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import com.sun.media.jfxmediaimpl.platform.gstreamer.GSTPlatform;
import memo.model.User;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Date;
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
		response.setContentType("application/json;charset=UTF-8");
		Integer id;

		// get params from request
		String idString = request.getParameter("id");
		String Name = request.getParameter("name");

		// parse id to int
		try{
			id = Integer.parseInt(idString);
		}catch (NumberFormatException e) {
			id = null;
		}

		// get JPA Entity Manager
		EntityManager em = DatabaseManager.createEntityManager();

		// prepare list for results
		List<User> users;


		if (id != null)  									// if id requested
			users = em.createQuery("SELECT u FROM User u WHERE u.ID = :id", User.class).setParameter("id", id).getResultList();

		else if (Name != null && !Name.isEmpty()){  		// if name requested
			users = em.createQuery("SELECT u FROM User u WHERE u.NAME = :name", User.class).setParameter("name",Name).getResultList();
		}
		else {												// if nothing requested -> get all
			users = em.createQuery("SELECT u FROM User u", User.class).getResultList();
		}

		PrintWriter pw = response.getWriter();

		// write results to console
		for (User user : users) {
			pw.append(user.toString());
			pw.append("<br/>");
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		//response.setContentType("application/json;charset=UTF-8");


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

		if (!users.isEmpty())
		{
			//TODO: Modify User

		}
		else
		{
			//TODO: Create User
			// save params to new user
			User newUser = new User();

			updateUser(newUser,juser);

			// get JPA Entity Manager
			EntityManager em = DatabaseManager.createEntityManager();

			// save new User
			em.getTransaction().begin();
			em.persist(newUser);
			em.getTransaction().commit();
		}




	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */

	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

	private void updateUser(User user,JsonObject juser){

		Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
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


	}
}

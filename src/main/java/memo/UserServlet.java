package memo;

import memo.model.User;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.PersistenceUnit;
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
		// TODO Auto-generated method stub
		// get params
		String Name = request.getParameter("name");
		String State = request.getParameter("state");


		// save params to new user
		User newUser = new User();
		newUser.setLastName(Name);
		newUser.setEmail(State);

		// get JPA Entity Manager
		EntityManager em = DatabaseManager.createEntityManager();

		// save new User
		em.getTransaction().begin();
		em.persist(newUser);
		em.getTransaction().commit();

		// return user object
		response.getWriter().append(newUser.toString());
	}

	/**
	 * @see HttpServlet#doDelete(HttpServletRequest, HttpServletResponse)
	 */

	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}

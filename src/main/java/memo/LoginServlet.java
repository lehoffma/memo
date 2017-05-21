package memo;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import memo.model.User;

/**
 * Servlet implementation class LoginServlet
 */
@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public LoginServlet() {
        super();

    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Implement
		String email = request.getParameter("email");
		String password = request.getParameter("password");
		
		
		List<User> users = DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u WHERE u.email = :email",User.class).setParameter("email", email).getResultList();
		
		if (users.size()>1) System.out.println("fehler!!! Doppelte Email Adresse!!!!!!!");
		
		User user = users.get(0);
		
		if (user.checkPassword(password)) response.getWriter().append("Authorisiert!!!"); response.setStatus(200);
		  
		
		response.getWriter().append(email).append(password);
		
	}

}

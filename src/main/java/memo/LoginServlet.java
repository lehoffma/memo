package memo;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.User;


@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

    public LoginServlet() {
        super();

    }

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();


        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        String email = jElement.getAsJsonObject().get("email").getAsString();
        String password = jElement.getAsJsonObject().get("email").getAsString();

		
		List<User> users = DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u WHERE u.email = :email",User.class).setParameter("email", email).getResultList();
		
		if (users.isEmpty())
        {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }
		
		User user = users.get(0);

		if (user.getPasswordHash().equals(password))
        {
            response.setStatus(202);
            response.getWriter().append("{ 'id': "+ user.getId()+", 'auth_token': null }");
        }
        else
        {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }


	}

}



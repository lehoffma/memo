package memo.api;

import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import memo.util.DatabaseManager;
import memo.model.User;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;


@WebServlet(name = "LoginServlet", value = "/api/login")
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
        String password = jElement.getAsJsonObject().get("password").getAsString();


        List<User> users = DatabaseManager.createEntityManager().createQuery("SELECT u FROM User u WHERE u.email = :email", User.class).setParameter("email", email).getResultList();

        if (users.isEmpty()) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        User user = users.get(0);

        if (user.getPassword().equals(password)) {
            response.setStatus(202);
            response.getWriter().append("{ \"id\": " + user.getId() + ", \"auth_token\": null }");
        } else {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }


    }

}



package memo.auth;

import javax.enterprise.context.RequestScoped;
import javax.inject.Named;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import java.io.IOException;


@Path("/logout")
@Named
@RequestScoped
public class LogoutServlet {

    public LogoutServlet() {
        super();

    }

    @POST
    public void post(@Context HttpServletRequest request, @Context HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        //lel
        //token check
        // logout
    }

}

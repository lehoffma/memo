package memo.auth;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.MapBuilder;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(name = "LoginServlet", value = "/api/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;


    final static Logger logger = Logger.getLogger(LoginServlet.class);

    public LoginServlet() {
        super();
    }

    private static class LoginInformation {
        public String email;
        public String password;

        public LoginInformation(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String accessToken = request.getParameter("auth_token");

        Jws<Claims> accessTokenJws = Jwts.parser()
                .setSigningKey(KeyGenerator.getAccessKey())
                .parseClaimsJws(accessToken);
        String email = accessTokenJws.getBody().getSubject();

        List<User> users = UserRepository.getInstance().getUserByEmail(email);
        if (users.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            logger.error("Login failed: could not find user with email = " + email);
            return;
        }

        User user = users.get(0);

        logger.trace("Login with email = " + email + " was successful");
        ApiUtils.getInstance().serializeObject(response, user.getId(), "user");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        logger.trace("Trying to login..");

        Optional<LoginInformation> loginInformation = ApiUtils.getInstance().getJsonObject(request)
                .map(jsonNode -> new LoginInformation(
                        jsonNode.get("email").asText(),
                        jsonNode.get("password").asText()
                ));

        if (loginInformation.isPresent()) {
            LoginInformation information = loginInformation.get();
            //I feel like it would be a security risk to just log the password as well
            logger.trace("Trying to login with email = " + information.email);

            List<User> users = UserRepository.getInstance().getUserByEmail(information.email);

            if (users.isEmpty()) {
                logger.error("Could not find user with email = " + information.email);
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter()
                        .append("Not Found");
                return;
            }

            User user = users.get(0);

            if (BCryptHelper.checkPasswords(information.password, user.getPassword())) {
                logger.trace("Login was successful!");

                String accessToken = TokenService.getAccessToken(information.email);
                String refreshToken = TokenService.getRefreshToken(information.email);
                response.setStatus(HttpServletResponse.SC_ACCEPTED);

                ObjectNode jsonResponse = ApiUtils.getInstance().toObjectNode(new MapBuilder<String, Object>()
                        .buildPut("id", String.valueOf(user.getId()))
                        .buildPut("auth_token", accessToken)
                        .buildPut("refresh_token", refreshToken)
                );
                response.getWriter().append(jsonResponse.toString());
            } else {
                logger.error("The given password for email = " + information.email + " was incorrect");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter()
                        .append("Not Found");
            }
        } else {
            logger.error("Login failed: Could not parse email and password correctly.");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().append("Could not parse email and password correctly");
        }


    }


}



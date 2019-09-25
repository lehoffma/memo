package memo.auth;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.Configuration;
import memo.util.JsonHelper;
import memo.util.MapBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/login")
@Named
@RequestScoped
public class LoginServlet {
    private static final long serialVersionUID = 1L;
    private final static Logger logger = LogManager.getLogger(LoginServlet.class);
    private UserRepository userRepository;
    private final LoginInformation adminLoginInfo;

    public LoginServlet() {
        super();
        adminLoginInfo = new LoginInformation(
                Configuration.get("ADMIN_EMAIL"),
                Configuration.get("ADMIN_PASSWORD")
        );
    }

    @Inject
    public LoginServlet(UserRepository userRepository) {
        super();
        adminLoginInfo = new LoginInformation(
                Configuration.get("ADMIN_EMAIL"),
                Configuration.get("ADMIN_PASSWORD")
        );
        this.userRepository = userRepository;
    }

    private static class LoginInformation {
        public String email;
        public String password;

        public LoginInformation(String email, String password) {
            this.email = email;
            this.password = password;
        }
    }

    @GET
    @Produces({MediaType.APPLICATION_JSON})
    public Map<String, String> get(@QueryParam("auth_token") String accessToken) {
        Jws<Claims> accessTokenJws = Jwts.parser()
                .setSigningKey(KeyGenerator.getAccessKey())
                .parseClaimsJws(accessToken);
        String email = accessTokenJws.getBody().getSubject();

        List<User> users = userRepository.findByEmail(email);
        if (users.isEmpty()) {
            logger.error("Login failed: could not find user with email = " + email);
            throw new WebApplicationException(Response.Status.NOT_FOUND);
        }

        User user = users.get(0);

        logger.trace("Login with email = " + email + " was successful");
        return new MapBuilder<String, String>()
                .buildPut("user", user.getId().toString());
    }

    @POST
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    public Response post(String body) {
        logger.trace("Trying to login..");

        Optional<LoginInformation> loginInformation = JsonHelper.getJsonObject(body)
                .map(jsonNode -> new LoginInformation(
                        jsonNode.get("email").asText(),
                        jsonNode.get("password").asText()
                ));

        if (loginInformation.isPresent()) {
            LoginInformation information = loginInformation.get();
            //I feel like it would be a security risk to just log the password as well
            logger.trace("Trying to login with email = " + information.email);

            List<User> users = this.adminLoginInfo.email.equalsIgnoreCase(information.email)
                    ? Collections.singletonList(userRepository.getAdmin())
                    : userRepository.findByEmail(information.email);

            if (users.isEmpty()) {
                logger.error("Could not find user with email = " + information.email);
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }

            User user = users.get(0);

            if (BCryptHelper.checkPasswords(information.password, user.getPassword())) {
                logger.trace("Login was successful!");

                String accessToken = TokenService.getAccessToken(information.email);
                String refreshToken = TokenService.getRefreshToken(information.email);

                ObjectNode jsonResponse = JsonHelper.toObjectNode(new MapBuilder<String, Object>()
                        .buildPut("id", String.valueOf(user.getId()))
                        .buildPut("auth_token", accessToken)
                        .buildPut("refresh_token", refreshToken)
                );

                return Response.status(Response.Status.ACCEPTED)
                        .entity(jsonResponse.toString())
                        .build();
            } else {
                logger.error("The given password for email = " + information.email + " was incorrect");
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }
        } else {
            logger.error("Login failed: Could not parse email and password correctly.");
            throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }
    }


}



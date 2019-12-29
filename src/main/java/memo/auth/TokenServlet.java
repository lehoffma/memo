package memo.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.MapBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.security.Key;
import java.util.List;
import java.util.Map;


@Path("")
@Named
@RequestScoped
public class TokenServlet {
    private final static Logger logger = LogManager.getLogger(TokenServlet.class);

    UserRepository userRepository;

    public TokenServlet() {
    }

    @Inject
    public TokenServlet(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GET
    @Path("/refreshAccessToken")
    @Produces({MediaType.APPLICATION_JSON})
    public Map<String, String> getAccessToken(@QueryParam("refreshToken") String refreshToken) {
        Key key = KeyGenerator.getRefreshKey();

        try {
            Jws<Claims> refreshTokenJws = Jwts.parser()
                    .setSigningKey(key)
                    .parseClaimsJws(refreshToken);
            String email = refreshTokenJws.getBody().getSubject();

            String newlyRefreshedToken = TokenService.getAccessToken(email);

            logger.trace("Issued a new access token: for email: " + email);

            return new MapBuilder<String, String>()
                    .buildPut("auth_token", newlyRefreshedToken);
        } catch (Exception e) {
            logger.error("Could not refresh accessToken", e);
            throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }


    @GET
    @Path("/refreshRefreshToken")
    @Produces({MediaType.APPLICATION_JSON})
    public Map<String, String> getRefreshToken(@QueryParam("refreshToken") String refreshToken) {
        Key key = KeyGenerator.getRefreshKey();

        try {
            Jws<Claims> refreshTokenJws = Jwts.parser()
                    .setSigningKey(key)
                    .parseClaimsJws(refreshToken);
            String email = refreshTokenJws.getBody().getSubject();

            List<User> users = userRepository.findByEmail(email);
            if (users.isEmpty()) {
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }

            String newlyRefreshedToken = TokenService.getRefreshToken(email);

            logger.trace("Issued a new refresh token: for email: " + email);
            return new MapBuilder<String, String>()
                    .buildPut("refresh_token", newlyRefreshedToken);
        }
        catch (ExpiredJwtException e) {
            logger.info("JWT is expired: " + e.getMessage());
            throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }
        catch (Exception e) {
            logger.error("Could not refresh refreshToken", e);
            throw new WebApplicationException(Response.Status.BAD_REQUEST);
        }
    }
}

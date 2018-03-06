package memo.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.ApiUtils;
import org.apache.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Key;
import java.util.List;


@WebServlet(name = "RefreshTokenServlet", value = "/api/refreshRefreshToken")
public class RefreshTokenServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(RefreshTokenServlet.class);


    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ApiUtils.getInstance().setContentType(request, response);
        String refreshToken = request.getParameter("refreshToken");

        Key key = KeyGenerator.getRefreshKey();

        try {
            Jws<Claims> refreshTokenJws = Jwts.parser()
                    .setSigningKey(key)
                    .parseClaimsJws(refreshToken);
            String email = refreshTokenJws.getBody().getSubject();

            List<User> users = UserRepository.getInstance().getUserByEmail(email);
            if (users.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            String newlyRefreshedToken = TokenService.getRefreshToken(email);

            logger.trace("Issued a new refresh token: " + newlyRefreshedToken + " for email: " + email);
            ApiUtils.getInstance().serializeObject(response, newlyRefreshedToken, "refresh_token");
        } catch (Exception e) {
            ApiUtils.getInstance().processInvalidError(response);
            logger.error("Could not refresh refreshToken", e);
        }
    }
}

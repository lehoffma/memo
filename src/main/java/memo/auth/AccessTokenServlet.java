package memo.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import memo.util.ApiUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Key;


@WebServlet(name = "AccessTokenServlet", value = "/api/refreshAccessToken")
public class AccessTokenServlet extends HttpServlet {

    final static Logger logger = LogManager.getLogger(AccessTokenServlet.class);

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

            String newlyRefreshedToken = TokenService.getAccessToken(email);

            logger.trace("Issued a new access token: " + newlyRefreshedToken + " for email: " + email);
            ApiUtils.getInstance().serializeObject(response, newlyRefreshedToken, "auth_token");
        } catch (Exception e) {
            ApiUtils.getInstance().processInvalidError(response);
            logger.error("Could not refresh accessToken", e);
        }
    }

}

package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.UserRepository;
import memo.model.ClubRole;
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
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@WebServlet(name = "RoleChangeRequestServlet", value = "/api/requestRoleChange")
public class RoleChangeRequestServlet extends HttpServlet {
    private static final Logger logger = Logger.getLogger(RoleChangeRequestServlet.class);

    private static Optional<ClubRole> fromClubRoleValue(String value) {
        return Arrays.stream(ClubRole.values())
                .filter(it -> it.name().equalsIgnoreCase(value))
                .findAny();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Optional<JsonNode> json = ApiUtils.getInstance().getJsonObject(request);
        if (json.isPresent()) {
            JsonNode jsonNode = json.get();
            String jsonRole = jsonNode.get("newRole").asText();
            Optional<ClubRole> newRole = fromClubRoleValue(jsonRole);
            Integer userId = jsonNode.get("userId").asInt();

            if (newRole.isPresent()) {
                ClubRole clubRole = newRole.get();
                User user = UserRepository.getInstance().getUserByID(userId);
                User admin = UserRepository.getInstance().getAdmin();
                if (user != null) {
                    Map<String, Object> data = new MapBuilder<String, Object>()
                            .buildPut("user", user)
                            .buildPut("newRole", clubRole);
                    CommunicationManager.getInstance().send(admin, null, MessageType.CLUBROLE_CHANGE_REQUEST, data);
                    return;
                } else {
                    logger.error("The given userId " + userId + " doesn't match any user in the database.");
                }
            } else {
                logger.error("The given clubRole value '" + jsonRole + "' is not valid");
            }
        }
        logger.error("Could not notify admin about request change of user role.");
        ApiUtils.getInstance().processNotFoundError(response);
    }
}

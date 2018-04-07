package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.auth.AuthenticationService;
import memo.auth.BCryptHelper;
import memo.communication.CommunicationManager;
import memo.communication.MessageType;
import memo.data.UserRepository;
import memo.model.User;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet(name = "PasswordRecoveryServlet", value = "/api/resetPassword")
public class PasswordRecoveryServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        JsonNode jsonItem = ApiUtils.getInstance().getJsonObject(request, "email");
        String emailToReset = jsonItem.asText();

        List<User> users = UserRepository.getInstance().getUserByEmail(emailToReset);
        if (users.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        User user = users.get(0);
        CommunicationManager.getInstance().send(user, null, MessageType.FORGOT_PASSWORD);
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        JsonNode jsonItem = ApiUtils.getInstance().getJsonObject(request, "password");
        String newPassword = jsonItem.asText();
        User user = AuthenticationService.parseNullableUserFromRequestHeader(request);

        if (user == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }

        String hashedPassword = BCryptHelper.hashPassword(newPassword);
        user.setPassword(hashedPassword);
        DatabaseManager.getInstance().update(user);
    }

}

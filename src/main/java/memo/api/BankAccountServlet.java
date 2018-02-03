package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.data.BankAccountRepository;
import memo.model.BankAcc;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;


@WebServlet(name = "BankAccountServlet", value = "/api/bankAccount")
public class BankAccountServlet extends HttpServlet {

    final static Logger logger = Logger.getLogger(BankAccountServlet.class);


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);
        String accountId = request.getParameter("id");

        logger.debug("Method GET called with param ID = " + accountId);

        List<BankAcc> addresses = BankAccountRepository.getInstance().get(accountId);

        if (addresses.isEmpty()) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }
        ApiUtils.getInstance().serializeObject(response, addresses, "bankAccounts");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "account");
        logger.debug("Method POST called");

        BankAcc a = ApiUtils.getInstance().updateFromJson(jObj, new BankAcc(), BankAcc.class);
        DatabaseManager.getInstance().save(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().setContentType(request, response);

        logger.debug("Method PUT called");
        JsonNode jObj = ApiUtils.getInstance().getJsonObject(request, "account");


        if (!jObj.has("id")) {
            ApiUtils.getInstance().processInvalidError(response);
            return;
        }

        BankAcc a = DatabaseManager.getInstance().getById(BankAcc.class, jObj.get("id").asInt());

        if (a == null) {
            ApiUtils.getInstance().processNotFoundError(response);
            return;
        }


        a = ApiUtils.getInstance().updateFromJson(jObj, a, BankAcc.class);
        DatabaseManager.getInstance().update(a);

        response.setStatus(201);
        ApiUtils.getInstance().serializeObject(response, a.getId(), "id");
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {

        ApiUtils.getInstance().deleteFromDatabase(BankAcc.class, request, response);
    }
}

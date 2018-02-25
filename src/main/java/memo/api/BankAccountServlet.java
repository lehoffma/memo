package memo.api;

import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.BankAccAuthStrategy;
import memo.data.BankAccountRepository;
import memo.model.BankAcc;
import org.apache.log4j.Logger;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@WebServlet(name = "BankAccountServlet", value = "/api/bankAccount")
public class BankAccountServlet extends AbstractApiServlet<BankAcc> {

    public BankAccountServlet() {
        super(new BankAccAuthStrategy());
        logger = Logger.getLogger(BankAccountServlet.class);
    }


    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response,
                (parameterMap, _response) -> BankAccountRepository.getInstance().get(getParameter(parameterMap, "id")),
                "bankAccounts"
        );
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        ApiServletPostOptions<BankAcc, Integer> options = new ApiServletPostOptions<BankAcc, Integer>()
                .setObjectName("account")
                .setBaseValue(new BankAcc())
                .setClazz(BankAcc.class)
                .setGetSerialized(BankAcc::getId);

        this.post(request, response, options);
    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) {
        ApiServletPutOptions<BankAcc, Integer> options = new ApiServletPutOptions<BankAcc, Integer>()
                .setObjectName("account")
                .setClazz(BankAcc.class)
                .setGetSerialized(BankAcc::getId);

        this.put(request, response, options);
    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) {
        this.delete(BankAcc.class, request, response);
    }
}

package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import memo.api.util.ApiServletPostOptions;
import memo.api.util.ApiServletPutOptions;
import memo.auth.api.strategy.BankAccAuthStrategy;
import memo.data.BankAccountRepository;
import memo.model.BankAcc;
import memo.model.Order;
import memo.model.User;
import org.apache.logging.log4j.LogManager;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@WebServlet(name = "BankAccountServlet", value = "/api/bankAccount")
public class BankAccountServlet extends AbstractApiServlet<BankAcc> {

    public BankAccountServlet() {
        super(new BankAccAuthStrategy());
        logger = LogManager.getLogger(BankAccountServlet.class);
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, BankAcc object) {
        this.manyToOne(object, User.class, BankAcc::getUser, BankAcc::getId, User::getBankAccounts, user -> user::setBankAccounts);
        this.oneToMany(object, Order.class, BankAcc::getOrder, order -> order::setBankAccount);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        this.get(request, response, BankAccountRepository.getInstance());
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

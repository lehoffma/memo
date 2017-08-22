package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.BankAcc;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

// TODO: Testing (mostly Copy n Paste)


@WebServlet(name = "BankAccountServlet", value = "/api/bankAccount")
public class BankAccountServlet extends HttpServlet {


    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String Sid = request.getParameter("id");

        List<BankAcc> accList = getAccountsFromDatabase(Sid,response);

        if(accList.isEmpty()){
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }

        Gson gson = new GsonBuilder().serializeNulls().create();
        String output=gson.toJson(accList);
        response.getWriter().append("{ \"bankAccounts\": "+ output + " }");

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        JsonObject jAccount = getJsonAccount(request,response);

        //ToDo: find Duplicates

        BankAcc a = createAccountFromJson(jAccount);

        System.out.println(a.toString());
        saveAccountToDatabase(a);

        response.setStatus(201);
        response.getWriter().append("{\"id\": "+a.getId()+"}");

    }

    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        JsonObject jAccount = getJsonAccount(request,response);


        if(!jAccount.getAsJsonObject().has("id")){
            response.setStatus(400);
            response.getWriter().append("invalid data");
            return;
        }

        BankAcc a = getAccountByID(jAccount.get("id").getAsString(),response);

        if(a==null){
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }


        a = updateAccountFromJson(jAccount,a);
        saveAccountToDatabase(a);

        response.setStatus(201);
        response.getWriter().append("{\"id\": "+a.getId()+"}");

    }

    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        setContentType(request,response);

        String Sid = request.getParameter("id");

        BankAcc a = getAccountByID(Sid,response);

        if (a == null) {
            response.setStatus(404);
            response.getWriter().append("Not Found");
            return;
        }

        removeAccountsFromDatabase(a);

    }



    private void setContentType(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
    }

    private boolean isStringNotEmpty(String s) {
        return (s != null && !s.isEmpty());
    }

    private List<BankAcc> getAccountsFromDatabase(String Sid, HttpServletResponse response) throws IOException {

        List<BankAcc> accounts = new ArrayList<>();

        // if ID is submitted
        if (isStringNotEmpty(Sid)) {

            BankAcc a = getAccountByID(Sid, response);
            if (a != null) {
                accounts.add(a);
                return accounts;
            }
        }

        return getAccounts();

    }

    private BankAcc getAccountByID(String Sid, HttpServletResponse response) throws IOException {
        try {
            Integer id = Integer.parseInt(Sid);
            //ToDo: gibt null aus wenn id nicht vergeben
            return DatabaseManager.createEntityManager().find(BankAcc.class, id);
        } catch (NumberFormatException e) {
            response.getWriter().append("Bad ID Value");
            response.setStatus(400);
        }
        return null;
    }

    private List<BankAcc> getAccounts() {
        return DatabaseManager.createEntityManager().createQuery("SELECT a FROM BankAcc a", BankAcc.class).getResultList();
    }

    private JsonObject getJsonAccount(HttpServletRequest request, HttpServletResponse response) throws IOException {

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        return jElement.getAsJsonObject().getAsJsonObject("account");
    }

    private BankAcc createAccountFromJson(JsonObject jAccount) {

        return updateAccountFromJson(jAccount,new BankAcc());
    }

    private BankAcc updateAccountFromJson(JsonObject jAccount, BankAcc a) {

        Gson gson = new GsonBuilder().create();
        a = gson.fromJson(jAccount, BankAcc.class);

        return a;
    }

    private void saveAccountToDatabase(BankAcc newAccount) {

        EntityManager em = DatabaseManager.createEntityManager();

        em.getTransaction().begin();
        em.persist(newAccount);
        em.getTransaction().commit();
    }

    private void removeAccountsFromDatabase(BankAcc u)	{

        DatabaseManager.createEntityManager().getTransaction().begin();
        u = DatabaseManager.createEntityManager().merge(u);
        DatabaseManager.createEntityManager().remove(u);
        DatabaseManager.createEntityManager().getTransaction().commit();
    }
}

package memo;

import com.google.common.io.CharStreams;
import com.google.gson.*;
import memo.model.Address;
import org.eclipse.persistence.internal.sessions.DirectCollectionChangeRecord;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/api/address")
public class AddressServlet extends HttpServlet {
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");
        EntityManager em = DatabaseManager.createEntityManager();
        //bearbeiten, im body ist die neue address
        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
        String body = CharStreams.toString(request.getReader());
        JsonElement jElement = new JsonParser().parse(body);
        if(!jElement.getAsJsonObject().has("address")){
            response.setStatus(400);
            response.getWriter().append("invalid data");
            return;
        }
        JsonObject jaddress = jElement.getAsJsonObject().getAsJsonObject("address");
        Address address;
        if(jaddress.has("id")){
            Integer id = jaddress.get("id").getAsInt(); //Id der zu aendernden Adresse
            //gibt es die id schon?
            if(id>0){
                address = em.find(Address.class, id);
                if(address==null){
                    response.setStatus(404);
                    response.getWriter().append("not found");
                    return;
                }

                em.getTransaction().begin();
                address=gson.fromJson(jaddress, Address.class);
                em.merge(address);
                System.out.println(address);
                em.getTransaction().commit();
                System.out.println(address);



            }else{
                response.setStatus(400);
                response.getWriter().append("invalid data");
                return;
            }
        }


    }
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        Gson gson = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();

        String body = CharStreams.toString(request.getReader());

        JsonElement jElement = new JsonParser().parse(body);
        if(!jElement.getAsJsonObject().has("address")){
            response.setStatus(400);
            response.getWriter().append("invalid data");
            return;
        }
        JsonObject jaddress = jElement.getAsJsonObject().getAsJsonObject("address");

        Address address;
        if(jaddress.has("id")){

            Integer id = jaddress.get("id").getAsInt();

            if(id>0){
                address = DatabaseManager.createEntityManager().find(Address.class, id);
                    if(address!=null){
                response.setStatus(400);
                response.getWriter().append("id already taken");
                return;
                }
            }
         }
        address=new Address();
        address=gson.fromJson(jaddress, Address.class);
        address.setId(null);

        DatabaseManager.createEntityManager().getTransaction().begin();
        DatabaseManager.createEntityManager().persist(address);
        DatabaseManager.createEntityManager().getTransaction().commit();

        response.setStatus(201);
        response.getWriter().append("{'id': "+address.getId()+"}");

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        Gson gson = new GsonBuilder().serializeNulls().create();
        List <Address> addresses = new ArrayList<>();
        String Sid = request.getParameter("id");
        if(Sid!=null && !Sid.isEmpty()){
            try{
                Integer id= Integer.parseInt(Sid);
                Address address = DatabaseManager.createEntityManager().find(Address.class, id);
                if(address!=null)addresses.add(address);

            }catch (Exception e){
                response.setStatus(400);
                response.getWriter().append("id not a number");
                return;
            }
        }else {
            addresses = DatabaseManager.createEntityManager().createQuery("SELECT a FROM Address a", Address.class).getResultList();
        }
        if(addresses.isEmpty()){
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }
        String output=gson.toJson(addresses);
        response.getWriter().append(output);
    }


    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        String Sid = request.getParameter("id");
        if(Sid!=null && !Sid.isEmpty()){
            try{
                Integer id= Integer.parseInt(Sid);

                Address address = DatabaseManager.createEntityManager().find(Address.class, id);
                if(address==null){
                    response.setStatus(404);
                    response.getWriter().append("not found");
                    return;
                }
                DatabaseManager.createEntityManager().getTransaction().begin();
                DatabaseManager.createEntityManager().remove(address);
                DatabaseManager.createEntityManager().getTransaction().commit();

            }catch(Exception e){
                response.setStatus(400);
                response.getWriter().append("id not a number");
                return;
            }

        }else{
            response.setStatus(404);
            response.getWriter().append("not found");
            return;
        }

    }

}

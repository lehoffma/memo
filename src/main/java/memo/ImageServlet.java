package memo;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import memo.model.Image;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.RandomStringUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.util.Collection;

@WebServlet(name = "ImageServlet", value = "/api/image")
@MultipartConfig()
public class ImageServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


       Collection<Part> parts = request.getParts();

            JsonArray arr = new JsonArray();

            for (Part p : parts) {

                Image i = new Image();
                i.saveToFile(p);
                arr.add(i.getFileName());
            }

            Gson gson = new Gson();

            JsonObject obj = new JsonObject();
            obj.add("imagePaths", arr);
            response.getWriter().append(gson.toJson(obj));

    }
}

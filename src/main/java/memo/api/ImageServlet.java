package memo.api;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import memo.util.DatabaseManager;
import memo.model.Image;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Collection;

@WebServlet(name = "ImageServlet", value = "/api/image")
@MultipartConfig()
public class ImageServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        ServletContext cntx = request.getServletContext();

        String url = request.getRequestURI();
        Image i = getByFilePath(url);

        // retrieve mimeType dynamically
        String mime = cntx.getMimeType(i.getFullPath());
        if (mime == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        response.setContentType(mime);
        File file = new File(i.getFullPath());
        response.setContentLength((int) file.length());

        try (FileInputStream in = new FileInputStream(file);
             OutputStream out = response.getOutputStream()) {

            // Copy the contents of the file to the output stream
            byte[] buf = new byte[1024];
            int count = 0;
            while ((count = in.read(buf)) >= 0) {
                out.write(buf, 0, count);
            }
        }
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

    private Image getByFilePath(String fileName) {
        return DatabaseManager.createEntityManager().createQuery("SELECT i FROM Image i " +
                " WHERE i.fileName = :name", Image.class)
                .setParameter("name", fileName)
                .getSingleResult();
    }
}

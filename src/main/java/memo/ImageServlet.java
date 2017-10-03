package memo;

import com.google.common.io.CharStreams;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
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
@MultipartConfig
public class ImageServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


        String path;
        path = System.getProperty("user.home") + System.getProperty("file.separator");
        path += "MemoShop"+ System.getProperty("file.separator");
        path += "pictures" + System.getProperty("file.separator");
        Collection<Part> parts = request.getParts();

        String filepath = "";


        for (Part p: parts) {

            String ext = FilenameUtils.getExtension(getFileName(p));

            File f;
            do {
                String filename = RandomStringUtils.randomAlphanumeric(10);
                f = new File(filepath = path + filename + FilenameUtils.EXTENSION_SEPARATOR + ext);
            }while(f.exists());
            writeToFile(p.getInputStream(),f);
        }


        Gson gson = new Gson();

        JsonObject obj = new JsonObject();
        obj.addProperty("imagePath",filepath);
        response.getWriter().append(gson.toJson(obj));
    }


    // save uploaded file to new location
    private void writeToFile(InputStream uploadedInputStream, File uploadedFileLocation) {

        try {
            uploadedFileLocation.getParentFile().mkdirs();
            OutputStream out;
            int read = 0;
            byte[] bytes = new byte[1024];

            out = new FileOutputStream(uploadedFileLocation);
            while ((read = uploadedInputStream.read(bytes)) != -1) {
                out.write(bytes, 0, read);
            }
            out.flush();
            out.close();
        } catch (IOException e) {

            e.printStackTrace();
        }

    }

    /**
     * Utility method to get file name from HTTP header content-disposition
     */
    private String getFileName(Part part) {
        String contentDisp = part.getHeader("content-disposition");
        System.out.println("content-disposition header= "+contentDisp);
        String[] tokens = contentDisp.split(";");
        for (String token : tokens) {
            if (token.trim().startsWith("filename")) {
                return token.substring(token.indexOf("=") + 2, token.length()-1);
            }
        }
        return "";
    }
}

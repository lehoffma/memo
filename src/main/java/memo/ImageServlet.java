package memo;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
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
@MultipartConfig()
public class ImageServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {


        //code review: könnte man auch als member des servlets konstant abspeichern, ändert sich ja nich
        String path;
        path = System.getProperty("user.home") + System.getProperty("file.separator");
        path += "MemoShop" + System.getProperty("file.separator");
        path += "pictures" + System.getProperty("file.separator");

        //code review: try/catch einfach weg lassen, wenn mit der exception nichts weiter angefangen wird außer sie auszugeben
        try {

            Collection<Part> parts = request.getParts();

            String filepath = "";

            JsonArray arr = new JsonArray();

            for (Part p : parts) {

                String ext = FilenameUtils.getExtension(getFileName(p));

                File f;
                do {
                    String filename = RandomStringUtils.randomAlphanumeric(10);
                    f = new File(filepath = path + filename + FilenameUtils.EXTENSION_SEPARATOR + ext);
                } while (f.exists());
                //code review: der input stream wird nie geschlossen => memory leak
                //ich würds so machen:
                /*
                    try(InputStream stream = p.getInputStream()){
                        writeToFile(stream, f);
                    }

                 */
                writeToFile(p.getInputStream(), f);
                arr.add(filepath);
            }


            Gson gson = new Gson();

            JsonObject obj = new JsonObject();
            obj.add("imagePaths", arr);
            response.getWriter().append(gson.toJson(obj));

        } catch (Exception e) {
            System.out.println(e);
        }
    }


    // save uploaded file to new location
    private void writeToFile(InputStream uploadedInputStream, File uploadedFileLocation) {

        try {
            uploadedFileLocation.getParentFile().mkdirs();
            OutputStream out;
            int read = 0;
            byte[] bytes = new byte[1024];

            //code review: try-with-resources für streams benutzen. dabei wird automatisch close (und dementsprechend
            //auch flush) aufgerufen, was man gerne mal vergisst wenn mans manuell macht
            //beispiel:
            /*
              try(OutputStream out = new FileOutputStream(uploadedFileLocation){
                    while ((read = uploadedInputStream.read(bytes)) != -1) {
                        out.write(bytes, 0, read);
                    }
              }

             */

            out = new FileOutputStream(uploadedFileLocation);
            while ((read = uploadedInputStream.read(bytes)) != -1) {
                out.write(bytes, 0, read);
            }
            out.flush();
            out.close();
        } catch (IOException e) {

            //code review: lieber die exception (oder UncheckedIOException) throwen als nur den stack trace auszugeben
            //der stack trace wird ja auch mit ausgegeben wenn die exception nich irgendwo abgefangen wird
            e.printStackTrace();
        }

    }

    /**
     * Utility method to get file name from HTTP header content-disposition
     */
    private String getFileName(Part part) {
        String contentDisp = part.getHeader("content-disposition");
        System.out.println("content-disposition header= " + contentDisp);
        String[] tokens = contentDisp.split(";");
        for (String token : tokens) {
            if (token.trim().startsWith("filename")) {
                return token.substring(token.indexOf("=") + 2, token.length() - 1);
            }
        }
        return "";
    }
}

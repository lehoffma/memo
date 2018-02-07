package memo.api;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import memo.data.ImageRepository;
import memo.model.Image;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.log4j.Logger;

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
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@WebServlet(name = "ImageServlet", value = "/api/image")
@MultipartConfig()
public class ImageServlet extends HttpServlet {


    final static Logger logger = Logger.getLogger(ImageServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        ServletContext context = request.getServletContext();

        String url = request.getRequestURI();
        logger.trace("Attempting to send image at url '" + url + "'.");

        Optional<Image> optionalImage = ImageRepository.getInstance().getByFilePath(url);

        if (optionalImage.isPresent()) {
            Image image = optionalImage.get();

            // retrieve mimeType dynamically
            String mime = context.getMimeType(image.getFullPath());
            if (mime == null) {
                logger.error("No MIME-type was set");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }

            response.setContentType(mime);
            File file = new File(image.getFullPath());
            response.setContentLength((int) file.length());

            try (FileInputStream in = new FileInputStream(file);
                 OutputStream out = response.getOutputStream()) {

                // Copy the contents of the file to the output stream
                byte[] buf = new byte[1024];
                int count;
                while ((count = in.read(buf)) >= 0) {
                    out.write(buf, 0, count);
                }
            }

            logger.trace("Image at url '" + url + "' was sent successfully.");
        } else {
            logger.error("Could not find image at url '" + url + "'.");
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Collection<Part> parts = request.getParts();


        List<Image> images = parts.stream()
                .map(part -> new Image().saveToFile(part))
                .collect(Collectors.toList());

        DatabaseManager.getInstance().saveAll(images);

        ArrayNode jsonImageList = new ArrayNode(JsonNodeFactory.instance);
        images.stream()
                .map(Image::getFileName)
                .forEach(jsonImageList::add);


        ApiUtils.getInstance().serializeObject(response, jsonImageList, "images");
    }

}

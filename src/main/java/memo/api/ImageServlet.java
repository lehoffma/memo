package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import memo.auth.AuthenticationService;
import memo.auth.api.strategy.ImageAuthStrategy;
import memo.data.ImageRepository;
import memo.model.Entry;
import memo.model.Image;
import memo.model.ShopItem;
import memo.util.ApiUtils;
import memo.util.DatabaseManager;
import org.apache.commons.io.IOUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
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
//max file size is 15 MB
@MultipartConfig(maxFileSize = 1024 * 1024 * 15)
public class ImageServlet extends AbstractApiServlet<Image> {

    public ImageServlet() {
        super(new ImageAuthStrategy());
        logger = LogManager.getLogger(ImageServlet.class);
    }


    @Override
    protected void updateDependencies(JsonNode jsonNode, Image object) {
        this.manyToOne(object, ShopItem.class, Image::getItem, Image::getId, ShopItem::getImages, shopItem -> shopItem::setImages);
        this.manyToOne(object, Entry.class, Image::getEntry, Image::getId, Entry::getImages, entry -> entry::setImages);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //todo use the authentication strategy
        ServletContext context = request.getServletContext();

        String fileName = request.getParameter("fileName");
        String size = Optional.ofNullable(request.getParameter("size"))
                .orElse("original");
        logger.trace("Attempting to send image at url '" + Image.filePath + fileName + "', size '" + size + "'.");

        Optional<Image> optionalImage = ImageRepository.getInstance().findByFilePath(fileName);

        if (optionalImage.isPresent()) {
            Image image = optionalImage.get();
            String fullPath = image.getFullPath();

            // retrieve mimeType dynamically
            String mime = context.getMimeType(fullPath);
            if (mime == null) {
                logger.error("No MIME-type was set");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }

            response.setContentType(mime);
            File file = image.getFile(size);
            if(file == null){
                logger.error("File at '" + image.getImagePath(size) + "' does not exist.");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            response.setContentLength((int) file.length());

            try (FileInputStream in = new FileInputStream(file);
                 OutputStream out = response.getOutputStream()) {
                // Copy the contents of the file to the output stream
                IOUtils.copy(in, out);
            }

            logger.trace("Image at url '" + fileName + "' was sent successfully.");
        } else {
            logger.error("Could not find image at url '" + fileName + "'.");
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        boolean userIsAuthorized = AuthenticationService
                .userIsAuthorized(request, authenticationStrategy::isAllowedToCreate, new Image());

        if (!userIsAuthorized) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().append("The user is not authorized to create these images");
        }


        Collection<Part> parts = request.getParts();
        List<Image> images = parts.stream()
                .map(part -> new Image().saveToFile(part))
                .collect(Collectors.toList());

        DatabaseManager.getInstance().saveAll(images, Image.class);

        ArrayNode jsonImageList = new ArrayNode(JsonNodeFactory.instance);
        images.stream()
                .map(Image::getApiPath)
                .forEach(jsonImageList::add);

        ApiUtils.getInstance().serializeObject(response, jsonImageList, "images");
    }


    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        this.delete(request, response, Image.class, it -> {
            String fileName = it.getParameter("fileName");
            return ImageRepository.getInstance().findByApiPath(fileName).orElse(null);
        });
    }

}

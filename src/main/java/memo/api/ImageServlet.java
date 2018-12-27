package memo.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import memo.auth.AuthenticationService;
import memo.data.ImageRepository;
import memo.model.Entry;
import memo.model.Image;
import memo.model.ShopItem;
import memo.util.DatabaseManager;
import memo.util.JsonHelper;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;

import javax.inject.Inject;
import javax.inject.Named;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@WebServlet(name = "ImageServlet", value = "/api/image")
//max file size is 10 MB
@MultipartConfig(maxFileSize = 1024 * 1024 * 15)
@Named
public class ImageServlet extends HttpServlet {
    private class InnerImageServlet extends AbstractApiServlet<Image> {


        @Override
        protected void updateDependencies(JsonNode jsonNode, Image object) {
            this.manyToOne(object, ShopItem.class, Image::getItem, Image::getId, ShopItem::getImages, shopItem -> shopItem::setImages);
            this.manyToOne(object, Entry.class, Image::getEntry, Image::getId, Entry::getImages, entry -> entry::setImages);
        }
    }

    private ImageRepository imageRepository;
    private InnerImageServlet innerServlet;

    public ImageServlet() {

    }

    @Inject
    public ImageServlet(ImageRepository imageRepository, AuthenticationService authenticationService) {
        this.imageRepository = imageRepository;
        this.innerServlet = new InnerImageServlet();
        this.innerServlet.authenticationService = authenticationService;
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //todo use the authentication strategy
        ServletContext context = request.getServletContext();

        String fileName = request.getParameter("fileName");
        String size = Optional.ofNullable(request.getParameter("size"))
                .orElse("original");
        innerServlet.logger.trace("Attempting to send image at url '" + Image.filePath + fileName + "', size '" + size + "'.");

        Optional<Image> optionalImage = imageRepository.findByFilePath(fileName);

        if (optionalImage.isPresent()) {
            Image image = optionalImage.get();
            String fullPath = image.getFullPath();

            // retrieve mimeType dynamically
            String mime = context.getMimeType(fullPath);
            if (mime == null) {
                innerServlet.logger.error("No MIME-type was set");
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }

            response.setContentType(mime);
            File file = image.getFile(size);
            if (file == null) {
                innerServlet.logger.error("File at '" + image.getImagePath(size) + "' does not exist.");
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            response.setContentLength((int) file.length());

            try (FileInputStream in = new FileInputStream(file);
                 OutputStream out = response.getOutputStream()) {
                // Copy the contents of the file to the output stream
                IOUtils.copy(in, out);
            }

            innerServlet.logger.trace("Image at url '" + fileName + "' was sent successfully.");
        } else {
            innerServlet.logger.error("Could not find image at url '" + fileName + "'.");
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }


    public <T> void serializeObject(HttpServletResponse response, T obj, String objectName) {
        try {
            if (objectName != null) {
                ObjectNode objectNode = JsonHelper.toObjectNode(obj, objectName);
                innerServlet.logger.trace("Serialization of object " + objectName + ": " + obj.toString());
                response.getWriter().append(objectNode.toString());
            } else {
                JsonNode jsonNode = JsonHelper.toJsonNode(obj);
                response.getWriter().append(jsonNode.toString());
            }
        } catch (Exception e) {
            innerServlet.logger.error("Unhandled Exception", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        boolean userIsAuthorized = innerServlet.authenticationService
                .userIsAuthorized(request, innerServlet.authenticationStrategy::isAllowedToCreate, new Image());

        if (!userIsAuthorized) {
            throw new WebApplicationException("The user is not authorized to create those images", Response.Status.FORBIDDEN);
        }

        Collection<Part> parts = request.getParts();

        List<String> extensions = parts.stream()
                .map(part -> FilenameUtils.getExtension(Image.getUploadedName(part)))
                .collect(Collectors.toList());
        if (extensions.stream().anyMatch(extension -> !Image.isValidFileType(extension))) {
            throw new WebApplicationException("Invalid file types " + extensions.toString(), Response.Status.BAD_REQUEST);
        }

        List<Image> images = new ArrayList<>();
        for (Part part : parts) {
            Image image = new Image().saveToFile(part);
            images.add(image);
        }

        DatabaseManager.getInstance().saveAll(images, Image.class);

        ArrayNode jsonImageList = new ArrayNode(JsonNodeFactory.instance);
        images.stream()
                .map(Image::getApiPath)
                .forEach(jsonImageList::add);

        serializeObject(response, jsonImageList, "images");
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        this.innerServlet.delete(request, Image.class, it -> {
            String fileName = it.getParameter("fileName");
            return imageRepository.findByApiPath(fileName).orElse(null);
        });
    }


}

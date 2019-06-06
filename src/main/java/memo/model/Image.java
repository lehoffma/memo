package memo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import memo.util.MapBuilder;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.imgscalr.Scalr;

import javax.imageio.ImageIO;
import javax.persistence.*;
import javax.servlet.http.Part;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Entity implementation class for Entity: Images
 */


@Entity
@Table(name = "IMAGES")
@NamedQueries({
        @NamedQuery(
                name = "Image.findByFileName",
                query = "SELECT i FROM Image i " +
                        " WHERE i.fileName = :name"
        )
})
public class Image implements Serializable {
    private static final Logger logger = LogManager.getLogger(Image.class);

    //**************************************************************
    //  static members
    //**************************************************************

    private static final long serialVersionUID = 1L;

    private static class SizeOption {
        public int width;
        public int height;

        public SizeOption(int width, int height) {
            this.width = width;
            this.height = height;
        }
    }

    public static final Map<String, SizeOption> sizes = MapBuilder.<String, SizeOption>create()
            .buildPut("large", new SizeOption(500, 500))
            .buildPut("medium", new SizeOption(250, 250))
            .buildPut("small", new SizeOption(150, 150))
            .buildPut("thumbnail", new SizeOption(50, 50))
            .buildPut("original", null);

    public static final String filePath = System.getProperty("user.home") +
            System.getProperty("file.separator") + "MemoShop" + System.getProperty("file.separator") +
            "pictures" + System.getProperty("file.separator");

    //**************************************************************
    //  members
    //**************************************************************

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private ShopItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn
    private Entry entry;

    private String fileName;

    //**************************************************************
    //  constructor
    //**************************************************************

    public Image() {
        super();
    }

    //**************************************************************
    //  getters and setters
    //**************************************************************

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    @JsonIgnore
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @JsonIgnore
    public ShopItem getItem() {
        return item;
    }

    public void setItem(ShopItem item) {
        this.item = item;
    }

    @JsonIgnore
    public Entry getEntry() {
        return entry;
    }

    public void setEntry(Entry entry) {
        this.entry = entry;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFullPath() {
        return filePath + fileName;
    }

    public String getApiPath() {
        try {
            return "/api/image?fileName=" + URLEncoder.encode(fileName, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            logger.error("Could not encode file name with UTF-8, trying without encoding", e);
            return "/api/image?fileName=" + fileName;
        }
    }

    public static Optional<String> getFileNameFromApiPath(String apiPath) {
        Pattern pattern = Pattern.compile("/api/image\\?fileName=(?<FileName>.*)");
        Matcher matcher = pattern.matcher(apiPath);

        if (matcher.find() && matcher.matches()) {
            return Optional.ofNullable(matcher.group("FileName"));
        }
        return Optional.empty();
    }

    //**************************************************************
    //  methods
    //**************************************************************

    @Override
    public String toString() {
        return "Image{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                '}';
    }

    public static boolean isValidFileType(String extension){
        List<String> acceptableExtensions = Arrays.asList("png", "jpg", "jpeg");
        return acceptableExtensions.stream().anyMatch(it -> it.equalsIgnoreCase(extension));
    }

    public Image saveToFile(Part part) throws IOException {
        String extension = FilenameUtils.getExtension(getUploadedName(part));
        if(!Image.isValidFileType(extension)){
            throw new IllegalArgumentException("Invalid file type " + extension);
        }

        File file;
        //repeat until we get an unused file name
        do {
            String filename = RandomStringUtils.randomAlphanumeric(10);
            file = new File(filePath + filename + FilenameUtils.EXTENSION_SEPARATOR + extension);
            this.setFileName(filename + FilenameUtils.EXTENSION_SEPARATOR + extension);
        } while (file.exists());

        try (InputStream stream = part.getInputStream()) {
            writeToFile(stream, file);
            this.writeResizedImages();
        }
        return this;
    }

    public Optional<String> getImagePath(String size) {
        String path = this.getFullPath();
        if (size == null || size.equals("original")) {
            return Optional.of(path);
        }

        if (Image.sizes.entrySet().stream().noneMatch(entry -> entry.getKey().equalsIgnoreCase(size))) {
            return Optional.empty();
        }

        Pattern extensionPattern = Pattern.compile(".*(?<Extension>\\.\\w+)$");
        Matcher matcher = extensionPattern.matcher(path);

        if (matcher.find() && matcher.matches()) {
            String extension = matcher.group("Extension");
            return Optional.of(path.replace(extension, "_" + size + extension));
        }
        return Optional.empty();
    }

    public File getFile(String size) {
        return this.getImagePath(size)
                .map(File::new)
                .map(file -> {
                    if (file.exists()) {
                        return file;
                    } else {
                        boolean success = this.writeResizedImages(size);
                        if (success) {
                            return this.getFile(size);
                        }
                        logger.error("Could not convert file " + this.getFileName() + " to size " + size);
                        //something else went wrong
                        return null;
                    }
                })
                .orElse(null);
    }

    public void writeResizedImage(BufferedImage image, String size) {
        this.writeResizedImage(image, size, Image.sizes.get(size));
    }

    public void writeResizedImage(BufferedImage image, String size, SizeOption resizeOption) {
        if (resizeOption == null) {
            return;
        }

        BufferedImage resizedImage = Scalr.resize(image, Scalr.Method.ULTRA_QUALITY, Scalr.Mode.AUTOMATIC, resizeOption.width, resizeOption.height);
        Optional<String> imagePath = this.getImagePath(size);

        imagePath.ifPresent(path -> {
            File file = new File(path);
            try {
                ImageIO.write(resizedImage, "png", file);
            } catch (IOException e) {
                logger.error("Could not write resized image to file " + file.getAbsolutePath(), e);
            }
        });
    }


    public boolean writeResizedImages(String... sizes) {
        List<String> sizeList = Arrays.stream(sizes).collect(Collectors.toList());
        if (sizes.length == 0) {
            sizeList = new ArrayList<>(Image.sizes.keySet());
        }
        File file = new File(this.getFullPath());
        try {
            BufferedImage image = ImageIO.read(file);
            sizeList.forEach((key) -> this.writeResizedImage(image, key));
        } catch (IOException e) {
            logger.error("Could not read image at " + this.getFullPath(), e);
            return false;
        }
        return true;
    }

    // save uploaded file to new location
    private void writeToFile(InputStream uploadedInputStream, File uploadedFileLocation) throws IOException {
        if (!uploadedFileLocation.getParentFile().exists()) {
            boolean directoriesWereCreated = uploadedFileLocation.getParentFile().mkdirs();
            if (!directoriesWereCreated) {
                throw new RuntimeException("Could not create the directory for the images at "
                        + uploadedFileLocation.getParentFile().getAbsolutePath());
            }
        }

        Files.copy(uploadedInputStream, uploadedFileLocation.toPath());
    }

    /**
     * Utility method to get file name from HTTP header content-disposition
     */
    public static String getUploadedName(Part part) {
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


    //method that gets called after the entity is deleted from the database
    @PostRemove
    void onPostRemove() {
        try {
            Files.delete(Paths.get(this.getFullPath()));
            for (String key : Image.sizes.keySet()) {
                Optional<String> imagePath = this.getImagePath(key);
                if (imagePath.isPresent()) {
                    Files.delete(Paths.get(imagePath.get()));
                }
            }
        }
        catch (NoSuchFileException e){
            //empty
        }
        catch (IOException e) {
            logger.error("Deleting the image at " + this.getFullPath() + " went wrong", e);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Image image = (Image) o;
        return Objects.equals(id, image.id);
    }

    @Override
    public int hashCode() {

        return Objects.hash(id);
    }
}

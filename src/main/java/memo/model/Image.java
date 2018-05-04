package memo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.persistence.*;
import javax.servlet.http.Part;
import java.io.*;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    public Image saveToFile(Part part) {

        String extension = FilenameUtils.getExtension(getUploadedName(part));
        File file;
        //repeat until we get an unused file name
        do {
            String filename = RandomStringUtils.randomAlphanumeric(10);
            file = new File(filePath + filename + FilenameUtils.EXTENSION_SEPARATOR + extension);
            this.setFileName(filename + FilenameUtils.EXTENSION_SEPARATOR + extension);
        } while (file.exists());

        try (InputStream stream = part.getInputStream()) {
            writeToFile(stream, file);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return this;
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
    private String getUploadedName(Part part) {
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
        } catch (IOException e) {
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

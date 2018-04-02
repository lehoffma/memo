package memo.util;

import org.apache.log4j.Logger;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.io.*;
import java.util.Properties;

public class ContextListener implements ServletContextListener {


    protected Logger logger = Logger.getLogger(ContextListener.class);

    @Override
    public void contextDestroyed(ServletContextEvent context) {
        //Notification that the servlet context is about to be shut down.

    }

    @Override
    public void contextInitialized(ServletContextEvent context) {
        // do all the tasks that you need to perform just after the server starts

        //Notification that the web application initialization process is starting

        Properties prop = new Properties();
        InputStream input = null;

        try {

            File path = new File(context.getServletContext().getRealPath("/"));
            path = path.getParentFile().getParentFile();
            String relPath = path + System.getProperty("file.separator") + "META-INF" + System.getProperty("file.separator");
            input = new FileInputStream(relPath + "config.properties");


            // load a properties file
            prop.load(input);

            // get the property value and print it out
            SendMail m = SendMail.getInstance();


            m.setHost(prop.getProperty("EMAIL_HOST"));
            m.setUser(prop.getProperty("EMAIL_USER"));
            m.setUserName(prop.getProperty("EMAIL_USER_NAME"));
            m.setPassword(prop.getProperty("EMAIL_PASSWORD"));
            m.setPort(prop.getProperty("EMAIL_PORT"));

        } catch (IOException ex) {
            ex.printStackTrace();
        } finally {
            if (input != null) {
                try {
                    input.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
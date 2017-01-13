package web;

import database.DatabaseHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.sql.DataSource;


@SpringBootApplication
public class Application implements CommandLineRunner {

    public static final Logger log = LoggerFactory.getLogger(Application.class);


    //@Autowired   //does not work
    public DataSource DataSrc;


    public static void main(String[] args){
        SpringApplication.run(Application.class, args);
    }

    @Override
    public void run(String... strings) throws Exception {
        log.info("Application runs");
        DatabaseHandler dbHandle = new DatabaseHandler();
    }
}

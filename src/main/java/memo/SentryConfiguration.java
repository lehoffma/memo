package memo;

import io.sentry.Sentry;

import javax.annotation.PostConstruct;
import javax.ejb.Singleton;
import javax.ejb.Startup;

@Singleton
@Startup
public class SentryConfiguration {

    @PostConstruct
    public void startup() {
        //reads init value from SENTRY_DSN environment variable
//        Sentry.init();
    }
}

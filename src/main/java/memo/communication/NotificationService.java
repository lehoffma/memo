package memo.communication;

import javax.ejb.LocalBean;
import javax.ejb.Schedule;
import javax.ejb.Schedules;
import javax.ejb.Stateless;
import javax.enterprise.context.ApplicationScoped;

@Stateless
@LocalBean
public class NotificationService {

    @Schedules({
            //check every day at 05:00 in the morning
            @Schedule(hour = "5"),
    })
    public void checkForDailyNotifications() {
        System.out.println("todo: implement");
    }
}

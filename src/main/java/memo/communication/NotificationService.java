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
        //possible notifications
        // - upcoming tour/event (today at XX:YY)
        // - orders that have not been checked yet (after X days have passed and status is still Y)
        //

        System.out.println("todo: implement");
    }
}

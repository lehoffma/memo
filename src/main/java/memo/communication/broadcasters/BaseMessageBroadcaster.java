package memo.communication.broadcasters;

import memo.communication.DataParser;
import memo.communication.ReplacementFactory;
import memo.communication.model.Notification;

import java.util.Map;

public abstract class BaseMessageBroadcaster implements MessageBroadcaster {
    DataParser dataParser;
    ReplacementFactory replacementFactory;

    public abstract String getText(Notification notification);

    protected String getText(Notification notification, String template) {
        String jsonData = notification.getData();
        Map<String, Object> data = this.dataParser.parse(jsonData);
        Map<String, String> placeholders = this.replacementFactory.getReplacements(notification, template, data);

        //todo maybe check for possible performance improvements (save index/length?)
        for (Map.Entry<String, String> placeholder : placeholders.entrySet()) {
            template = template.replace(placeholder.getKey(), placeholder.getValue());
        }
        return template;
    }
}

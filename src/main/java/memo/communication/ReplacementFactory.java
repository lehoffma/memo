package memo.communication;

import memo.model.ClubRole;
import memo.model.ShopItem;
import memo.model.User;
import memo.util.MapBuilder;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Named;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Named
@ApplicationScoped
public class ReplacementFactory {

    public Map<String, Function<Map<String, Object>, String>> getAllReplacements() {
        return new MapBuilder<String, Function<Map<String, Object>, String>>()
                //notifications
                .buildPut("<ItemName>", data -> ((ShopItem) data.get("event")).getTitle())
                .buildPut("<UserId>", data -> ((User) data.get("user")).getId().toString())
                .buildPut("<Username>", data -> {
                    User user = (User) data.get("user");
                    return user.getFirstName() + " " + user.getSurname();
                })
                .buildPut("<NewClubRole>", data ->
                        (ClubRole.fromString((String) data.get("newRole"))
                                .map(ClubRole::getStringValue)
                                .orElse("ERROR")
                        ));

        //todo: email
        //replace generic email placeholders with more specific placeholders

    }

    public Map<String, String> getReplacements(String template, Map<String, Object> data) {
        List<String> allMatches = new ArrayList<>();
        Pattern placeholderPattern = Pattern.compile("<([^<>]+)>");
        Matcher matcher = placeholderPattern.matcher(template);
        while (matcher.find()) {
            allMatches.add(matcher.group());
        }

        return getAllReplacements().entrySet().stream()
                // only consider those replacements that are contained in template
                .filter(entry -> allMatches.contains(entry.getKey()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().apply(data)
                ));
    }
}

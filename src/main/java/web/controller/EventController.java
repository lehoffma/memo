package web.controller;

import lib.model.Event;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by gzae on 1/6/17.
 */

@RestController
public class EventController {

    @RequestMapping("/item")
    public Event getItem(@RequestParam(value = "ID") int ID) {
        Event out = new Event();

        return out;
    }
}

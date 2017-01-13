package web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController {

    @RequestMapping({"/", "/tours", "/tours/{id:\\d+}", "/account", "/partys", "/member/{id:\\d+}"})
    public String index() {
        return "forward:/index.html";
    }


}

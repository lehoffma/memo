import {library} from "@fortawesome/fontawesome-svg-core";

import {faFacebookF} from "@fortawesome/free-brands-svg-icons/faFacebookF";
import {faTwitter} from "@fortawesome/free-brands-svg-icons/faTwitter";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons/faWhatsapp";
import {faFacebookMessenger} from "@fortawesome/free-brands-svg-icons/faFacebookMessenger";
import {faTelegramPlane} from "@fortawesome/free-brands-svg-icons/faTelegramPlane";

import {faLink} from "@fortawesome/free-solid-svg-icons/faLink";
import {faFacebook} from "@fortawesome/free-brands-svg-icons/faFacebook";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons/faEnvelope";
import {faGlobe} from "@fortawesome/free-solid-svg-icons/faGlobe";

const shareButtonsIcons = [
	faFacebookF, faTwitter, faFacebook, faEnvelope, faGlobe,
	faWhatsapp, faFacebookMessenger, faTelegramPlane,faLink
];

library.add(...shareButtonsIcons);

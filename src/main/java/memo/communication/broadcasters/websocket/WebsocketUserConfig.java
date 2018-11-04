package memo.communication.broadcasters.websocket;

import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;

public class WebsocketUserConfig extends ServerEndpointConfig.Configurator {
    @Override
    public void modifyHandshake(ServerEndpointConfig config, HandshakeRequest request, HandshakeResponse response) {
        if(!request.getParameterMap().containsKey("access_token")){
            return;
        }
        config.getUserProperties().put("access_token", request.getParameterMap().get("access_token"));
        super.modifyHandshake(config, request, response);
    }
}

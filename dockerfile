FROM tomcat

RUN rm -rf /usr/local/tomcat/webapps/ROOT/
ADD target/memo-0.2.war /usr/local/tomcat/webapps/ROOT.war


# todo java 11
FROM tomee:8-jre-7.1.0-plus

ADD target/memo-1.0.0.war /usr/local/tomee/webapps/ROOT.war
ADD tomee.xml /usr/local/tomee/conf/
ADD tomcat-users.xml /usr/local/tomee/conf/
ADD settings.xml /usr/local/tomee/conf/

CMD ["catalina.sh", "run"]

HEALTHCHECK --interval=10s --timeout=3s --retries=6 CMD curl -f http://localhost:8080/ROOT.com/health || exit 1

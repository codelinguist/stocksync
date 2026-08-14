FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src src
RUN mvn --batch-mode package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
RUN mkdir -p /tmp/vendor-b
COPY --from=build /workspace/target/stocksync-*.jar app.jar
COPY sample-data/vendor-b/stock.csv /tmp/vendor-b/stock.csv
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

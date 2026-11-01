# --- Etapa 1: compilación con Maven ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B package -DskipTests

# --- Etapa 2: imagen liviana para ejecutar ---
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/talleres-backend-*.jar app.jar
# Render define PORT; la app lo lee en server.port.
ENV JAVA_OPTS="-Xmx384m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

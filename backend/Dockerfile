# Use a newer Maven image that supports modern plugins
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build
WORKDIR /build

# Copy pom first and download dependencies (best practice for caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime - super small
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/target/*.jar /app/dechet.jar

EXPOSE 8082
CMD ["java", "-jar", "/app/dechet.jar"]
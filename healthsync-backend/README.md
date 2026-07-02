# HealthSync AI - Backend

HealthSync AI is an enterprise AI-Driven Health Center & Supply Chain Management System. This repository contains the scaffolded Spring Boot backend architecture.

## Tech Stack
- **Java 21**
- **Spring Boot 3.4.1**
- **Spring Security**
- **JWT** (JSON Web Tokens via io.jsonwebtoken)
- **Spring Data JPA**
- **PostgreSQL**
- **Flyway** (Database Migrations)
- **Maven** (Build Tool)

## Project Structure
The packages are organized under `com.healthsync`:

- `config/`: Core Spring Boot configuration classes (CORS, Swagger, Jackson, etc.).
- `security/`: Spring Security filters, JWT authentication entry points, and token provider configurations.
- `auth/`: Dedicated authentication flow components (Login, Registration, Token Refresh).
- `common/`: Reusable classes, helpers, properties, and base classes.
- `exception/`: Global Exception Handler and custom business exceptions.
- Domain Packages (e.g., `patient/`, `doctor/`, `inventory/`, `dashboard/`, `laboratory/`, `district/`, `bed/`, `analytics/`, `ai/`, `notification/`, `report/`):
  - `controller/`: REST controllers defining public APIs.
  - `service/`: Domain-specific business logic interfaces and implementations.
  - `repository/`: Spring Data JPA repositories.
  - `entity/`: Database JPA entities.
  - `dto/`: Request/Response data transfer objects.

## Getting Started

### Prerequisites
- JDK 21
- Maven 3.x
- PostgreSQL

### Build the Application
```bash
mvn clean package -DskipTests
```

### Run Locally
Configure your DB connection in `src/main/resources/application.yml` and run:
```bash
mvn spring-boot:run
```

### Run using Docker
```bash
docker build -t healthsync-backend .
docker run -p 8080:8080 healthsync-backend
```

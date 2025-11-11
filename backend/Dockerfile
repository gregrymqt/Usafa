# ESTÁGIO 1: Build (Compilação)
# Usamos uma imagem que tem o JDK completo para compilar o projeto
FROM eclipse-temurin:21-jdk-jammy AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia primeiro o pom.xml para aproveitar o cache de dependências do Docker
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .
# Baixa todas as dependências (sem o código fonte)
# Se o pom.xml não mudar, o Docker reutiliza esta camada
RUN ./mvnw dependency:go-offline

# Agora copia o código-fonte
COPY src/ src/

# Compila o projeto e cria o arquivo .jar
# -DskipTests pula a execução dos testes durante o build do Docker
RUN ./mvnw package -DskipTests

# ESTÁGIO 2: Run (Execução)
# Usamos uma imagem JRE (Java Runtime Environment), que é muito menor
# pois não precisa do compilador (JDK), apenas para rodar.
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copia o .jar que foi compilado no estágio 'build'
# O caminho exato do .jar depende do seu pom.xml (artifactId e version)
# Ajuste se o nome do seu .jar for diferente
COPY --from=build /app/target/usafa-0.0.1-SNAPSHOT.jar app.jar

# Expõe a porta 8080 (porta padrão do Spring Boot)
EXPOSE 8080

# Comando para iniciar a aplicação quando o container rodar
ENTRYPOINT ["java", "-jar", "app.jar"]

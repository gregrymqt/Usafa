# 🏥 Usafa - Sistema de Agendamento de Consultas Médicas

O **Usafa** é uma aplicação Full-Stack desenvolvida para modernizar o agendamento de consultas na rede pública de saúde. O projeto utiliza uma arquitetura baseada em micro-serviços containerizados, garantindo um ambiente de desenvolvimento isolado e escalável.

---

### 🛠 Tecnologias e Ferramentas
* **Backend:** Java 17 com Spring Boot
* **Frontend:** React com TypeScript e Vite
* **Banco de Dados:** PostgreSQL
* **Cache:** Redis
* **Infraestrutura:** Docker & Docker Compose

---

### 🐳 Arquitetura e Orquestração (Docker)
O projeto utiliza o Docker Compose para gerenciar a comunicação entre os serviços de forma automatizada.

#### 1. Networking (Rede Interna)
Os serviços estão conectados através da rede interna 'usafa-network'. O Backend encontra o Banco de Dados e o Cache apenas pelo nome do serviço ('db' e 'cache'), sem necessidade de IPs fixos.

#### 2. Variáveis de Ambiente e Segurança
Utilizamos um arquivo .env para gerenciar credenciais sensíveis (Postgres e Redis), garantindo que senhas e usuários não fiquem expostos no código-fonte.

#### 3. Comunicação Frontend-Backend
O Frontend é exposto na porta 3000 e o Backend na 8080. A comunicação é validada via @CrossOrigin, permitindo que a interface consuma a API de forma segura.

---

### 🚀 Como Executar o Projeto
Para subir todo o ecossistema com apenas um comando:

# Construir as imagens e subir os containers
docker-compose up --build

Acesse em: http://localhost:3000

---
Desenvolvido por Lucas Vicente (Gregrymqt).

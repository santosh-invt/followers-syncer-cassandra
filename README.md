Kafka + Cassandra + Node.js with Docker Compose

This project sets up a Kafka, Cassandra, Zookeeper, and Node.js API using Docker Compose.It provides a scalable architecture for handling real-time data processing and storage.

🚀 Prerequisites

Ensure you have the following installed:

Docker

Docker Compose

📌 Setup & Run

Follow these steps to start the services:

1️⃣ Clone the Repository

git clone <your-repository-url>
cd <your-project-folder>

2️⃣ Build and Start Services

Run the following command to start all containers:

docker-compose up --build -d

--build: Ensures that the Node.js service is built.

-d: Runs containers in detached mode.

3️⃣ Verify Running Containers

Check if all services are running:

docker ps

Expected output:

CONTAINER ID   IMAGE                      PORTS                    NAMES
xxxxxx         nodejs                     0.0.0.0:3003->3003/tcp   nodejs
xxxxxx         cassandra:latest           0.0.0.0:9042->9042/tcp   cassandra
xxxxxx         confluentinc/cp-kafka      0.0.0.0:9092->9092/tcp   kafka
xxxxxx         confluentinc/cp-zookeeper  0.0.0.0:2181->2181/tcp   zookeeper

⚙️ Configuration

📌 Environment Variables (Defined in docker-compose.yml)

📡 How to Use the Services

1️⃣ Test Node.js API


2️⃣ Connect to Kafka

Run the following command to create a Kafka topic:

 docker exec -it kafka kafka-console-producer --topic sync-influencers --bootstrap-server kafka:9092
Produce event in id ranges from 1000001 to 1,999,999 


Check available topics:

docker exec -it kafka kafka-topics --list --bootstrap-server kafka:9092
{"startId" : 1000001 , "endId" : 1000101 }
Above will sync influencers from 1000001 to 1000101

Apis to test:

1. /follower-count/:influencerId
2. /follower-timeline/:influencerId  query params: limit , default limit is 100
3. /follower-avg/:influencerId




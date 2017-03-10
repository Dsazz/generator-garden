FROM ubuntu:precise

RUN mkdir /project
WORKDIR /project

# common
RUN apt-get update
RUN apt-get install -y build-essential python-software-properties git

#mongo
RUN apt-get install -y mongodb
RUN mkdir -p /data/db/

RUN echo "version 0.0.3"
ADD ./dump /dump

RUN (mongod --smallfiles &) && sleep 15 && cd / && mongorestore

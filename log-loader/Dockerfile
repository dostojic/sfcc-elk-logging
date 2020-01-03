FROM docker.elastic.co/beats/filebeat:6.1.3

USER root

COPY sync /usr/tmp/sync/
# COPY ./config/filebeat.yml /usr/share/filebeat/filebeat.yml

RUN /bin/bash
RUN yum upgrade -y && \
    yum install -y curl epel-release

RUN curl --silent --location https://rpm.nodesource.com/setup_6.x | bash -
RUN yum install -y npm

ADD sync/package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY sync /opt/app

#Uses environment variables for arguments
CMD node run.js
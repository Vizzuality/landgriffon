FROM postgis/postgis:13-3.1

LABEL maintainer="Vizzuality <hello@vizzuality.com>"

RUN apt-get update

RUN apt-get install -y pgxnclient cmake make gcc libtool git postgresql-client-13 postgresql-server-dev-13


ARG PG_H3_VERSION=3.7.1
ENV PG_H3_VERSION $PG_H3_VERSION

RUN pgxn install "h3==${PG_H3_VERSION}"

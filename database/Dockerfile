FROM postgis/postgis:14-3.2

LABEL maintainer="Vizzuality <hello@vizzuality.com>"

RUN apt-get update

RUN apt-get install -y pgxnclient cmake make gcc libtool git postgresql-client-14 postgresql-server-dev-14


ARG PG_H3_VERSION=3.7.2
ENV PG_H3_VERSION $PG_H3_VERSION

RUN pgxn install "h3==${PG_H3_VERSION}"

COPY entrypoint.sh /usr/local/bin/

ENTRYPOINT ["entrypoint.sh"]

FROM postgis/postgis:14-3.5

LABEL maintainer="Vizzuality <hello@vizzuality.com>"

# Set the PG_H3_VERSION environment variable
ARG PG_H3_VERSION=3.7.2
ENV PG_H3_VERSION=${PG_H3_VERSION}

# Install necessary packages, build the h3 extension, and clean up to reduce image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pgxnclient \
    cmake \
    make \
    gcc \
    libtool \
    git \
    postgresql-client-14 \
    postgresql-server-dev-14 && \
    pgxn install "h3==${PG_H3_VERSION}" && \
    apt-get purge -y --auto-remove \
    cmake \
    make \
    gcc \
    libtool \
    git \
    postgresql-server-dev-14 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

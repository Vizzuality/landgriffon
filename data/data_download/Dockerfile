FROM osgeo/gdal:ubuntu-full-3.2.1
LABEL maintainer="hello@vizzuality.com"
ENV NODE_OPTIONS=--max_old_space_size=16384
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sh -
RUN apt-get update
RUN apt-get install -y --no-install-recommends nodejs make jq postgresql-client time

RUN npm i -g mapshaper@0.5.66

COPY ./ ./

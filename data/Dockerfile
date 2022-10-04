FROM osgeo/gdal:ubuntu-full-3.2.1
LABEL maintainer="hello@vizzuality.com"

ENV NODE_OPTIONS=--max_old_space_size=16384
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sh -
RUN apt-get --allow-releaseinfo-change update
RUN apt-get install -y --no-install-recommends pip make jq postgresql-client time build-essential zip nodejs

RUN npm i -g mapshaper@0.5.66

RUN pip install --upgrade --no-cache-dir pip

COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /
RUN mkdir -p data/

COPY ./base_data_importer/ /base_data_importer
COPY ./data_download/ /data_download
COPY h3_data_importer /h3_data_importer
COPY ./Makefile ./Makefile

ENTRYPOINT ["/usr/bin/make"]

FROM perrygeo/gdal-base

ENV NVM_DIR /usr/local/nvm
RUN apt-get install zip


RUN pip install --upgrade --no-cache-dir pip

COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p "$NVM_DIR"; \
    wget -q \
        "https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh" | \
        bash \
    ; \
    source $NVM_DIR/nvm.sh; \
    nvm install --lts --latest-npm \
    && npm install @mapbox/mapbox-gl-style-spec --global
RUN npm i -g mapshaper@0.5.34

WORKDIR /
RUN mkdir -p data/

COPY ./ ./

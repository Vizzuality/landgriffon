FROM perrygeo/gdal-base

RUN apt-get --allow-releaseinfo-change update
RUN apt-get install -y build-essential zip nodejs npm

RUN pip install --upgrade --no-cache-dir pip

COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# confirm installation
RUN node -v
RUN npm -v

RUN npm i -g mapshaper@0.5.34

WORKDIR /
RUN mkdir -p data/

COPY ./ ./

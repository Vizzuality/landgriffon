FROM perrygeo/gdal-base

RUN apt-get install zip

RUN pip install --upgrade --no-cache-dir pip

COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /
RUN mkdir -p data/

COPY ./ ./

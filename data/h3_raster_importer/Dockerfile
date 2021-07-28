FROM perrygeo/gdal-base

RUN pip install --upgrade --no-cache-dir pip
RUN pip install --no-cache-dir numpy pandas rasterio h3ronpy psycopg2-binary docopt
RUN mkdir -p data/

COPY ./ ./
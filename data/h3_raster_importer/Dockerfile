FROM perrygeo/gdal-base

RUN pip install --upgrade --no-cache-dir pip

COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p data/

COPY ./ ./

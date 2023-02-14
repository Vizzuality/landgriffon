FROM python:3.11
LABEL maintainer="hello@vizzuality.com"

ARG PORT=4000

ENV PORT $PORT

RUN mkdir /opt/landgriffon-tiler

WORKDIR /opt/landgriffon-tiler


COPY requirements.txt requirements.txt
COPY app /opt/landgriffon-tiler/

RUN pip install --no-cache-dir --upgrade -r ./requirements.txt

EXPOSE $PORT

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$PORT"]

FROM python:3.8.1-alpine

COPY . /app

RUN \
  apk add --no-cache --virtual .build-deps gcc musl-dev \
  && pip install --no-cache-dir -r /app/requirements.txt \
  && apk del .build-deps \
  && rm -f /app/requirements.txt

WORKDIR /app

EXPOSE 5000

ENTRYPOINT ["python", "server.py"]

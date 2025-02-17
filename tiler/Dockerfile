# ===== Builder Stage =====
FROM python:3.13-slim as builder

ENV NAME=landgriffon-tiler
ENV USER=$NAME
ENV APP_HOME=/opt/$NAME
ENV GDAL_CONFIG=/usr/bin/gdal-config

# Create system group and user for the application
RUN addgroup --system $USER && \
    adduser --system --ingroup $USER $USER

WORKDIR $APP_HOME

# Copy only the dependency file first to leverage Docker cache
COPY requirements.txt .

# Install build dependencies and GDAL development libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential \
      gcc \
      gdal-bin \
      libgdal-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies to a custom target directory (/install)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Copy application source code
COPY app app

# ===== Final Stage (Runtime) =====
FROM python:3.13-slim
LABEL maintainer="hello@vizzuality.com"

ENV NAME=landgriffon-tiler
ENV USER=$NAME
ENV APP_HOME=/opt/$NAME
ENV GDAL_CONFIG=/usr/bin/gdal-config

# Create system group and user in the runtime image
RUN addgroup --system $USER && \
    adduser --system --ingroup $USER $USER

WORKDIR $APP_HOME

# Install runtime dependencies. Here we only need gdal-bin (no need for build-essential/gcc)
RUN apt-get update && apt-get install -y --no-install-recommends \
      gdal-bin && \
    rm -rf /var/lib/apt/lists/*

# Copy the installed Python packages from the builder stage.
# Typically, pip installs packages into /usr/local in the base image.
COPY --from=builder /install /usr/local

# Copy the application code from the builder stage.
COPY --from=builder $APP_HOME $APP_HOME

# Ensure the application directory is owned by the non-root user.
RUN chown -R $USER:$USER $APP_HOME

EXPOSE 4000
USER $USER

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]

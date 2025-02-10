FROM python:3.11-slim
LABEL maintainer="hello@vizzuality.com"

# Arguments for your user & paths (optional)
ARG USER_NAME=landgriffon-tiler
ARG APP_HOME=/opt/${USER_NAME}

# Create a non-root user
RUN useradd --shell /bin/bash --create-home --home-dir ${APP_HOME} ${USER_NAME}

# Switch to the application directory
WORKDIR ${APP_HOME}

# Install GDAL dev libs and build tools for Rasterio, then remove them when done
# so the final image is smaller. We keep gdal-bin for runtime usage (if needed).
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    gdal-bin       \
    libgdal-dev    \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better cache usage
COPY requirements.txt .

# Install Python dependencies (including Rasterio)
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt \
 # Now remove dev packages if you only need gdal-bin at runtime (and the 
 # shared libraries that come with it). If you need dev packages in the container 
 # for other reasons, skip the following purge:
 && apt-get purge -y --auto-remove libgdal-dev build-essential \
 && rm -rf /var/lib/apt/lists/*

# Copy your application
COPY --chown=${USER_NAME}:${USER_NAME} app ./app

# Switch to non-root user
USER ${USER_NAME}

EXPOSE 4000

# @todo Consider whether to use a shell script as entrypoint to allow for
# different run modes (e.g. debug, dev, prod, etc.) via Docker commands

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]

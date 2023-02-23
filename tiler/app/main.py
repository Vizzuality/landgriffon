from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from titiler.core import TilerFactory
from titiler.core.errors import DEFAULT_STATUS_CODES, add_exception_handlers
from titiler.core.middleware import TotalTimeMiddleware, LoggerMiddleware
from .middlewares.auth_middleware import AuthMiddleware
from .middlewares.url_injector import inject_s3_url

app = FastAPI(title="LandGriffon Tiler")
app.add_middleware(TotalTimeMiddleware)
app.add_middleware(LoggerMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["GET"],
                   allow_headers=["*"], )

# single COG tiler. One file can have multiple bands
cog = TilerFactory(router_prefix="/cog", path_dependency=inject_s3_url)
app.include_router(cog.router, tags=["Cloud Optimized GeoTIFF"], prefix="/cog", )
add_exception_handlers(app, DEFAULT_STATUS_CODES)


@app.get("/health", description="Health Check", tags=["Health Check"])
def ping():
    """Health check."""
    return {"ping": "pong"}

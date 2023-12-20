from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from titiler.core import TilerFactory
from titiler.core.errors import DEFAULT_STATUS_CODES, add_exception_handlers
from titiler.core.middleware import TotalTimeMiddleware, LoggerMiddleware

from .config.config import get_settings
from .middlewares.auth_middleware import AuthMiddleware
from .middlewares.s3_access import s3_presigned_access

root_path = get_settings().root_path
titiler_router_prefix = (
    get_settings().titiler_router_prefix if get_settings().titiler_router_prefix is not None else "/cog"
)
titiler_prefix = get_settings().titiler_prefix if get_settings().titiler_prefix is not None else "/cog"

app = FastAPI(title="LandGriffon Tiler", docs_url="/tiler/docs", openapi_url="/tiler", debug=True)
app.add_middleware(TotalTimeMiddleware)
app.add_middleware(LoggerMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# single COG tiler. One file can have multiple bands
cog = TilerFactory(router_prefix=titiler_router_prefix, path_dependency=s3_presigned_access)
app.include_router(cog.router, tags=["Cloud Optimized GeoTIFF"], prefix=titiler_prefix)
add_exception_handlers(app, DEFAULT_STATUS_CODES)


@app.get("/health", description="Health Check", tags=["Health Check"])
def ping():
    """Health check."""
    return {"ping": "pong"}

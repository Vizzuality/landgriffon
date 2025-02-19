import requests
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import os
from app.config.config import get_settings

api_url = get_settings().api_url
api_port = get_settings().api_port
require_auth = get_settings().require_auth


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        print('accessing path', request.url.path)
        if request.url.path in ("/health", "/tiler/docs", "/tiler"):
            return await call_next(request)
        if require_auth == "false":
            return await call_next(request)
        else:
            try:
                token = request.headers.get("Authorization")
                if not token:
                    return Response(status_code=400, content="No token found")
                headers = {
                    "Authorization": token
                }
                response = requests.get(f"{api_url}:{api_port}/auth/validate-token", headers=headers)
                if response.status_code != 200:
                    return Response(status_code=401, content="Unauthorized")
                return await call_next(request)


            except Exception as e:
                print(e)
                raise HTTPException(status_code=500, detail=str(e))

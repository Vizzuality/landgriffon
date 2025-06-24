import logging

import dotenv
from kedro.framework.hooks import hook_impl

log = logging.getLogger(__name__)


class EnvHook:
    """Load .env env vars"""

    @hook_impl
    def after_context_created(self):
        env_path = dotenv.find_dotenv()
        log.info("Loaded env vars from %s", env_path)
        dotenv.load_dotenv(env_path)

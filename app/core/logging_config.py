import os
import logging
from logging.config import dictConfig


def setup_logging(settings) -> None:
    """Configure application logging with console + rotating file handlers.

    - Writes to logs/app.log (10MB x5 rotations)
    - Honors settings.log_level
    - Sets sensible levels for uvicorn and sqlalchemy
    """
    # Ensure log directory exists
    log_dir = getattr(settings, "log_dir", "logs")
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "default": {
                    "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
                }
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "level": settings.log_level,
                    "formatter": "default",
                },
                "file": {
                    "class": "logging.handlers.RotatingFileHandler",
                    "level": settings.log_level,
                    "filename": log_file,
                    "maxBytes": 10 * 1024 * 1024,  # 10MB
                    "backupCount": 5,
                    "encoding": "utf-8",
                    "formatter": "default",
                },
            },
            "loggers": {
                # Application logger
                "app": {
                    "handlers": ["console", "file"],
                    "level": settings.log_level,
                    "propagate": False,
                },
                # Third-party loggers tuning
                "uvicorn.error": {"level": settings.log_level},
                "uvicorn.access": {"level": "INFO"},
                "sqlalchemy.engine": {"level": "WARNING"},
            },
            "root": {
                "handlers": ["console", "file"],
                "level": settings.log_level,
            },
        }
    )

    logging.getLogger("app").info("Logging initialized")

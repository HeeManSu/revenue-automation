"""
Celery application entry point for the revenue automation system.
This file allows running Celery commands from the project root.
"""

from app.jobs import celery_app

__all__ = ['celery_app']

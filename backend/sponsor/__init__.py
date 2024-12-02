from flask import Blueprint

sponsor_bp = Blueprint('auth', __name__)

from . import views


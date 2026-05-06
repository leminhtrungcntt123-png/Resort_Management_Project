import json
import os
import logging
from sqlalchemy import create_engine,text

DATA_DIR="/app/data"
DB_URL=os.getenv("DATABASE_URL")
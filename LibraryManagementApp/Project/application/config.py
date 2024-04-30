import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config():
    DEBUG = False
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False 
    CACHE_TYPE="RedisCache" 
    CACHE_REDIS_HOST="localhost"
    CACHE_REDIS_PORT=6379  
    CACHE_DEFAULT_TIMEOUT=300

class LocalDevelopmentConfig(Config):
    SQLITE_DB_DIR = os.path.join(basedir, "../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "database.sqlite3")
    DEBUG = False
    SECRET_KEY="SUPER-SECRET-KEY"
    UPLOAD_FOLDER = '/path/to/the/uploads'
    CACHE_TYPE="RedisCache" 
    CACHE_REDIS_HOST="localhost"
    CACHE_REDIS_PORT=6379
    CACHE_REDIS_DB=3   
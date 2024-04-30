import os
from flask import Flask
from flask_restful import Resource ,Api
from flask_jwt_extended import JWTManager
from application import config
from application.config import LocalDevelopmentConfig
from application.database import db
from application.worker import celery_init_app 
import flask_excel as excel
from celery.schedules import crontab 
from application.tasks import daily_reminder,initialize_visited,monthly_report
from datetime import datetime
from application.instances import cache


app=None
api=None
celery_app=None

def create_app():
    print("inside craete_app")
    app = Flask(__name__ , template_folder="templates")
    api=None
    if os.getenv('ENV', "development") == "production":
      raise Exception("Currently no production config is setup.")
    else:
      print("Staring Local Development")
      app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    cache.init_app(app)
    # excel.init_excel(app)
    api=Api(app)
    jwt=JWTManager(app)
    app.app_context().push()
    # celery_app=celery_init_app(app)
    return app,api,jwt

app ,api,jwt= create_app()
from application.controllers import *
from application.api import UserApi,SectionApi,Login,allSection,sectionBooks,searchedBooks,allBooks,RequestedBooks,allowAccess,myBooks
api.add_resource(UserApi,"/api/user/<string:UserName>/<string:Password>","/api/user")
# api.add_resource(BooksApi,"/api/books/<string:name>","/api/books")
api.add_resource(SectionApi,"/api/section/<string:id>","/api/section")
api.add_resource(allSection,"/api/allSection")
api.add_resource(sectionBooks,"/api/section/books/<string:id>")
api.add_resource(searchedBooks,"/api/search/books/<string:name>")
api.add_resource(allBooks,"/allbooks")
api.add_resource(Login,"/login")
api.add_resource(RequestedBooks,"/requested_books/<string:name>","/requested_books/<string:name>/<string:id>")
api.add_resource(allowAccess,"/allow_access","/allow_access/<string:id>")
api.add_resource(myBooks,"/my_books/<string:name>","/my_books/<string:name>/<string:id>")

excel.init_excel(app)
celery_app=celery_init_app(app)
@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
  #  sender.add_periodic_task(30.0, daily_reminder.s('hello'), name='add every 30')
  sender.add_periodic_task(
      crontab(hour=15,minute=57),
      daily_reminder.s(),
    ),

  sender.add_periodic_task(
            crontab(hour=0, minute=0),
            initialize_visited.s(),
        )
  
  sender.add_periodic_task(
            crontab(hour=0 ,minute=0,day_of_month=1),
            monthly_report.s(),
  )
  
if __name__ == '__main__':
  app.run(host="0.0.0.0",port=5000)
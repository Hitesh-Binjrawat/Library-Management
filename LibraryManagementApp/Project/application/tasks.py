from celery import shared_task
from datetime import datetime,date
from .models import Books
from application.database import db
from flask_sqlalchemy import SQLAlchemy
import flask_excel as excel
import csv
# import pandas as pd
from application.mailservice import send_message
from application.models import User,Books,Book_Catalogue,Section
import matplotlib.pyplot as plt


# @shared_task(ignore_result=False)
# def create_file(id):
#     bookpdf=db.session.query(Books).filter(Books.ID==id).all()
#     output_file=excel.make_response_from_query_sets(bookpdf,["Content"],"csv")
#     filename="test.csv"
#     data=pd.read_csv(filename)
#     return filename

@shared_task(ignore_result=True)
def daily_reminder():
    users=db.session.query(User).all()
    for user in users:
        if user.Visited==0:
            send_message(user.Email,"Not Visited","<html>You have not visited our application today</html>")
    return "OK"

@shared_task(ignore_result=False)
def initialize_visited():
    users=db.session.query(User).filter(User.Role==0).all()
    current_date=date.today()
    for user in users:
        user.Visited=0  
        books_issued=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user.ID,Book_Catalogue.LastDate<current_date,Book_Catalogue.Request==1).all()
        for book in books_issued:
            book.Request=-1
    books_catalogue=db.session.query(Book_Catalogue).filter((Book_Catalogue.Request==1) | (Book_Catalogue.Request==-1)).all()
    IdList=[]
    secId=[]
    for book_catalogue in books_catalogue:
        IdList.append(book_catalogue.BookId)
    booksName=[]
    for id in IdList:
        thisBook=db.session.query(Books).filter(Books.ID==id).first()
        if thisBook:
            secId.append(thisBook.Section)
            booksName.append(thisBook.Name)
    sectionName=[]
    for i in secId:
        sect=db.session.query(Section).filter(Section.ID==i).first()
        if sect:
            sectionName.append(sect.Name)
    
    Dict={}
    for name in booksName:
        if name in Dict:
            Dict[name]+=1
        else:
            Dict[name]=1
    sectDict={}
    for name in sectionName:
        if name in sectDict:
            sectDict[name]+=1
        else:
            sectDict[name]=1

    fig =plt.figure()
    ax1 = fig.add_subplot(2, 3, 1)
    ax2=fig.add_subplot(2,3,3)
    ax1.bar(Dict.keys(),Dict.values())
    ax1.set_xticklabels(labels=Dict.keys(),rotation=90)
    ax2.pie(sectDict.values(),labels=sectDict.keys())
    fig.savefig("./static/Staus.jpg")

    fig.show()
    db.session.commit()
    return "OK"

@shared_task(ignore_result=False)
def monthly_report():
    current_day = str(date.today())
    list_day=current_day.split("-")
    list_day[1]=str(int(list_day[1])-1)
    first_day="-".join(list_day)
    first_day = str(datetime.strptime(first_day,'%Y-%m-%d').date())
    users=db.session.query(User).filter(User.Role==0).all()
    for user in users:
        booksName=[]
        book_issued=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user.ID,Book_Catalogue.IssueDate<current_day,Book_Catalogue.IssueDate>=first_day,Book_Catalogue.Request.in_([1,-1])).all()
        for book_user in book_issued:
            book=db.session.query(Books).filter(Books.ID==book_user.BookId).first()
            if(book):
                print(book.Name)
                booksName.append((book.Name,book.Ratings))
        if(booksName==[]):
            send_message(user.Email,"Monthly Report","You did not visit any book this month")
            return "OK"
        booksName=set(booksName)
        booksName=list(booksName)
        content="<html><div>Books Visited this Month </div><table border='1'>"

        for book in booksName:
            newdata="<tr><td>"+book[0]+"</td><td>"+str(book[1])+"</td></tr>"
            content+=newdata
        content+="</table></html>"
        
        send_message(user.Email,"Monthly Report",content)
    return "OK"
        







    
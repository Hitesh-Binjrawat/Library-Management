from flask import Flask,request,render_template,send_file,jsonify
from flask import current_app as app 
from application.models import User,Books,Book_Catalogue
from application.database import db
from flask_sqlalchemy import SQLAlchemy
import os
from werkzeug.exceptions import HTTPException
from application.api import NotFoundError,InternalServerError
from .instances import cache

# from weasyprint import HTML

@app.route("/",methods=["GET"])
def home():
    return render_template("index.html")

@app.route("/books",methods=["GET","POST","PUT","DELETE"])
def books():
    if request.method=="POST":
        try:
            Name=request.form.get("Name")
            Description=request.form.get("Description")
            Section=request.form.get("Section")
            Author=request.form.get("Author")
            Price=request.form.get("Price")
            print(Name,Description,Section,Author,Price)
            FrontPage=request.files["FrontPage"]
            Content=request.files["Content"]
            print(Name,Description,Section,Author,Price)
            print(Content.filename,FrontPage.filename)
            book=Books(Name=Name,Description=Description,Section=Section,Author=Author,Price=Price,Ratings=5)
            db.session.add(book)
            db.session.commit()
            lastAdded=db.session.query(Books).filter(Books.Name==Name).first()
            id=lastAdded.ID
            print(FrontPage.filename)
            FrontPage.filename=str(id)+".jpeg"
            FrontPage.save('static/'+FrontPage.filename)
            Content.filename=str(id)+".pdf"
            Content.save('static/'+Content.filename)
            cache.clear()
            return "",200
        except:
            return "Internal Server Occurred",500
    if request.method=="PUT":
        try:
            ID=request.form.get("ID")
            Name=request.form.get("Name")
            Description=request.form.get("Description")
            Section=request.form.get("Section")
            Author=request.form.get("Author")
            Price=request.form.get("Price")
            FrontPage=request.files["FrontPage"]
            Content=request.files["Content"]

            book=db.session.query(Books).filter(Books.ID==ID).first()
            book.Name=Name
            book.Description=Description
            book.Price=Price
            book.Author=Author
            db.session.commit()
            cache.clear()
            if Content.filename=="" and FrontPage.filename=="":
                return "",200
            elif FrontPage.filename=="":
                Content.filename=ID+".pdf"
                Content.save('static/'+Content.filename)           
                return "",200
            elif Content.filename=="":
                FrontPage.filename=ID+".jpeg"
                FrontPage.save('static/'+FrontPage.filename)
                return "",200 
            else:
                Content.filename=ID+".pdf"
                if os.path.exists('static/' + Content.filename):
                    os.remove('static/' + Content.filename)
                Content.save('static/'+Content.filename)
                FrontPage.filename=ID+".jpeg"
                FrontPage.save('static/'+FrontPage.filename)
                return "",200 
        except:
            raise InternalServerError(500)
    if request.method=="DELETE":
        ID=request.form.get("ID")
        book_cats=db.session.query(Book_Catalogue).filter(Book_Catalogue.BookId==ID,Book_Catalogue.Request==1).all()
        for book_cat in book_cats:
            book_cat.Request=-1 
        book=db.session.query(Books).filter(Books.ID==ID).first()
        db.session.delete(book)
        db.session.commit()
        cache.clear()
        return "",200




@app.route("/request/<user_id>/<book_id>")
def requestBooks(user_id,book_id):
    print(user_id,book_id)
    isUser=db.session.query(User).filter(User.UserName==user_id).first()
    isBook=db.session.query(Books).filter(Books.ID==book_id).first()
    duplicateRequest=db.session.query(Book_Catalogue).filter(Book_Catalogue.BookId==book_id,Book_Catalogue.UserId==isUser.ID,((Book_Catalogue.Request==0) | (Book_Catalogue.Request==1))).first()
    if duplicateRequest:
        return "",409
    print(isUser,isBook)
    if isUser and isBook:
        try:
            newRequest=Book_Catalogue(BookId=book_id,UserId=isUser.ID,Request=0)
            db.session.add(newRequest)
            db.session.commit()
            return "",200
        except:
            raise InternalServerError(status_code=500)
    else:
        if isUser==None:
            raise NotFoundError(status_code=400) 
        

@app.route("/get_file/<book_id>")
def getFile(book_id):
        opath = os.path.join(app.root_path+"/static/"+book_id+".pdf")
        return send_file(opath ,as_attachment=True),200


@app.route('/book_status')
def getStatus():
    if request.method=="GET":
        try:
            Dlist=[]
            users=db.session.query(User).filter(User.Role==0).all()
            for i in users:
                booksIssued=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==i.ID,Book_Catalogue.Request==1).all()
                for j in booksIssued:
                    book=db.session.query(Books).filter(Books.ID==j.BookId).first()
                    if book:
                        Dlist.append([i.UserName,book.Name,j.IssueDate,j.LastDate])
            return jsonify(Dlist)
        except:
            raise InternalServerError(500)

@app.route("/ratings/<id>/<rating>")
def updateRatings(id,rating):
    book=db.session.query(Books).filter(Books.ID==id).first()
    book.Ratings=round((int(rating)+book.Ratings)/2,2)
    db.session.commit()
    return "",200

        



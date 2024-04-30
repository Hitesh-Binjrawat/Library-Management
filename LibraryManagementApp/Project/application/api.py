from flask import Flask, request, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, fields, marshal_with
from werkzeug.exceptions import HTTPException
import json
from application.models import User,Section,Books,Book_Catalogue
from application.database import db
from datetime import date,timedelta
from flask_jwt_extended import create_access_token,jwt_required
from .instances import cache
from time import perf_counter_ns

class NotFoundError(HTTPException):
    def __init__(self, status_code):
        self.response = make_response('', status_code)

class InternalServerError(HTTPException):
    def __init__(self, status_code):
        self.response = make_response('', status_code)

class ExistsError(HTTPException):
    def __init__(self, status_code):
        self.response = make_response('', status_code)

class NotExistsError(HTTPException):
    def __init__(self, status_code):
        self.response = make_response('', status_code)

class BuisnessValidationError(HTTPException):
    def __init__(self, status_code, error_code, error_message):
        message={"error_code": error_code, "error_message": error_message}
        self.response = make_response(json.dumps(message), status_code)


User_parser = reqparse.RequestParser()
User_parser.add_argument("Name",type=str)
User_parser.add_argument("UserName",type=str)
User_parser.add_argument("Email",type=str)
User_parser.add_argument("Password",type=str)

Section_parser=reqparse.RequestParser()
Section_parser.add_argument("Name",type=str)
Section_parser.add_argument("Description",type=str)


Books_parser=reqparse.RequestParser()
Books_parser.add_argument("Name",type=str)
Books_parser.add_argument("Description",type=str)
Books_parser.add_argument("Section",type=str)


Login_parser=reqparse.RequestParser()
Login_parser.add_argument("UserName")
Login_parser.add_argument("Password")

user_output={
    "ID":fields.Integer,
    "Name":fields.String,
    "UserName":fields.String,
    "Email":fields.String,
    "Password":fields.String
}
section_output={
    "ID":fields.Integer,
    "Name":fields.String,
    "DateCreated":fields.String,
    "Description":fields.String
}

class UserApi(Resource):
    @marshal_with(user_output)
    def get(self,UserName,Password):
        try:
            user=db.session.query(User).filter( User.UserName==UserName,User.Password==Password ).first()
            print(user)
            print(user.Name)
            if  user:
                return user
            else:
                print("Hello from get")
                raise NotFoundError(status_code=404)
        
        except NotFoundError as nfe:
                raise nfe
        except Exception as e:
            raise InternalServerError(status_code=500)
    def put(self):
        pass
        
    def post(self):
        args = User_parser.parse_args()
        Name=args.get("Name",None)
        UserName=args.get("UserName",None)
        Email=args.get("Email",None)
        Password=args.get("Password",None)
        if Name is None or Name=="":
            raise BuisnessValidationError(status_code=400, error_code="User1001", error_message="full name is required")
        if UserName is None or UserName=="":
            raise BuisnessValidationError(status_code=400, error_code="User1002", error_message="User name is required")
        user=db.session.query(User).filter(User.UserName == UserName).first()
        if user:
            raise BuisnessValidationError(status_code=400, error_code="User1007", error_message="Duplicate user")
        new_user=User(Name=Name,UserName=UserName,Role=0,Email=Email,Password=Password)
        db.session.add(new_user)
        db.session.commit()
        return "",200
    
    def delete(self):
        pass




class SectionApi(Resource):
    @marshal_with(section_output)
    def get(self,name):
        section=db.session.query(Section).filter(Section.Name==name).first()
        if section:
            return section
        raise NotFoundError(status_code=404)
    @jwt_required()
    def put(self,id):
        args=Section_parser.parse_args()
        Name=args.get("Name")
        Description=args.get("Description")
        print(Name,Description)
        section=db.session.query(Section).filter(Section.ID==id).first()
        try:
            if section:
                section.Name=Name
                section.Description=Description
                db.session.commit()
                return "",200
            else:
                raise NotFoundError(status_code=404)
        except:
            raise InternalServerError(status_code=500)
        
        
    @jwt_required()
    def post(self):
        args=Section_parser.parse_args()
        Name=args.get("Name",None)
        Description=args.get("Description",None)
        print(Name,Description)
        currentDate=date.today()
        if Name==None or Name=="":
            raise BuisnessValidationError(status_code=400, error_code="Section1001", error_message="Section Name is Required")
        if Description==None or Description=="":
            raise BuisnessValidationError(status_code=400, error_code="Section1001", error_message="Section description is Required")
        
        sectionCheck=db.session.query(Section).filter(Section.Name==Name).first()
        if sectionCheck:
            raise BuisnessValidationError(status_code=400, error_code="Section1007", error_message="Section already exist")
        newSection=Section(Name=Name,DateCreated=currentDate,Description=Description)
        db.session.add(newSection)
        db.session.commit()
        return "",200
    @jwt_required()
    def delete(self,id):
        section=db.session.query(Section).filter(Section.ID==id).first()
        try:
            if(section):
                books=db.session.query(Books).filter(Books.Section==id).all()
                for book in books:
                    bookIssued=db.session.query(Book_Catalogue).filter(Book_Catalogue.BookId==book.ID,Book_Catalogue.Request==1).all()
                    for bookIssue in bookIssued:
                        bookIssue.Request=-1
                    db.session.delete(book)
                db.session.delete(section)
                db.session.commit()
                return "",200
            else:
                raise NotFoundError(status_code=404)
        except:
            raise InternalServerError(status_code=500)

class Login(Resource):

    def post(self):
        args=Login_parser.parse_args()
        userName=args.get("UserName")
        password=args.get("Password")
        try:
            print(userName,password)
            user=db.session.query(User).filter( User.UserName==userName,User.Password==password ).first()
            if  user:
                print(user.Role)
                user.Visited=1
                db.session.commit()
                return {"UserName":userName,"Password":password,"Role":user.Role,"auth":create_access_token(identity=user.Name) },200
            else:
                raise NotFoundError(status_code=404)
        
        except NotFoundError as nfe:
                raise nfe
        except Exception as e:
            raise InternalServerError(status_code=500)

class allSection(Resource):
    @marshal_with(section_output)
    @jwt_required()
    def get(self):
        section=db.session.query(Section).all()
        return section

sectionBooks_output={
    "ID":fields.Integer,
    "Name":fields.String,
    "Description":fields.String,
    "Section":fields.String,
    "Author":fields.String, 
    "Price":fields.Integer,
    "Content":fields.String,
    "Ratings":fields.Float
}

class allBooks(Resource):
    @cache.cached(timeout=50)
    @marshal_with(sectionBooks_output)
    def get(self):
        start=perf_counter_ns()
        books=db.session.query(Books).all()
        stop=perf_counter_ns()
        print("time taken" ,stop-start)
        return books
    
class sectionBooks(Resource):
    @marshal_with(sectionBooks_output)
    def get(self,id):
        try:
            books=db.session.query(Books).filter(Books.Section==id).all()
            print(books)
            if books==[]:
                return None,200
            return books,200
        except:
            raise InternalServerError(status_code=500)
class searchedBooks(Resource):
    @marshal_with(sectionBooks_output)
    def get(self,name):
        try:
            query="%"+name+"%"
            books=db.session.query(Books).filter(Books.Name.like(query)).all()
            if books==[]:
                books=db.session.query(Books).filter(Books.Author.like(query)).all()
                if books!=[]:
                    return books,200
                else:
                    raise NotFoundError(400)
            else:
                return books,200 
        except:
            raise InternalServerError(status_code=500)

class RequestedBooks(Resource):
    @marshal_with(sectionBooks_output)
    def get(self,name):
        try:
            user=db.session.query(User).filter(User.UserName==name).first()
            books=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user.ID,Book_Catalogue.Request==0).all()
            booksList=[]
            for i in books:
                book=db.session.query(Books).filter(Books.ID==i.BookId).first()
                booksList.append(book)
            return booksList,200
        except:
            raise InternalServerError(status_code=500)
    def delete(self,name,id):
        try:
            user=db.session.query(User).filter(User.UserName==name).first()
            book=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user.ID,Book_Catalogue.BookId==id,Book_Catalogue.Request==0).first()
            db.session.delete(book)
            db.session.commit()
            return "",200
        except:
            raise InternalServerError(status_code=500)

allowAccess_output={
    "ID":fields.Integer,
    "UserName":fields.String,
    "BookName":fields.String,
}
class allowAccess(Resource):
    @marshal_with(allowAccess_output)
    def get(self):
        try:
            L=[]
            userBooks=db.session.query(Book_Catalogue).filter(Book_Catalogue.Request==0).all()
            for i in userBooks:
                Dict={}
                user=db.session.query(User).filter(User.ID==i.UserId).first()
                book=db.session.query(Books).filter(Books.ID==i.BookId).first()
                Dict["ID"]=i.ID
                Dict["UserName"]=user.Name
                Dict["BookName"]=book.Name
                L.append(Dict)

            return L,200
        except:
            raise InternalServerError(status_code=500)
    def put(self,id):
        try:
            requested=db.session.query(Book_Catalogue).filter(Book_Catalogue.ID==id).first()
            user=requested.UserId
            currentBooks=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user,Book_Catalogue.Request==1).all()
            print(len(currentBooks))
            if (len(currentBooks)<5):
                print(requested.Request)
                requested.Request=1
                requested.IssueDate=str(date.today())
                requested.LastDate=str(date.today() + timedelta(days=7))
                db.session.commit()
                return "",200
            else:
                return "",429
        except:
            raise InternalServerError(status_code=500)
    def delete(self,id):
        requested=db.session.query(Book_Catalogue).filter(Book_Catalogue.ID==id).first()
        try:
            requested.Request=-99
            db.session.commit()
            return "",200
        except:
            raise InternalServerError(status_code=500)

class myBooks(Resource):
    @marshal_with(sectionBooks_output)
    def get(self,name):
        try:
            user=db.session.query(User).filter(User.UserName==name).first()
            books=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user.ID,Book_Catalogue.Request==1).all()
            booksList=[]
            for i in books:
                book=db.session.query(Books).filter(Books.ID==i.BookId).first()
                booksList.append(book)
            return booksList,200
        except:
            raise InternalServerError(status_code=500)
    def put(self,name,id):
        user=db.session.query(User).filter(User.UserName==name).first()
        issuedBook=db.session.query(Book_Catalogue).filter(Book_Catalogue.UserId==user.ID,Book_Catalogue.BookId==id,Book_Catalogue.Request==1).first()
        issuedBook.Request=-1
        issuedBook.ReturnDate=str(date.today())
        db.session.commit()
        return "",200
      
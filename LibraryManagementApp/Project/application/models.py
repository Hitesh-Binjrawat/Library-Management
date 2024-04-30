from .database import db

class User(db.Model):
    __tablename__="User"
    ID=db.Column(db.Integer,primary_key=True,autoincrement=True)
    Name=db.Column(db.String,nullable=False)
    UserName=db.Column(db.String,nullable=False,unique=True)
    Role=db.Column(db.Integer)
    Email=db.Column(db.String,nullable=False,unique=True)
    Password=db.Column(db.String,nullable=False)
    Visited=db.Column(db.Integer,nullable=True)

class Section(db.Model):
    ID=db.Column(db.Integer,primary_key=True,autoincrement=True)
    Name=db.Column(db.String,nullable=False)
    DateCreated=db.Column(db.String,nullable=False)
    Description=db.Column(db.String)


class Books(db.Model):
    __tablename__="Books"
    ID=db.Column(db.Integer,primary_key=True,autoincrement=True)
    Name=db.Column(db.String,nullable=False)
    Description=db.Column(db.String,nullable=False)
    Section=db.Column(db.String,nullable=False)
    Author=db.Column(db.String,nullable=False)
    Price=db.Column(db.Integer,nullable=False)
    Ratings=db.Column(db.Float,nullable=True)


class Book_Catalogue(db.Model):
    __tablename__="Book_Catalogue"
    ID=db.Column(db.Integer,primary_key=True,autoincrement=True)
    BookId=db.Column(db.Integer,db.ForeignKey('Books.ID'))
    UserId=db.Column(db.Integer,db.ForeignKey('User.ID'))
    IssueDate=db.Column(db.String,nullable=True)
    ReturnDate=db.Column(db.String,nullable=True)  
    Request=db.Column(db.Integer,nullable=False)
    LastDate=db.Column(db.String,nullable=True)
    

    
const store=new Vuex.Store({
    state:{
        loggedIn:false,
        userName:"",
        role:"",
        password:""
    },
    getters:{
        getUserName: function(state){
            return state.userName
        },
        getRole:function(state){
            return state.role
        },
        getLoggedIn:function(state){
            return state.loggedIn
        },
        getPassword:function(state){
            return state.password
        }

    },
    mutations:{
        assignUserName(state,UserName){
            state.loggedIn=true,
            state.userName=UserName
        },
        assignRole(state,role){
            state.role=role
        },
        logout(state){
            state.role="",
            state.userName="",
            state.loggedIn=false 
            console.log("Logout Successful")
            console.log(state.role,state.userName)  
        },
        assignPassword(state,password){
            state.password=password
        }

    }
})

const Home=Vue.component('home',{
    template:`
    <div>
    <div v-if="isLogged && role==0" style="padding-right: 10%;"  >
                <form class="d-flex" role="search">
                    <input class="form-control me-2" type="search" placeholder="Search" v-model="bookSearch" aria-label="Search">
                    <button class="btn btn-outline-primary" @click="search">Search</button>
                  </form>
    </div>

    <div  class="card" style="max-width: 18rem;"  v-if="!isLogged" >
  <div class="card-header bg-transparent border-success" ><h3>LIBRARY MANAGMENT APP</h3></div>
  <div class="card-body text-success">
    <h5 class="card-title">Welcome to Our Library</h5>
    <p class="card-text">We are the best at providing books.</p>
  </div>
  <div class="card-footer bg-transparent border-success">Contact us nnnhkb@gmail.com</div>
</div>
<div v-if="isLogged && role==0" class="container fluid">
  <div class="row" v-for="book in books">
    <div class="col-sm-3 col-md-6 col-lg-4">
    <div class="testcard1"><img class="testimage" :src="'./static/'+book.ID+'.jpeg'"></div>
    </div>
    <div class="col-sm-9 col-md-6 col-lg-8" >
        <div class="testcard2">
        <p><h3 style="text-align:center">{book["Name"]}</h3></p>
        <p><h5>{book["Description"]}</h5></p>
        <p><h5>Book written by {book["Author"]}</h5></p>
        <p><h5>Ratings {book["Ratings"]}</h5></p>
        <p><button type="button" class="btn btn-warning" @click="RequestAccess(book.ID)">Request Access</button></p>
        <p><strong>Price ₹{book["Price"]}</strong></p>
        </div>
    </div>
  </div>
</div>
  <div class="card-header bg-transparent border-success"  v-if="isLogged && role==1">
  <table class="table">
  <thead>
    <tr>
      <th scope="col">UserId</th>
      <th scope="col">BookId</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="item in requested">
      <td>{item["UserName"]}</td>
      <td>{item["BookName"]}</td>
      <td><button type="button" class="btn btn-success" @click="allowAccess(item['ID'])">Allow</button> <button type="button" class="btn btn-danger" @click="rejectAccess(item['ID'])">Reject</button></td>
    </tr>
  </tbody>
</table>
  </div>
  </div>
    `,
    data:function(){
        return{
            isLogged:store.getters.getloggedIn,
            userName:store.getters.getUserName,
            role:store.getters.getRole,
            books:[],
            requested:[],
            bookSearch:""
        }
    },
    delimiters:["{","}"],
   async created(){
        this.isLogged=store.getters.getLoggedIn
        this.userName=store.getters.getUserName,
        this.role=store.getters.getRole
        if (this.role==0){
            const path="/allbooks"
            const res=await fetch(path,{
                method:"GET",
                // headers:{
                //     Authorization:'Bearer '+localStorage.getItem("auth")
                // }
            })
            this.books=await res.json()
        }
        else{
            const path="/allow_access"
            const res=await fetch(path,{
                method:"GET"
            })
            if (res.status==200){
                this.requested=await res.json()
            }
            else{
                alert("Sorry Something went wrong")
            }
        }
        },
        methods:{
            async RequestAccess(bookId){
                userName=store.getters.getUserName
                const path="/request/"+userName+"/"+bookId
                const res=await fetch(path,{
                    method:"GET"
                })
                if (res.status==200){
                    alert("OK")
                }
                else if(res.status==409){
                    alert("This books is already been requested or You already have access to this book")
                } 
            },
            async search(){
                const path="/api/search/books/"+this.bookSearch
                const res=await fetch(path,{
                method:"GET",
                })
            if (res.status==200){
                this.books=await res.json()
            }
            else{
                alert("something wnet wrong")
            }
            
            },
            async allowAccess(id){
                const path="/allow_access/"+id
                res=await fetch(path,{
                    method:"PUT",
                    headers:{
                        'Content-Type':'application/json',
                    }
                })
                if(res.status==200){
                    location.reload()
                }
                else if(res.status==429){
                    alert("User has already reached the Maximum Limit")
                }
                else{
                    alert("OOPs SOmething went wrong")
                }  
            },
            async rejectAccess(id){
                console.log(id)
                const path="/allow_access/"+id
                res=await fetch(path,{
                    method:"Delete",
                    headers:{
                        'Content-Type':'application/json',
                    }
                })
                if(res.status==200){
                    location.reload()
                }
                else{
                    alert("Something went wrong")
                }
            }
        }
})
const ebookStatus = Vue.component('ebook-Status',{
    template:`
    <div>
        
    <table class="table table-striped table-hove">
    <thead>
      <tr>
        <th scope="col">UserName</th>
        <th scope="col">BookName</th>
        <th scope="col">Issue Date</th>
        <th scope="col">Last Date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="i in userStatus">
        <td>{i[0]}</th>
        <td>{i[1]}</td>
        <td>{i[2]}</td>
        <td>{i[3]}</td>
      </tr>
    </tbody>
  </table>
    <div>
        <img src="./static/Staus.jpg">
    </div>
    </div>
    `,
    data: function(){
        return{
            userStatus:[]
        }
    },
    delimiters:["{","}"],
    async created(){
        const path="/book_status"
        res = await fetch(path,{
            method:"GET"
        })
        if (res.status==200){
            this.userStatus= await res.json()
        }
        else{
            alert("Something went wrong")
        }
    }
})
const requested=Vue.component('Requested',{template:`
<div class="container fluid">
    <div class="row" v-for="book in books">
        <div class="col-sm-3 col-md-6 col-lg-4">
            <div class="testcard1"><img class="testimage" :src="'./static/'+book.ID+'.jpeg'"></div>
        </div>
    <div class="col-sm-9 col-md-6 col-lg-8" >
        <div class="testcard2">
            <p><h3 style="text-align:center">{book["Name"]}</h3></p>
            <p><h5>{book["Description"]}</h5></p>
            <p><h5>Book written by {book["Author"]}</h5></p>
            <p><button type="button" class="btn btn-danger" @click="Cancel(book['ID'])">Cancel Request</button></p>
            <p><strong>Price ₹{book["Price"]}</strong></p>
        </div>
    </div>
</div>
</div>
`,
data: function(){
    return{
    userName:store.getters.getUserName,
    books:[]
    }
},
delimiters:["{","}"],
methods:{
    async Cancel(id){
        const path="/requested_books/"+this.userName+"/"+id
        const res=await fetch(path,{
            method:"DELETE",
            headers:{
                'Content-Type':'application/json',
            }
        })
        if (res.status==200){
            alert("Request Is Cancelled")
            location.reload()
        }
        else{
            alert("Sorry Something went wrong")
        }

    } 
},
async created(){
    const path="/requested_books/"+this.userName
    const res=await fetch(path,{
        method:"GET"
    })
    if (res.status==200){
        this.books= await res.json()
    }
    else{
        alert("Something went wrong in Acessing")
    }
}
})

const viewBook=Vue.component('ViewBook',{
    template:`
<div >

    <p id="pdf-container"><button type="button" class="btn btn-warning" @click="View('book.ID')">View</button> </p> 
    <p><button type="button" class="btn btn-success" @click="Ratings">Feedback</button></p>
    <div class="card2" v-if="rating">
        <form>
            <div class="pad">
            <label>Rate this book out of 5</label>
            <input required v-model="stars" type="number" min=0 max=5>
            </div>

            <div class="pad">
                <button type="submit" @click="submitRatings">Submit</button>
            </div>

        </form>
    </div>
</div>

    `,
    data:function(){
        return{
            view:false,
            rating:false,
            stars:""
        }
    },      
    delimiters:["{","}"],
    props:{
        book:Object
    },
    methods:{
        async View(){
            router.push('/pdf-view/'+this.book.ID)
            this.view=!this.view
        },
        Ratings(){
            this.rating=!this.rating
        },
        async submitRatings(){
            const path="/ratings/"+this.book.ID+"/"+this.stars
            res =await fetch(path,{
                method:"GET",
            })
            if (res.status==200){
                alert("Thank you For your Response")
                this.rating=!this.rating
            }
        }
    }

})
const pdf=Vue.component('PDF',{template:`
<div  oncontextmenu="return false;">
    <object oncontextmenu="return false;" :data="'./static/'+book+'.pdf#zoom=85&scrollbar=0&toolbar=0&navpanes=0'" type="application/pdf" width="100%" height="650" style="pointer-events: none;">
    <p>Alternative text - include a link <a :href="'./static/'+book+'.pdf'">to the PDF!</a></p>
    </object>
</div>
`,
delimiters:["{","}"],
data:function(){
        return{
            book:this.$route.params['id']
        }
    }
})
const myBooks=Vue.component('MyBooks',{template:`
<div class="container fluid">
    <div class="row" v-for="book in books">
        <div class="col-sm-3 col-md-6 col-lg-4">
            <div class="testcard1"><img class="testimage" :src="'./static/'+book.ID+'.jpeg'"></div>
        </div>
    <div class="col-sm-9 col-md-6 col-lg-8" >
        <div class="testcard2">
            <p><h3 style="text-align:center">{book["Name"]}</h3></p>
            <p><h5>{book["Description"]}</h5></p>
            <p><h5>Book written by {book["Author"]}</h5></p>
            <p><ViewBook :book='book' :data='book'></ViewBook> <button type="button" class="btn btn-danger" @click="returnBook(book['ID'])">Return</button></p>
            <p><strong>Price ₹{book["Price"]}</strong></p>
        </div> 
    </div>
</div>
</div>
`,
data:function(){
    return{
    userName:store.getters.getUserName,
    books:[]
    }
},
delimiters:["{","}"],
async created(){
    const path="/my_books/"+this.userName
    const res=await fetch(path,{
        method:"GET"
    })
    if (res.status==200){
        this.books= await res.json()
    }
    else{
        alert("Something went wrong in Acessing")
    }
},
methods:{
    async returnBook(id){
        const path="/my_books/"+this.userName+"/"+id
        const res=await fetch(path,{
            method:"PUT",
            headers:{
                'Content-Type':'application/json',
            }
        })
        if (res.status==200){
            alert("Book successfully Returned")
            location.reload()
        }
        else{
            alert("Sorry Something went wrong")
        }
    }
    // View(){
    //     this.view=!this.view
    // }
}
})

// show requested in one side and to be revoked from other side 

const profile=Vue.component('profile',{template:`
<div  class="card" style="max-width: 18rem;">

    Name={UserData.UserName}</br>
    UserName={UserData.Name}</br>
    Email={UserData.Email}</br>


</div>
`,
data:function(){
    return{
        userName:store.getters.getUserName,
        password:store.getters.getPassword,
        UserData:""
    }
},
async created(){
    path="/api/user/"+this.userName+"/"+this.password
    res=await fetch(path,{
        method:"GET"
    })
    if (res.status==200){
        this.UserData=await res.json()
    }
    else{
        alert("there was something wrong ")
    }
},
delimiters:["{","}"]
})
const signUp=Vue.component('sign',{
    template:`
    
    <div class="card">
    {message}
    <img class="image" src="/static/images.jpeg" alt="sorry">
    <form >
    <div class="pad">
        <label>Enter Name:</label>
        <input v-model="Name" >
    </div>
    <div class="pad">
        <label >Enter user_name</label>
        <input v-model="UserName">
    </div>
    <div class="pad">
        <label>Enter Email ID</label>
        <input v-model="Email">
    </div>
    
    <div>
        <label >create a password</label>
        <input v-model="Password">
    </div>
    <div class="pad">
        <button type="submit" @click="sign()">Submit</button>
    </div>
        </form>  
    </div>
    `,
    data:function(){
        return{
            message:"",
            Name:"",
            UserName:"",
            Email:"",
            Password:""
        }
    },
    delimiters:["{","}"],
    methods:{
            async sign(){
                const Path="/api/user"
                fetch(Path,{
                    method:"POST",
                    headers:{
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify({
                        Name:this.Name,
                        UserName:this.UserName,
                        Email:this.Email,
                        Password:this.Password
                    })
                })
                .then(response=>response.json())
                .then(data=>{
                    console.log(data+"dsfbhr")
                    console.log("sjfbhjg")
                    // this.$emit("LoggedIn")
                    //looged in is a event handling event by calling method 
                })
            }
        }
    }
)
const loginForm=Vue.component('login',{template:`<div class="card">
        {message}</br>
        <img class="image" src="/static/images.jpeg " alt="sorry">
        <form onsubmit="return false" >
        <h1>Login</h1>
        <div class="pad">
            <label for="name">User Name</label>
            <input  type="text" v-model="userName" >
        </div>
        <div class="pad">
            <label for="username">Password</label>
            <input type="text" v-model="password">
        </div>
        <div class="pad">
            <button type="submit" @click="login()">Submit</button>
        </div>
        </form>
    </div>`,
    data: function(){
        return{
            message:"",
            userName:"",
            password:"" 
        } 
    },
    delimiters:['{', '}'],
    methods:{
        async login(){
            const Path="/login"
            const res= await fetch(Path,{
                method:"POST",
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({
                    UserName:this.userName,
                    Password:this.password
                })
            })
            if (res.status==200){
                const data=await res.json()
                localStorage.setItem("auth",data["auth"])
                localStorage.setItem("role",data["Role"])
                localStorage.setItem("userName",data["UserName"])
                localStorage.setItem("loggedIn",true)
                console.log(data["Role"])
                this.$store.commit("assignUserName",data["UserName"])
                this.$store.commit("assignRole",data["Role"])
                this.$store.commit("assignPassword",this.password)
                router.push('/').catch(err => {})
            }
            else if(res.status==404){
                this.message="User not found "
            }
        }
    },
})
const Section =Vue.component("sect",{
    data:
        function(){
            return{
                sections:[],
                onUpdateButton:false,
                add:false,
                newSectionName:"",
                newDescription:"",
                role:localStorage.getItem("role")
            }
    },
    methods:{
        changeAdd(){
            this.add=!this.add
        },
        async addSection(){
            console.log(localStorage.getItem("auth"))
            path="/api/section"
            res=await fetch(path,{
                method:"POST",
                headers:{
                    'Content-Type':'application/json',
                    Authorization:"Bearer "+localStorage.getItem("auth")
                },
                body:JSON.stringify({
                    Name:this.newSectionName,
                    Description:this.newDescription
                })
            })
            if(res.status==200){
                alert("Added Successfully")
                location.reload()
            }
            else{
                alert("could not be added")
            }
        }
    },
    template:`
<div/>

    <div v-if="role===0">
    <div  class="card" style="max-width:18rem;display:flex;" v-for="section in sections" >
    <div class="card-header bg-transparent border-success" ><h3>{section["Name"]}</h3></div>
    <div class="card-body text-success">
      <h5 class="card-title"></h5>
      <p class="card-text">{section["Description"]}
    </p>
    </div>
    <div class="card-footer bg-transparent border-success">
    <customButtons :section='section' :data="section"></customButtons>
    </div>
  </div>
  <div v-if="add" class="card" style="display:flex">
  <form>
    <div class="pad">
            <label for="newSectionName">Section Name</label>
            <input  type="text" v-model="newSectionName" >
        </div>
        <div class="pad">
            <label for="newDescription">Password</label>
            <input type="text" v-model="newDescription">
        </div>
        <div class="pad">
            <button type="submit" @click="addSection()">Submit</button>
        </div>
  </form>
  </div >
  <button class="addButton" style="display:flex" @click="changeAdd">Add+</button>
  </div>

  <div v-else>
    <h5> You are not allowed </h5>
  </div>

</div>
    `
    ,
    delimiters:["{","}"],
    async created(){
        if(this.role==1){
        const path="/api/allSection"
        const res=await fetch(path,{
            method:"GET",
            headers:{
                Authorization:'Bearer '+localStorage.getItem("auth")
            }
        })
        this.sections=await res.json()
    }
    else{

        alert("You are not allowed to acess")
        
    }
},
// beforeCreate(){
//     if(localStorage.getItem("role")==0){
//         alert("Not allowed to access")
//         return false
//     }
// }
})
Vue.component("customButtons",{
    data:
        function(){
            return{
                onUpdateButton:false,
                message:""
            }
    },
    delimiters:['{','}'],
    props:{
        section:Object},
    template:`<div>
    <button type="button" class="btn btn-success" v-on:click="onUpdateButton=!onUpdateButton">Update</button>
    <button type="button" class="btn btn-info" @click="books()">Books</button>
    <button type="button" class="btn btn-danger" @click="deleteSection()">Delete</button>
    
    <div v-if="onUpdateButton">
    <form >
        <div class="pad">
            <label for="name">Name</label>
            <input  type="text" v-model="section.Name" >
        </div>
        <div class="pad">
            <label for="description">Description</label>
            <input type="text" v-model="section.Description">
        </div>
        <div class="pad">
            <button type="submit" @click="sectionUpdate()">Submit</button>
        </div>
        </form>
    </div>
    </div>
    `,
    methods:{
        changeUpdate(){
            this.onUpdateButton=!this.onUpdateButton
        },
        async sectionUpdate(){
            if(this.section.Name=="" || this.section.Description==""){
                alert("Name or description cannot be Empty")
                return 
            }
            const path="/api/section/"+this.section.ID
            res=await fetch(path,{
                method:"PUT",
                headers:{
                    'Content-Type':'application/json',
                    Authorization:"Bearer "+localStorage.getItem("auth")
                },
                body:JSON.stringify({
                    Name:this.section.Name,
                    Description:this.section.Description
                })
            })
            console.log(res.status)
            if(res.status==200){
                alert("It is updated successfully")
                this.onUpdateButton=!this.onUpdateButton
                
            }  
            else{
                alert("Sorry could not be updated"+this.section.ID)
            }        
        },
        async deleteSection(){
            console.log("Hello")
            if(confirm("All the books from the section will be deleted also")==true){
                const path="/api/section/"+this.section.ID 
                res=await fetch(path,{
                    method:"DELETE",
                    headers:{
                        Authorization:"Bearer "+localStorage.getItem("auth")
                    }
                })
                if(res.status==200){
                    location.reload()
                    
                }
                else{
                    alert("Could not be delted due to some reasons")
                }
            }
            else{
                return
            }
    },
    books(){
        this.$router.push("/section/books/"+this.section.ID)
    }
    }
})

const books=Vue.component("books-page",{
    data:
     function(){
        return{
        bookItems:[],
        add:false,
        Name:"",
        Description:"",
        Author:"",
        Price:"",
        FILE1:null,
        FILE2:null
        }
    },
    delimiters:["{","}"],
    template:`
    <div>
    <div v-if="bookItems.length !== undefined">
        <div class="card" style="max-width:18rem;display:flex;" v-for="book in bookItems" >
        
        <div class="card-header bg-transparent border-success"><h3>{book["Name"]}</h3></div>
        <div class="card-body text-success">
        <h5 class="card-title"> <img class="image" :src="'./static/'+book.ID+'.jpeg'"></h5>
        <p class="card-text">{book["Description"]}</p>
        <p class="card-text"><b>Author:</b>{book["Author"]}</p>
        
        </div>
            <booksButton :book='book' :data="book"></booksButton>
        </div>
    </div>

    <div v-if="add" class="card">
        <h4>Add A Book</h4>
        <form enctype='multipart/form-data'>
        <div class="pad">
            <label for="name">Name</label>
            <input  type="text" v-model="Name" >
        </div>

        <div class="pad">
            <label for="Description">Description</label>
            <input  type="text" v-model="Description" >
        </div>

        <div class="pad">
            <label for="Author">Author</label>
            <input  type="text" v-model="Author">
        </div>

        <div class="pad">
            <label for="Price">Price</label>
            <input  type="number" v-model="Price" >
        </div>
        
        <div class="pad">
            <label for="FrontPage">FrontPage</label>
            <input type="file" @change="onFileUpload1">
        </div>

        <div class="pad">
            <label for="Content">Content</label>
            <input type="file" @change="onFileUpload2">
        </div>

        <div class="pad">
        <button v-on:click="addBook">Submit</button>
        </div>
        </form>
    </div>

    <button class="addButton" style="display:flex" @click="add=!add">Add+</button>
    </div>
    `,
    // props:{
    //     sectionId:String
    // },
    async created(){
        const id=this.$route.params["id"]
        res=await fetch("/api/section/books/"+id)
        if (res.status==200){
            this.bookItems=await res.json()
        }
        else if (res.status==404){
            this.message="Do not have books for this section"
        }
        else{
            alert( "something went wrong")
        }
    },
    methods:{
        onFileUpload1 (event) {
            this.FILE1 = event.target.files[0]
        },
        onFileUpload2 (event) {
            this.FILE2 = event.target.files[0]
        },
        async addBook(){
            const id=this.$route.params["id"]
            var data=new FormData()
            data.append('Name',this.Name)
            data.append('Description',this.Description)
            data.append('Section',id)
            data.append('Author',this.Author)
            data.append('Price',this.Price)
            data.append('FrontPage',this.FILE1)
            data.append('Content',this.FILE2)
            res =await fetch("/books",{
                method:'POST',
                // headers:{ 
                // //     // Authorization:"Bearer "+localStorage.getItem("auth")
                // },
                body: data
            })
            // res=await axios.post('/books', this.data)
            if (res.status==200){
                alert("Successfully Added")
                location.reload()
            }
            else if(res.status==500){
                alert("Sorry ther was some error")
            }
            else{
                alert("Sorry ther was some error")  
            }
            
        }
        

    }
})
Vue.component("booksButton",{
    data:
        function(){
            return{
                onUpdateButton:false,
                message:"",
                FILE1:null,
                FILE2:null
            }
    },
    delimiters:['{','}'],
    props:{
        book:Object},
    template:`<div>
    <button type="button" class="btn btn-success" v-on:click="onUpdateButton=!onUpdateButton">Update</button>
    <button type="button" class="btn btn-danger" @click="deleteBook()">Delete</button>
    
    <div v-if="onUpdateButton">
    <form >
        <div class="pad">
            <label for="name">Name</label>
            <input  type="text" v-model="book.Name" >
        </div>
        <div class="pad">
            <label for="description">Description</label>
            <input type="text" v-model="book.Description">
        </div>

        <div class="pad">
        <label for="author">Author</label>
        <input type="text" v-model="book.Author">
        </div>

        <div class="pad">
            <label for="price">Price</label>
            <input type="number" v-model="book.Price">
        </div>

        <div class="pad">
            <label for="FrontPage">FrontPage</label>
            <input type="file" @change="onFileUpload1" required/>
        </div>

        <div class="pad">
            <label for="Content">Content</label>
            <input type="file"  @change="onFileUpload2" required/>
        </div>


        <div class="pad">
            <button type="submit" @click="bookUpdate()">Submit</button>
        </div>
        </form>
    </div>
    </div>
    `,
    methods:{
        onFileUpload1 (event) {
            this.FILE1 = event.target.files[0]
        },
        onFileUpload2 (event) {
            this.FILE2 = event.target.files[0]
        },
        async bookUpdate(){
            if(this.book.Name=="" || this.book.Description=="" || this.book.Price==""||this.book.Content=="",this.book.Author==""){
                alert("Name or description or author price cannot be Empty")
                return 
            }
            const path="/books"
            data=new FormData()
            data.append("ID",this.book.ID)
            data.append('Name',this.book.Name)
            data.append('Description',this.book.Description)
            data.append('Author',this.book.Author)
            data.append('Price',this.book.Price)
            if(this.FILE1==null || this.FILE2==null){
                alert("Plz select a file")
                return 
            }
            data.append('FrontPage',this.FILE1)
            data.append('Content',this.FILE2)
            
            res=await fetch(path,{
                method:"PUT",
                // headers:{
                //     'Content-Type':'application/json',
                //     // Authorization:"Bearer "+localStorage.getItem("auth")
                // },
                body:data
            })
            console.log(res.status)
            if(res.status==200){
                alert("It is updated successfully")
                this.onUpdateButton=!this.onUpdateButton
                
            }  
            else{
                alert("Sorry could not be updated"+this.book.ID)
            }        
        },
        async deleteBook(){
            if(confirm("Are you sure you want to delete")){
                path="/books"
                data=new FormData()
                data.append("ID",this.book.ID)
                res=await fetch(path,{
                    method:"DELETE",
                    // headers:{
                    //     'Content-Type':'application/json',
                    //     // Authorization:"Bearer "+localStorage.getItem("auth")
                    // },
                    body:data
                })
                console.log(res.status)
                if(res.status==200){
                    alert("Delted Successfully")
                    location.reload()
                    
                }  
                else{
                    alert("Sorry there was some error"+this.book.ID)
                }  
                
            }
            else{
                alert("Delete request is Cancelled")
            }

        }
        }
    })

const routes=[
    {
        path:"/",
        component:Home
    },
    {
        path:"/login",
        component:loginForm
    },
    {
        path:'/signUp',
        component:signUp
    },
    {
        path:"/profile",
        component:profile
    },
    {
        path:"/section",
        component:Section
    },
    {
        path:"/section/books/:id",
        component:books
    },
    {
        path:"/requested/books",
        component:requested
    },
    {
        path:"/my/books",
        component:myBooks
    },
    {
        path:'/book-status',
        component:ebookStatus
    },
    {
        path:'/pdf-view/:id',
        component:pdf
    }
]
const router=new VueRouter({
    routes
})
var app=new Vue({
    el:'#app',
    data:{
        book:"",
        books:[]
    },
    router:router,
    store:store,
    delimiters:['{','}'],
    computed:{
        loggedIn:function(){
            return store.getters.getLoggedIn
        },
        userName:function(){
            return store.getters.getUserName
        },
        role:function(){
            return store.getters.getRole
        }
    },
    created(){
        if(localStorage.getItem("role")){
            this.$store.commit("assignRole",localStorage.getItem("role"))
            this.$store.commit("assignUserName",localStorage.getItem("userName"))
        }
    },
    methods:{
        logout(){
            localStorage.removeItem('auth')
            this.$store.commit("logout")
            this.$router.push("/login").catch(()=>{})
            // location.reload()
        },
        async search(){
            path="/api/search/book/"+this.book
            res=await fetch(path,{
                method:"GET",
                headers:{
                    Authorization:localStorage.getItem("auth")
                }
            })
            if (res.status==200){
                this.books=await res.json()
            }
            else{
                alert("Something went Wrong")
            } 
        }
    }
})


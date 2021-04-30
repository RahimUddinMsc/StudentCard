let dataController = (() => {
  
    let userList = []
    let selectID = 0
    
    //custom class obj to have only neccessary info
    class User {
        constructor(data){
            this.IDSetup(data.id);
            this.name = data.name;
            this.courseSetup(data.course_title);  
            this.statusSetup(data.status);
            this.email = data.email;
            this.tel = data.telephone;
        }
        
        
        //error handle (originally used studentID)
        IDSetup(id){
            id ? this.id = id : this.id = 'n/a'
        }
        
        //account for query, course, no course
        courseSetup(title){
            let course = 'No current courses'
            let split = title.split('/')
            if(title !== ''){
                course = title
                if(split.length > 2){                    
                    course = "Currently Querying"
                }else{
                    course = title                    
                }                                
            }
            this.course = course
        }
        
        //More frendly wording where required
        statusSetup(stat){            
            stat.toLowerCase() === 'dead' ? this.status = 'Incomplete' : this.status = stat            
        }            
    }
    
    // loop throgh json create custom obj and push to new list
    let setupUsers = (arr) => {        
        console.log(arr)
        for(let i = 0; i < arr.length; i++){
            userList.push(new User(arr[i]))
        }        
    }
    
    //ensures no array out of bounds error (used to track which user will be displayed on btn select)
    let updateSelection = (dir) => {
        if(isNaN(selectID)){
            selectID = 0;
        }
        selectID += dir;
        if(selectID === -1){
            selectID = 19
        }        
        if(selectID === 20){
            selectID=0   
        }        
    }
        
    return {                    
        //getters
        generateUsers: (arr) => setupUsers(arr),
        getUserList: () => userList,        
        getUserSelectID: () => selectID,
        getUserObjFromID:() => userList[selectID],
        
        //actions
        setUserSelectID: (dir) => updateSelection(dir),             
    }
    
})();


let viewController = (() => {
    
    //ref points for important classes
    let DOMStrings = {
        loader:".page-load-transition",
        loadComplete:"load-complete-transition",
        cardTop:".student-card-top",
        cardBot:".student-card-bot",
        cardTransition:"card-load-animation",
        expandableBanner: ".expandable-bannner-block",
        expandCourseCls:"expand-course-block",
        expandPhotoCls:"expand-photo-block",
        courseExpandBtn:".course-banner-action",
        courseBanner:"student-current-course",
        photoBanner:"student-photo-col",        
        studentToggle:".select-student-btn",
        studentName:".student-name-heading",
        studentID:".info-student-id",
        studentStatus:".course-status-detail",
        studentEmail:".student-about-email",
        studentTel:".student-about-tel",
        studentCourse:".banner-course-name"
        
    }
        
    //function find out which div action btn is attached to and toggle the open class
    let expandDiv = (btn,banner) => {        
        let clsExpand = "";
        banner.classList.contains(DOMStrings.courseBanner) ? clsExpand = DOMStrings.expandCourseCls : clsExpand = DOMStrings.expandPhotoCls;        
        banner.classList.toggle(clsExpand);        
        banner.classList.contains(clsExpand) ? btn.textContent = "-" : btn.textContent = "+";    
    }    
        
    //update card information
    let updateDiv = (data) => {                
        //setup transition (removed in controller for replay)
        document.querySelector(DOMStrings.cardTop).classList.add(DOMStrings.cardTransition)
        document.querySelector(DOMStrings.cardBot).classList.add(DOMStrings.cardTransition)
                
        //update content
        document.querySelector(DOMStrings.studentName).textContent = data.name;
        document.querySelector(DOMStrings.studentID).textContent = "ID: " + data.id;
        document.querySelector(DOMStrings.studentStatus).textContent = data.status;
        document.querySelector(DOMStrings.studentEmail).textContent = "Email: " + data.email;
        document.querySelector(DOMStrings.studentTel).textContent = "Tel: " + data.tel;        
        document.querySelector(DOMStrings.studentCourse).textContent = data.course;                
    }
        
    return{              
        //getters
        getDomStrings: () => DOMStrings,        

        //actions
        openDiv: (btn,banner) => expandDiv(btn,banner),        
        updateCard: (data) => updateDiv(data),
        loadComplete: () => {
            document.querySelector(DOMStrings.loader).classList.add(DOMStrings.loadComplete);
        }    
    }
    
})();


let controller = ((dataCtrl,viewCtrl) => {
    
    //get all relevant class names
    let domStrings = viewCtrl.getDomStrings()
            
    let setupListeners = () => {
        //loop through all the action buttons and trigger expand function for relevant div    
        document.querySelectorAll(domStrings.courseExpandBtn).forEach((el) =>{
            el.addEventListener('click',(e) => viewCtrl.openDiv(e.target,e.target.parentElement))
        })

        // next/prev student select button (data atr used to determine direction)
        document.querySelectorAll(domStrings.studentToggle).forEach((el) => {
            el.addEventListener('click',(e) => {
                dataCtrl.setUserSelectID(parseInt(e.target.dataset.dir));
                viewCtrl.updateCard(dataCtrl.getUserObjFromID())
            })
        })    
        
        //remove animation so can be added again on next/prev btn click
        document.querySelector(domStrings.cardTop).onanimationend = (el) => {
            document.querySelector(domStrings.cardTop).classList.remove(domStrings.cardTransition)
            document.querySelector(domStrings.cardBot).classList.remove(domStrings.cardTransition)
        }
    }        
    
    //Call data end point and initialize card data
    let init = (url) => {
        fetch(url)
          .then(response => response.json())
          .then(data => dataCtrl.generateUsers(data))
          .then(() => {
                setupListeners();
                viewCtrl.loadComplete();
                console.log(dataCtrl.getUserList())
           });            
    }
        
    return{
        initialize: (url) => init(url)
    }
  
})(dataController,viewController);

//change url for different data end point
controller.initialize('http://leads.beta.openstudycollege.info/getTopLeads')
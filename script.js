/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Production Ready Frontend Structure
 Part 1/4
====================================================
*/

"use strict";



/* =========================================
   GLOBAL CONFIGURATION
========================================= */


const SYRICOIN_CONFIG = {

    appName: "SyriCoin",

    version: "V1",

    pointsToSYP: 1,

    minimumWithdrawalSYP: 10000,

    currency: "SYP",

    storageKey: "syricoin_user_data",

    apiUrl: "",

    maxLocalBalance: 999999999

};





/* =========================================
   TELEGRAM INITIALIZATION
========================================= */


const TelegramApp = {

    instance:
    window.Telegram?.WebApp || null,


    init(){


        if(!this.instance){

            console.warn(
                "Telegram WebApp not detected"
            );

            return false;

        }


        try{


            this.instance.ready();


            this.instance.expand();


            return true;



        }catch(error){


            console.error(
                "Telegram Init Error:",
                error
            );


            return false;


        }


    },


    user(){


        return (
            this.instance
            ?.initDataUnsafe
            ?.user
        ) || null;


    }


};



TelegramApp.init();



const telegramUser =
TelegramApp.user();







/* =========================================
   APPLICATION STATE
========================================= */


const appState = {


    user:{


        id:
        telegramUser?.id || null,


        username:
        telegramUser?.username || "User",


        firstName:
        telegramUser?.first_name || "مستخدم"


    },



    balance:0,


    todayEarn:0,


    totalEarn:0,


    referrals:0,


    completedTasks:0,


    adsWatched:0,


    level:"Bronze",



    initialized:false



};









/* =========================================
   DOM HELPER
========================================= */


const $ = (id)=>{

    return document.getElementById(id);

};






const DOM = {


    username:
    $("username"),


    userAvatar:
    $("userAvatar"),


    balance:
    $("userBalance"),


    sypValue:
    $("sypValue"),


    todayEarn:
    $("todayEarn"),


    totalEarn:
    $("totalEarn"),


    referralCount:
    $("referralCount"),


    completedTasks:
    $("completedTasks"),


    userLevel:
    $("userLevel"),


    adsWatched:
    $("adsWatched"),


    withdrawBalance:
    $("withdrawBalance"),


    tasksContainer:
    $("tasksContainer")



};









/* =========================================
   DATA VALIDATION
========================================= */


function safeNumber(value){


    const number =
    Number(value);



    if(
        Number.isNaN(number) ||
        number < 0
    ){

        return 0;

    }


    return number;


}









function sanitizeText(value){


    if(
        typeof value !== "string"
    ){

        return "";

    }



    return value
    .trim()
    .replace(
        /[<>]/g,
        ""
    );


}









/* =========================================
   CURRENCY SYSTEM
========================================= */


function convertSCtoSYP(amount){


    return (
        safeNumber(amount)
        *
        SYRICOIN_CONFIG.pointsToSYP
    );


}







function convertSYPtoSC(amount){


    return (
        safeNumber(amount)
        /
        SYRICOIN_CONFIG.pointsToSYP
    );


}








/* =========================================
   USER LOADING
========================================= */


function loadTelegramUser(){


    if(!telegramUser){


        return;


    }




    appState.user.id =
    telegramUser.id || null;



    appState.user.username =
    telegramUser.username || "User";



    appState.user.firstName =
    telegramUser.first_name || "مستخدم";







    if(DOM.username){


        DOM.username.textContent =
        sanitizeText(
            appState.user.firstName
        );


    }


}








/* =========================================
   UI UPDATE ENGINE
========================================= */


function updateInterface(){



    if(DOM.balance){


        DOM.balance.textContent =
        safeNumber(
            appState.balance
        );


    }







    if(DOM.sypValue){


        DOM.sypValue.textContent =

        `${convertSCtoSYP(appState.balance)} ل.س`;


    }







    if(DOM.todayEarn){


        DOM.todayEarn.textContent =

        `+${safeNumber(appState.todayEarn)} SC`;


    }







    if(DOM.totalEarn){


        DOM.totalEarn.textContent =

        `${safeNumber(appState.totalEarn)} SC`;


    }







    if(DOM.referralCount){


        DOM.referralCount.textContent =

        safeNumber(appState.referrals);


    }







    if(DOM.completedTasks){


        DOM.completedTasks.textContent =

        safeNumber(appState.completedTasks);


    }







    if(DOM.userLevel){


        DOM.userLevel.textContent =

        appState.level;


    }







    if(DOM.adsWatched){


        DOM.adsWatched.textContent =

        safeNumber(appState.adsWatched);


    }







    if(DOM.withdrawBalance){


        DOM.withdrawBalance.textContent =

        safeNumber(appState.balance);


    }



}

/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Production Ready Frontend Structure
 Part 2/4
====================================================
*/



/* =========================================
   LOCAL STORAGE SYSTEM
========================================= */


function saveLocalData(){


    const data = {


        user:
        appState.user,


        balance:
        safeNumber(appState.balance),


        todayEarn:
        safeNumber(appState.todayEarn),


        totalEarn:
        safeNumber(appState.totalEarn),


        referrals:
        safeNumber(appState.referrals),


        completedTasks:
        safeNumber(appState.completedTasks),


        adsWatched:
        safeNumber(appState.adsWatched),


        level:
        appState.level


    };





    try{


        localStorage.setItem(

            SYRICOIN_CONFIG.storageKey,

            JSON.stringify(data)

        );



    }catch(error){


        console.error(

            "Storage Save Error:",
            error

        );


    }


}









function loadLocalData(){



    try{


        const savedData =

        localStorage.getItem(

            SYRICOIN_CONFIG.storageKey

        );





        if(!savedData){


            return;


        }







        const data =

        JSON.parse(savedData);







        if(typeof data !== "object"){

            return;

        }







        appState.balance =
        safeNumber(data.balance);



        appState.todayEarn =
        safeNumber(data.todayEarn);



        appState.totalEarn =
        safeNumber(data.totalEarn);



        appState.referrals =
        safeNumber(data.referrals);



        appState.completedTasks =
        safeNumber(data.completedTasks);



        appState.adsWatched =
        safeNumber(data.adsWatched);



        appState.level =
        sanitizeText(data.level)
        ||
        "Bronze";







        if(data.user){


            appState.user = {


                ...appState.user,


                ...data.user


            };


        }





    }catch(error){



        console.error(

            "Storage Load Error:",
            error

        );



    }


}









/* =========================================
   EVENT MANAGER
========================================= */


function setupEvents(){



    setupNavigation();


    setupTaskTabs();


    setupAds();


    setupWithdraw();


    setupNotifications();


}









/* =========================================
   BOTTOM NAVIGATION
========================================= */


function setupNavigation(){


    const navItems =

    document.querySelectorAll(

        ".nav-item"

    );





    if(!navItems.length){

        return;

    }








    const sections = {


        0:
        $("tasksSection"),


        1:
        $("tasksSection"),


        2:
        $("withdrawSection"),


        3:
        $("settingsSection")


    };








    navItems.forEach((item,index)=>{



        item.addEventListener(

            "click",

            ()=>{



                navItems.forEach(button=>{


                    button.classList.remove(

                        "active"

                    );


                });






                item.classList.add(

                    "active"

                );






                showSection(

                    sections[index]

                );



            }


        );



    });



}









/* =========================================
   SECTION CONTROLLER
========================================= */


function showSection(section){



    const allSections =

    document.querySelectorAll(

        ".content-section"

    );







    allSections.forEach(item=>{


        item.classList.add(

            "hidden"

        );


    });






    if(section){


        section.classList.remove(

            "hidden"

        );


    }



}









/* =========================================
   TASK TABS SYSTEM
========================================= */


function setupTaskTabs(){



    const tabs =

    document.querySelectorAll(

        ".tab-btn"

    );





    const lists =

    document.querySelectorAll(

        ".task-list"

    );






    if(!tabs.length){

        return;

    }








    tabs.forEach(tab=>{



        tab.addEventListener(

            "click",

            ()=>{



                const target =

                tab.dataset.tab;







                tabs.forEach(button=>{


                    button.classList.remove(

                        "active"

                    );


                });







                lists.forEach(list=>{


                    list.classList.remove(

                        "active"

                    );


                });







                tab.classList.add(

                    "active"

                );







                const activeList =

                $(target);






                if(activeList){


                    activeList.classList.add(

                        "active"

                    );


                }




            }


        );



    });



}









/* =========================================
   NOTIFICATION SYSTEM
========================================= */


function setupNotifications(){



    const button =

    $("notificationBtn");





    if(!button){

        return;

    }







    button.addEventListener(

        "click",

        ()=>{


            showNotification(

                "لا توجد إشعارات جديدة"

            );


        }


    );


}








function showNotification(message){


    alert(

        sanitizeText(message)

    );


}

/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Production Ready Frontend Structure
 Part 3/4
====================================================
*/



/* =========================================
   ADS SYSTEM
========================================= */


function setupAds(){


    const button =

    $("watchAdButton");





    if(!button){

        return;

    }







    button.addEventListener(

        "click",

        ()=>{


            startAdProcess();


        }


    );



}









async function startAdProcess(){



    try{



        const result =

        await API.startAd();






        if(!result.success){



            showNotification(

                "لا يوجد إعلان متاح حالياً"

            );


            return;


        }








        appState.adsWatched++;



        saveLocalData();



        updateInterface();







        showNotification(

            "تم بدء الإعلان"

        );





    }catch(error){



        console.error(

            "Ad Error:",
            error

        );



        showNotification(

            "حدث خطأ أثناء تحميل الإعلان"

        );



    }



}









/* =========================================
   WITHDRAW SYSTEM
========================================= */


function setupWithdraw(){



    const button =

    $("submitWithdraw");






    if(!button){

        return;

    }







    button.addEventListener(

        "click",

        ()=>{


            processWithdraw();


        }


    );



}









async function processWithdraw(){



    const amountInput =

    $("withdrawAmount");





    const methodInput =

    $("withdrawMethod");





    const phoneInput =

    $("withdrawPhone");








    if(
        !amountInput ||
        !methodInput ||
        !phoneInput
    ){

        return;

    }








    const amountSYP =

    safeNumber(

        amountInput.value

    );







    const method =

    sanitizeText(

        methodInput.value

    );







    const phone =

    sanitizeText(

        phoneInput.value

    );









    if(amountSYP <= 0){



        showNotification(

            "أدخل مبلغ صحيح"

        );


        return;


    }









    if(
        amountSYP <
        SYRICOIN_CONFIG.minimumWithdrawalSYP
    ){



        showNotification(

        `الحد الأدنى للسحب ${SYRICOIN_CONFIG.minimumWithdrawalSYP} ل.س`

        );


        return;


    }









    const amountSC =

    convertSYPtoSC(

        amountSYP

    );









    if(amountSC > appState.balance){



        showNotification(

            "الرصيد غير كافي"

        );


        return;


    }









    if(phone.length < 8){



        showNotification(

            "رقم الهاتف غير صحيح"

        );


        return;


    }









    const request = {


        userId:
        appState.user.id,


        amountSYP,


        amountSC,


        method,


        phone,


        createdAt:

        new Date()
        .toISOString()



    };








    try{



        const response =

        await API.sendWithdraw(

            request

        );







        if(response.success){



            appState.balance -= amountSC;



            saveLocalData();



            updateInterface();







            amountInput.value = "";


            phoneInput.value = "";








            showNotification(

                "تم إرسال طلب السحب بنجاح"

            );



        }



    }catch(error){



        console.error(

            "Withdraw Error:",
            error

        );



        showNotification(

            "فشل إرسال طلب السحب"

        );


    }




}









/* =========================================
   TASK SYSTEM
========================================= */


const taskManager = {



    tasks: [],





    async loadTasks(){



        try{



            const response =

            await API.getTasks();






            this.tasks =

            Array.isArray(response)

            ?

            response

            :

            [];






        }catch(error){



            console.error(

                "Tasks Error:",
                error

            );



            this.tasks = [];



        }







        renderTasks();



    }



};









function renderTasks(){



    if(!DOM.tasksContainer){

        return;

    }








    if(
        taskManager.tasks.length === 0
    ){



        DOM.tasksContainer.innerHTML = `


        <div class="empty-state">


            <div>

                📋

            </div>



            <h3>

                لا توجد مهام متاحة

            </h3>



            <p>

                سيتم تحديث المهام قريباً

            </p>



        </div>


        `;



        return;


    }









    DOM.tasksContainer.innerHTML = "";








    taskManager.tasks.forEach(task=>{



        const card =

        document.createElement(

            "div"

        );







        card.className =

        "task-card";








        card.innerHTML = `


            <h3>

                ${sanitizeText(task.title)}

            </h3>


            <p>

                ${safeNumber(task.reward)} SC

            </p>


            <button>

                تنفيذ

            </button>



        `;








        DOM.tasksContainer.appendChild(

            card

        );



    });



}









/* =========================================
   BALANCE CONTROL
========================================= */


function addBalance(amount){



    const value =

    safeNumber(amount);





    if(value <= 0){

        return;

    }








    appState.balance += value;


    appState.totalEarn += value;


    appState.todayEarn += value;







    saveLocalData();


    updateInterface();



}

/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Production Ready Frontend Structure
 Part 4/4
====================================================
*/



/* =========================================
   API CONNECTION LAYER
========================================= */


const API = {


    async getTasks(){


        /*
        
        جاهز مستقبلاً للربط مع:

        - Google Apps Script
        - Backend Server
        - CPA Networks
        - ADS API


        */


        return [];

    },







    async startAd(){


        /*
        
        مستقبلاً:

        هنا يتم استدعاء:

        ADSgram
        Ad Network API
        Rewarded Ads


        */



        return {


            success:true


        };


    },







    async sendWithdraw(request){



        /*
        
        البيانات التي سترسل للسيرفر:

        Telegram ID
        Amount SYP
        Amount SC
        Method
        Phone
        Date


        */



        console.log(

            "Withdraw Request:",

            request

        );





        /*
        
        حالياً نجاح تجريبي

        لاحقاً يتم استبداله
        برد السيرفر الحقيقي


        */



        return {


            success:true


        };



    }



};









/* =========================================
   APPLICATION START CONTROL
========================================= */


let applicationStarted = false;









async function startApplication(){



    if(applicationStarted){


        return;


    }






    applicationStarted = true;







    try{



        loadLocalData();



        loadTelegramUser();



        updateInterface();



        setupEvents();





        await taskManager.loadTasks();





        saveLocalData();






        console.log(

            "SyriCoin V1 Started Successfully"

        );






    }catch(error){



        console.error(

            "SyriCoin Start Error:",

            error

        );



    }



}









/* =========================================
   TELEGRAM MAIN BUTTON
========================================= */


function setupTelegram(){



    if(!TelegramApp.instance){


        return;


    }







    try{


        TelegramApp.instance.MainButton.hide();



    }catch(error){



        console.log(

            "Telegram Main Button unavailable"

        );



    }



}









/* =========================================
   GLOBAL ERROR PROTECTION
========================================= */


window.addEventListener(

    "error",

    (event)=>{


        console.error(

            "SyriCoin Runtime Error:",

            event.error

        );


    }


);








window.addEventListener(

    "unhandledrejection",

    (event)=>{


        console.error(

            "Unhandled Promise Error:",

            event.reason

        );


    }


);









/* =========================================
   AUTO SAVE
========================================= */


setInterval(

()=>{


    saveLocalData();


},

30000

);









/* =========================================
   APPLICATION BOOT
========================================= */


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        setupTelegram();


        startApplication();



    }


);








/*
====================================================
 END OF SyriCoin Telegram Mini App
 Frontend Engine V1
====================================================
*/

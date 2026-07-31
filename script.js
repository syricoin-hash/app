/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Clean Production Structure
 Part 1/4
====================================================
*/

"use strict";


/* =========================================
   GLOBAL CONFIGURATION
========================================= */

const SYRICOIN_CONFIG = {

    appName: "SyriCoin",

    pointsToSYP: 1,

    minimumWithdrawalSYP: 10000,

    currency: "SYP",

    storageKey: "syricoin_user_data",

    apiUrl: "",

};




/* =========================================
   TELEGRAM INITIALIZATION
========================================= */


const tg = window.Telegram?.WebApp || null;


if (tg) {

    tg.ready();

    tg.expand();

}



const telegramUser =
    tg?.initDataUnsafe?.user || null;





/* =========================================
   APPLICATION STATE
========================================= */


const appState = {

    user: {

        id:
        telegramUser?.id || null,


        username:
        telegramUser?.username || "User",


        firstName:
        telegramUser?.first_name || "مستخدم",


    },


    balance: 0,


    todayEarn: 0,


    totalEarn: 0,


    referrals: 0,


    completedTasks: 0,


    adsWatched: 0,


    level: "Bronze",


};







/* =========================================
   DOM HELPER
========================================= */


const $ = (id) =>
    document.getElementById(id);






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
    $("tasksContainer"),


};








/* =========================================
   SAFE UI UPDATE
========================================= */


function updateInterface(){


    if(DOM.username){

        DOM.username.textContent =
        appState.user.firstName;

    }



    if(DOM.balance){

        DOM.balance.textContent =
        appState.balance;

    }




    if(DOM.sypValue){

        DOM.sypValue.textContent =
        `${convertSCtoSYP(appState.balance)} ل.س`;

    }




    if(DOM.todayEarn){

        DOM.todayEarn.textContent =
        `+${appState.todayEarn} SC`;

    }





    if(DOM.totalEarn){

        DOM.totalEarn.textContent =
        `${appState.totalEarn} SC`;

    }





    if(DOM.referralCount){

        DOM.referralCount.textContent =
        appState.referrals;

    }





    if(DOM.completedTasks){

        DOM.completedTasks.textContent =
        appState.completedTasks;

    }





    if(DOM.userLevel){

        DOM.userLevel.textContent =
        appState.level;

    }





    if(DOM.adsWatched){

        DOM.adsWatched.textContent =
        appState.adsWatched;

    }





    if(DOM.withdrawBalance){

        DOM.withdrawBalance.textContent =
        appState.balance;

    }


}








/* =========================================
   CURRENCY SYSTEM
========================================= */


function convertSCtoSYP(amountSC){


    return amountSC *
    SYRICOIN_CONFIG.pointsToSYP;


}





function convertSYPtoSC(amountSYP){


    return amountSYP /
    SYRICOIN_CONFIG.pointsToSYP;


}







/* =========================================
   LOAD TELEGRAM USER
========================================= */


function loadTelegramUser(){


    if(!telegramUser){

        console.log(
            "Telegram data unavailable"
        );

        return;

    }




    if(DOM.username){

        DOM.username.textContent =

        telegramUser.first_name ||

        telegramUser.username ||

        "مستخدم SyriCoin";

    }


}







/* =========================================
   APPLICATION INIT
========================================= */


function initializeApp(){


    loadTelegramUser();


    loadLocalData();


    updateInterface();


    setupEvents();


}

/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Clean Production Structure
 Part 2/4
====================================================
*/



/* =========================================
   EVENTS SYSTEM
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
    document.querySelectorAll(".nav-item");



    const sections = {


        home:
        $("tasksSection"),


        tasks:
        $("tasksSection"),


        earnings:
        $("withdrawSection"),


        settings:
        $("settingsSection"),


    };




    if(!navItems.length){

        return;

    }






    navItems.forEach((item,index)=>{


        item.addEventListener(
            "click",
            ()=>{


                navItems.forEach(btn=>{

                    btn.classList.remove(
                        "active"
                    );

                });



                item.classList.add(
                    "active"
                );





                switch(index){


                    case 0:

                        showSection(
                            sections.home
                        );

                    break;



                    case 1:

                        showSection(
                            sections.tasks
                        );

                    break;



                    case 2:

                        showSection(
                            sections.earnings
                        );

                    break;



                    case 3:

                        showSection(
                            sections.settings
                        );

                    break;



                }



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
   TASK TABS
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





                tabs.forEach(btn=>{


                    btn.classList.remove(
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



    /*
    
    هنا سيتم لاحقاً ربط:

    ADSgram
    CPA Network
    Ad API
    Postback

    */



    appState.adsWatched++;



    saveLocalData();


    updateInterface();





    alert(
        "سيتم تحميل الإعلان..."
    );



}









/* =========================================
   NOTIFICATIONS SYSTEM
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


            alert(
                "لا توجد إشعارات جديدة"
            );


        }
    );



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
    Number(
        amountInput.value
    );





    const method =
    methodInput.value;





    const phone =
    phoneInput.value.trim();









    if(!amountSYP || amountSYP <= 0){


        alert(
            "أدخل مبلغ صحيح"
        );


        return;

    }









    if(
        amountSYP <
        SYRICOIN_CONFIG.minimumWithdrawalSYP
    ){


        alert(
            `الحد الأدنى للسحب ${SYRICOIN_CONFIG.minimumWithdrawalSYP} ل.س`
        );


        return;

    }









    const amountSC =
    convertSYPtoSC(
        amountSYP
    );








    if(amountSC > appState.balance){


        alert(
            "رصيد SC غير كافي"
        );


        return;

    }








    if(phone.length < 8){


        alert(
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


        date:
        new Date().toISOString(),


    };







    const result =
    await API.sendWithdraw(
        request
    );






    if(result.success){


        appState.balance -= amountSC;


        updateInterface();


        saveLocalData();




        alert(
            "تم إرسال طلب السحب بنجاح"
        );



        amountInput.value = "";


        phoneInput.value = "";



    }



}

/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Clean Production Structure
 Part 3/4
====================================================
*/



/* =========================================
   TASK SYSTEM
========================================= */


const taskManager = {


    tasks: [],



    async loadTasks(){


        try{


            this.tasks =
            await API.getTasks();



        }catch(error){


            console.error(
                "Tasks Loading Error:",
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
        !taskManager.tasks ||
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
                    سيتم تحديث المهام تلقائياً
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
                ${task.title}
            </h3>


            <p>
                ${task.reward} SC
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
   BALANCE SYSTEM
========================================= */


function addBalance(amountSC){



    const amount =
    Number(amountSC);





    if(
        !amount ||
        amount <= 0
    ){

        return;

    }







    appState.balance += amount;


    appState.totalEarn += amount;


    appState.todayEarn += amount;






    updateInterface();


    saveLocalData();



}









function resetDailyEarn(){



    appState.todayEarn = 0;


    updateInterface();


    saveLocalData();



}









/* =========================================
   LOCAL STORAGE
========================================= */


function saveLocalData(){



    const data = {


        user:
        appState.user,


        balance:
        appState.balance,


        todayEarn:
        appState.todayEarn,


        totalEarn:
        appState.totalEarn,


        referrals:
        appState.referrals,


        completedTasks:
        appState.completedTasks,


        adsWatched:
        appState.adsWatched,


        level:
        appState.level,


    };







    try{



        localStorage.setItem(

            SYRICOIN_CONFIG.storageKey,

            JSON.stringify(data)

        );




    }catch(error){



        console.error(

            "Save Data Error:",

            error

        );



    }



}









function loadLocalData(){



    try{



        const saved =

        localStorage.getItem(

            SYRICOIN_CONFIG.storageKey

        );






        if(!saved){

            return;

        }






        const data =
        JSON.parse(saved);






        Object.assign(

            appState,

            data

        );




    }catch(error){



        console.error(

            "Load Data Error:",

            error

        );



    }



}









/* =========================================
   API CONNECTION LAYER
========================================= */


const API = {


    async getTasks(){



        /*
        
        مستقبلاً:

        Google Apps Script
        Backend Server
        CPA API
        ADS API

        */





        return [];



    },







    async sendWithdraw(request){



        /*
        
        مستقبلاً:

        إرسال البيانات إلى السيرفر

        Telegram ID
        Amount
        Method
        Phone

        */





        console.log(

            "Withdraw Request:",

            request

        );






        return {


            success:true,


        };



    }



};









/* =========================================
   SECURITY HELPERS
========================================= */


function sanitizeNumber(value){



    const number =
    Number(value);





    if(
        isNaN(number)
    ){

        return 0;

    }




    return number;



}









function userLoggedIn(){



    return Boolean(

        appState.user.id

    );


}









/* =========================================
   AUTO SAVE
========================================= */


setInterval(()=>{



    saveLocalData();



},30000);

/*
====================================================
 SyriCoin Telegram Mini App
 Frontend Engine V1
 Clean Production Structure
 Part 4/4
====================================================
*/



/* =========================================
   APPLICATION BOOT CONTROL
========================================= */


let appStarted = false;









async function startApplication(){



    if(appStarted){


        console.log(
            "SyriCoin already started"
        );


        return;


    }







    appStarted = true;






    try{



        loadLocalData();



        initializeApp();




        await taskManager.loadTasks();





        updateInterface();





        saveLocalData();






        console.log(
            "SyriCoin App Started Successfully"
        );





    }catch(error){



        console.error(

            "Application Start Error:",

            error

        );



    }



}









/* =========================================
   TELEGRAM MAIN BUTTON READY
========================================= */


function telegramReady(){



    if(!tg){

        return;

    }






    try{



        tg.MainButton.hide();



    }catch(error){



        console.log(
            "Telegram Button unavailable"
        );


    }



}









/* =========================================
   GLOBAL ERROR HANDLER
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









/* =========================================
   PAGE READY
========================================= */


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        telegramReady();


        startApplication();



    }

);









/* =========================================
   END SyriCoin Frontend Engine V1
====================================================
*/

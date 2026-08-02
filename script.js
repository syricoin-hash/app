/* ==========================================================================
   TEMPORARY DIAGNOSTIC - سيتم حذفه بعد حل المشكلة
   ========================================================================== */
window.addEventListener("error", function(e){
    alert(
        "⚠️ خطأ حقيقي:\n" +
        e.message +
        "\nبالملف: " + e.filename +
        "\nبالسطر: " + e.lineno
    );
});

window.addEventListener("unhandledrejection", function(e){
    alert(
        "⚠️ خطأ غير معالج (Promise):\n" +
        (e.reason?.message || e.reason)
    );
});


/* ==========================================================================
   SyriCoin Telegram Mini App
   Core JavaScript Architecture
   Production Hardened Version
   Part 1/4
   ========================================================================== */


/* ==========================================================================
   1. CENTRAL CONFIGURATION
   ========================================================================== */

const CONFIG = Object.freeze({

    // Google Apps Script Backend URL
    API_URL: "https://script.google.com/macros/s/AKfycbw6WVGluNjeZ79BaS6CliTHddoiwmSlW06MUxQHq0FLTP7wRcoWg6XSHZ7aBOsMEh9nZA/exec",

    APP_VERSION: "1.0.0",

    REQUEST_TIMEOUT_MS: 15000,

    MAX_RETRIES: 2,

    MIN_WITHDRAWAL_POINTS: 5000,

    MAX_QR_SIZE_MB: 1,

    CAPTCHA_TIMEOUT_MS: 30000,


    CAPTCHA_PROVIDER: "INTERNAL",
    // INTERNAL | TURNSTILE


    TURNSTILE_SITEKEY: "",


    ENDPOINTS: Object.freeze({

        SYNC_USER: "sync_user",

        CHECK_SECURITY: "check_security",

        GET_CPA_TASKS: "get_cpa_tasks",

        VERIFY_TASK: "verify_task",

        REQUEST_WITHDRAWAL: "request_withdrawal",

        UPLOAD_QR: "upload_qr",

        GENERATE_CAPTCHA: "generate_captcha",

        VERIFY_CAPTCHA: "verify_captcha",

        UPDATE_PROFILE: "update_profile"

    }),


    // Operations that must never auto retry
    NON_RETRYABLE_ACTIONS: Object.freeze([

        "request_withdrawal",

        "verify_task",

        "upload_qr"

    ])

});



/* ==========================================================================
   2. TELEGRAM WEBAPP ADAPTER
   ========================================================================== */

const TgAdapter = {


    tg: window.Telegram?.WebApp || null,


    init(){

        if(!this.tg) return;


        try{

            this.tg.ready();

            this.tg.expand();


        }catch(error){

            console.warn(
                "[Telegram] Initialization warning",
                error.message
            );

        }

    },



    isAvailable(){

        return Boolean(
            this.tg &&
            this.tg.initData
        );

    },



    getUser(){

        const realUser =
        this.tg?.initDataUnsafe?.user || null;

        if(realUser)
            return realUser;


        // وضع الاختبار: يفعّل فقط لما يكون التطبيق مفتوح
        // من متصفح عادي خارج تيليجرام (لا يوجد initData إطلاقاً)
        if(!this.isAvailable()){

            console.warn(
                "[SyriCoin] وضع اختبار المتصفح مفعّل - هذا مستخدم تجريبي وهمي، غير حقيقي"
            );

            return {
                id:"999000000",
                first_name:"مستخدم تجريبي",
                username:"browser_test_mode"
            };

        }


        return null;

    },



    getInitData(){

        return this.tg?.initData || "";

    },


    getPlatform(){

        return this.tg?.platform || "unknown";

    }

};



/* ==========================================================================
   3. SECURITY ENGINE
   ========================================================================== */

const Security = {


    escapeHTML(value){

        if(value === null || value === undefined)
            return "";


        return String(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");

    },




    generateSecureToken(length = 32){

        if(window.crypto?.getRandomValues){

            const bytes =
            new Uint8Array(length);


            window.crypto.getRandomValues(bytes);


            return Array.from(bytes)

            .map(
                b =>
                b.toString(16)
                .padStart(2,"0")
            )

            .join("");

        }



        return (
            Date.now()
            .toString(36)
            +
            Math.random()
            .toString(36)
            .substring(2)
        );

    },




    generateRequestID(){

        return (
            "REQ-" +
            Date.now() +
            "-" +
            this.generateSecureToken(8)
        );

    },




    generateTransactionID(prefix="TX"){


        return (

            prefix +
            "-" +
            new Date()
            .toISOString()
            .replace(/[-:.TZ]/g,"")
            +
            "-"
            +
            this.generateSecureToken(6)

        );


    }



};





/* ==========================================================================
   4. TRANSACTION MANAGER
   ========================================================================== */


const TransactionManager = {


    activeTransactions:new Map(),



    create(type,payload={}){


        const id =
        Security.generateTransactionID(type);



        const transaction={

            id,

            type,

            payload,

            createdAt:Date.now(),

            status:"created"

        };



        this.activeTransactions.set(
            id,
            transaction
        );


        return transaction;


    },



    update(id,status){


        const tx =
        this.activeTransactions.get(id);


        if(tx){

            tx.status=status;

        }


    },



    remove(id){

        this.activeTransactions.delete(id);

    }



};





/* ==========================================================================
   5. GLOBAL APPLICATION STATE
   ========================================================================== */


const AppState = {


    user:{


        telegram_id:null,

        username:"",

        full_name:"",

        total_points:0,

        wallet_balance_syp:0,

        reserved_points:0,

        reserved_balance_syp:0,

        phone_number:"",

        notifications_count:0


    },



    session:{


        token:
        Security.generateSecureToken(),


        startedAt:Date.now()


    },



    security:{


        vpnDetected:false,


        captchaToken:null


    },



    withdrawal:{


        mode:"credit",

        qrUrl:null,

        processing:false,

        transactionId:null


    },



    tasks:{


        completed:new Set(),

        processing:new Set()


    },





    setUser(data){


        if(!data)
            return;



        this.user =
        {
            ...this.user,
            ...data
        };



        if(Array.isArray(data.completed_tasks)){


            this.tasks.completed =
            new Set(data.completed_tasks);


        }


        if(window.UIController){

            UIController.updateDashboard();

        }


    },





    getAvailablePoints(){


        return Math.max(

            0,

            Number(this.user.total_points || 0)
            -
            Number(this.user.reserved_points || 0)

        );


    }




};

/* ==========================================================================
   SyriCoin Telegram Mini App
   Production Hardened Version
   Part 2/4
   ========================================================================== */


/* ==========================================================================
   6. API CLIENT ENGINE
   ========================================================================== */


class ApiClient {


    static async post(
        action,
        payload = {},
        retries = CONFIG.MAX_RETRIES
    ){


        // منع العمليات عند اكتشاف VPN
        if(
            AppState.security.vpnDetected &&
            action !== CONFIG.ENDPOINTS.CHECK_SECURITY
        ){

            throw new Error(
                "تم إيقاف العمليات مؤقتاً بسبب نظام الحماية."
            );

        }



        // العمليات المالية لا تعاد تلقائياً
        if(
            CONFIG.NON_RETRYABLE_ACTIONS
            .includes(action)
        ){

            retries = 0;

        }




        const controller =
        new AbortController();


        const timeout =
        setTimeout(
            ()=>controller.abort(),
            CONFIG.REQUEST_TIMEOUT_MS
        );




        const requestID =
        Security.generateRequestID();




        const authData = {


            init_data:
            TgAdapter.getInitData(),


            telegram_id:
            TgAdapter.getUser()?.id ||
            AppState.user.telegram_id,


            session_token:
            AppState.session.token,



            request_id:
            requestID,



            app_version:
            CONFIG.APP_VERSION,



            platform:
            TgAdapter.getPlatform(),



            captcha_token:
            AppState.security.captchaToken || null


        };





        try{


            const response =
            await fetch(

                CONFIG.API_URL,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "text/plain;charset=utf-8"

                    },


                    body:
                    JSON.stringify({

                        action,

                        authData,

                        payload

                    }),


                    signal:
                    controller.signal

                }

            );



            clearTimeout(timeout);




            if(!response.ok){


                const error =
                new Error(
                    `Server Error ${response.status}`
                );


                error.http=true;


                throw error;

            }





            const result =
            await response.json();




            if(result.success===false && result.is_vpn){


                const error =
                new Error(
                    result.message ||
                    "تم رفض الطلب من نظام الحماية"
                );


                error.http=true;


                throw error;


            }





            // استهلاك الكابتشا بعد العملية
            AppState.security.captchaToken=null;



            return result;




        }catch(error){



            clearTimeout(timeout);




            const retryAllowed =

            (
                error.name==="AbortError" ||
                error.name==="TypeError"
            )
            &&
            !error.http;




            if(
                retries>0 &&
                retryAllowed
            ){



                await new Promise(
                    r=>setTimeout(r,1000)
                );



                return this.post(
                    action,
                    payload,
                    retries-1
                );


            }





            if(error.name==="AbortError"){


                throw new Error(
                    "انتهى وقت الاتصال بالخادم."
                );


            }




            throw error;


        }


    }



}





/* ==========================================================================
   7. CAPTCHA SECURITY SERVICE
   ========================================================================== */


class CaptchaService {



    static async requireVerification(){


        if(
            CONFIG.CAPTCHA_PROVIDER==="TURNSTILE"
        ){

            return this.turnstile();


        }


        return this.internal();


    }






    static async internal(){



        try{


            const challenge =
            await ApiClient.post(
                CONFIG.ENDPOINTS.GENERATE_CAPTCHA
            );




            return new Promise(
            (resolve,reject)=>{



                const timer =
                setTimeout(()=>{


                    UIController.closeCaptchaModal();


                    reject(
                        new Error(
                        "انتهى وقت التحقق."
                        )
                    );


                },
                CONFIG.CAPTCHA_TIMEOUT_MS);



                UIController.showCaptchaModal(

                    challenge,

                    async(answer)=>{



                        clearTimeout(timer);



                        if(answer===null){


                            reject(
                                new Error(
                                "تم إلغاء التحقق."
                                )
                            );


                            return;

                        }




                        try{


                            const result =
                            await ApiClient.post(

                                CONFIG.ENDPOINTS.VERIFY_CAPTCHA,

                                {

                                    challenge_id:
                                    challenge.id,


                                    answer

                                }

                            );



                            AppState.security.captchaToken =
                            result.captcha_token;



                            resolve(true);



                        }catch(e){


                            reject(
                                new Error(
                                "فشل التحقق."
                                )
                            );


                        }



                    }


                );




            });



        }catch(e){


            throw new Error(
                "تعذر إنشاء اختبار التحقق."
            );


        }



    }






    static async turnstile(){



        return new Promise(
        (resolve,reject)=>{


            if(!window.turnstile){


                return this.internal()
                .then(resolve)
                .catch(reject);


            }





            const timer =
            setTimeout(()=>{


                reject(
                    new Error(
                    "انتهى وقت Turnstile"
                    )
                );


            },
            CONFIG.CAPTCHA_TIMEOUT_MS);






            window.turnstile.render(

                "#turnstile-container",

                {


                    sitekey:
                    CONFIG.TURNSTILE_SITEKEY,



                    callback(token){


                        clearTimeout(timer);



                        AppState.security.captchaToken =
                        token;



                        resolve(true);


                    },


                    "error-callback"(){

                        clearTimeout(timer);


                        reject(
                            new Error(
                            "فشل الحماية"
                            )
                        );

                    }


                }


            );



        });



    }



}





/* ==========================================================================
   8. AUTHENTICATION SERVICE
   ========================================================================== */


class AuthService {



    static async initialize(){



        TgAdapter.init();




        if(!TgAdapter.isAvailable()){

    console.warn(
        "Development mode: Running outside Telegram"
    );

}





        await SecurityGuard.check();





        const user =
        TgAdapter.getUser();




        if(!user){


            throw new Error(
            "تعذر الحصول على بيانات Telegram."
            );


        }





        let syncResult =
        await ApiClient.post(
            "getUser",
            { telegram_id:user.id }
        );



        if(!syncResult.success){


            await ApiClient.post(
                "registerUser",
                {

                    telegram_id:user.id,

                    username:
                    user.username || "",

                    full_name:
                    [user.first_name, user.last_name]
                    .filter(Boolean)
                    .join(" "),

                    phone_number:"",

                    country:"Syria",

                    device_id:
                    Security.generateRequestID()

                }
            );


            syncResult =
            await ApiClient.post(
                "getUser",
                { telegram_id:user.id }
            );


        }



        if(!syncResult.success || !syncResult.user){

            throw new Error(
                syncResult.message ||
                "تعذر مزامنة الحساب مع الخادم."
            );

        }



        AppState.setUser(syncResult.user);


    }



}





/* ==========================================================================
   9. SECURITY GUARD
   ========================================================================== */


class SecurityGuard {



    static async check(){


        try{


            const result =
            await ApiClient.post(

                CONFIG.ENDPOINTS.CHECK_SECURITY,

                {

                    timezone:
                    new Date()
                    .getTimezoneOffset(),


                    agent:
                    navigator.userAgent

                }

            );




            AppState.security.vpnDetected =
            Boolean(result.is_vpn);



            if(window.UIController){


                UIController.toggleVpnOverlay(
                    AppState.security.vpnDetected
                );


            }




        }catch(e){



            console.warn(
                "[SecurityGuard]",
                e.message
            );


        }



    }



}





/* ==========================================================================
   10. UPLOAD SERVICE
   ========================================================================== */


class UploadService {



    static async uploadQR(file){



        const compressed =
        await ImageUtils.compressImage(file);




        const base64 =
        await ImageUtils.blobToBase64(
            compressed.blob
        );




        const transaction =
        TransactionManager.create(
            "UPLOAD_QR"
        );




        const result =
        await ApiClient.post(

            CONFIG.ENDPOINTS.UPLOAD_QR,

            {


                upload_id:
                transaction.id,


                mime_type:
                compressed.mimeType,


                base64_data:
                base64


            }

        );




        TransactionManager.remove(
            transaction.id
        );




        if(
            !result ||
            !result.qr_code_url
        ){


            throw new Error(
            "فشل رفع الصورة."
            );


        }




        return result.qr_code_url;



    }



}

/* ==========================================================================
   SyriCoin Telegram Mini App
   Production Hardened Version
   Part 3/4
   ========================================================================== */


/* ==========================================================================
   11. UI CONTROLLER
   ========================================================================== */


class UIController {



    static safeGet(id){

        return document.getElementById(id);

    }




    static safeAddListener(id,event,callback){

        const element =
        this.safeGet(id);


        if(element){

            element.addEventListener(
                event,
                callback
            );

        }

    }





    static init(){

        this.bindEvents();


        if(
            TgAdapter.tg?.themeParams?.bg_color
        ){

            document.documentElement
            .style
            .setProperty(

                "--tg-theme-bg-color",

                TgAdapter.tg.themeParams.bg_color

            );

        }


    }





/* ==========================================================================
   EVENTS
   ========================================================================== */


    static bindEvents(){



        this.safeAddListener(
            "start-app-btn",
            "click",
            ()=>this.startApp()
        );



        this.safeAddListener(
            "request-withdrawal-btn",
            "click",
            ()=>this.openWithdrawalModal()
        );



        this.safeAddListener(
            "smart-confirm-withdrawal-btn",
            "click",
            ()=>this.handleWithdrawalSubmit()
        );



        this.safeAddListener(
            "upload-qr-btn",
            "click",
            ()=>{

                const input =
                this.safeGet(
                    "qr-file-input"
                );

                if(input)
                    input.click();

            }

        );



        this.safeAddListener(
            "qr-file-input",
            "change",
            e=>this.handleQRFileSelection(e)
        );



        this.safeAddListener(
            "settings-btn",
            "click",
            ()=>this.openPage(
                "profile-page"
            )
        );



        document
        .querySelectorAll(".back-btn")
        .forEach(btn=>{

            btn.addEventListener(
                "click",
                ()=>this.closeAllPages()
            );

        });



        document
        .querySelectorAll("[data-target]:not(.back-btn)")
        .forEach(btn=>{

            btn.addEventListener(
                "click",
                ()=>this.openPage(
                    btn.dataset.target
                )
            );

        });



    }





/* ==========================================================================
   APP START
   ========================================================================== */


    static async startApp(){

        const text =
        this.safeGet(
            "splash-loading-text"
        );



        try{


            await AuthService.initialize();

            const welcome =
            this.safeGet(
                "welcome-screen"
            );


            if(welcome)
                welcome.classList.add(
                    "hidden"
                );
           
           const app =
this.safeGet(
    "app"
);

if(app)
    app.classList.add(
        "active"
    );


const home =
this.safeGet(
    "home-page"
);

if(home)
    home.classList.add(
        "active"
    );



            const splash =
            this.safeGet(
                "splash-screen"
            );


            if(splash){

                splash.style.opacity="0";


                setTimeout(
                    ()=>splash.style.display="none",
                    500
                );

            }




        }catch(error){



            const errorBox =
            this.safeGet(
                "start-error-text"
            );


            if(errorBox){

                errorBox.textContent =
                "خطأ: " + error.message;

                errorBox.style.display =
                "block";

            }



            if(text){

                text.textContent =
                error.message;


            }



        }



    }





/* ==========================================================================
   DASHBOARD
   ========================================================================== */


    static updateDashboard(){


        const user =
        AppState.user;



        const points =
        this.safeGet(
            "main-points-display"
        );



        const money =
        this.safeGet(
            "main-syp-display"
        );



        if(points){

            points.innerHTML =

            `${Security.escapeHTML(
                user.total_points
            )}
            <span class="unit">
            نقطة
            </span>`;

        }




        if(money){


            money.textContent =

            `القيمة:
            ${Security.escapeHTML(
                user.wallet_balance_syp
            )}
            ليرة سورية`;

        }



    }






/* ==========================================================================
   PAGE SYSTEM
   ========================================================================== */


    static openPage(pageId){


        const page =
        this.safeGet(pageId);


        if(!page)
            return;



        page.classList.add(
            "active"
        );



        if(pageId==="profile-page")
            this.renderProfile();



        if(pageId==="cpa-page")
            this.renderCPA();



    }





    static closeAllPages(){


        document
        .querySelectorAll(".internal-page")
        .forEach(
            page=>
            page.classList.remove(
                "active"
            )
        );


    }





/* ==========================================================================
   PROFILE
   ========================================================================== */


static renderProfile(){


const container =
this.safeGet(
"profile-content"
);



if(!container)
return;



const user =
AppState.user;



container.innerHTML = `


<div class="profile-header-container">


<h3>
${Security.escapeHTML(
user.full_name ||
user.username
)}

</h3>


<div>
Telegram ID:
${Security.escapeHTML(
user.telegram_id
)}

</div>


</div>



<div class="input-group">

<label>
الاسم الكامل
</label>


<input
id="prof-fullname"
value="${Security.escapeHTML(
user.full_name || ""
)}">


</div>




<div class="input-group">

<label>
رقم الهاتف
</label>


<input
id="prof-phone"
value="${Security.escapeHTML(
user.phone_number || ""
)}">


</div>




<button
id="save-profile-btn"
class="action-btn">

حفظ

</button>


`;





this.safeAddListener(

"save-profile-btn",

"click",

async()=>{


try{


const updated =
await ApiClient.post(

CONFIG.ENDPOINTS.UPDATE_PROFILE,

{


full_name:
this.safeGet(
"prof-fullname"
).value,


phone_number:
this.safeGet(
"prof-phone"
).value


}

);



AppState.setUser(
updated
);



this.showToast(
"تم تحديث البيانات"
);



}catch(e){


this.showToast(
e.message
);


}


}


);



}







/* ==========================================================================
   CPA TASK SYSTEM
   ========================================================================== */


static async renderCPA(){


const container =
this.safeGet(
"cpa-content"
);



if(!container)
return;



container.innerHTML =
"جاري تحميل المهام...";



try{


const tasks =
await ApiClient.post(
CONFIG.ENDPOINTS.GET_CPA_TASKS
);



container.innerHTML =

tasks.map(task=>{


const done =
AppState.tasks.completed
.has(
task.task_id
);



return `


<div class="task-card">


<h4>

${Security.escapeHTML(
task.title
)}

</h4>



<p>

${Security.escapeHTML(
task.description
)}

</p>



<strong>

+${Security.escapeHTML(
task.reward_points
)}
نقطة

</strong>




<button

${done ? "disabled":""}

onclick="UIController.handleTaskAction('${Security.escapeHTML(task.task_id)}')"

>

${done ?
"مكتملة ✓":
"تنفيذ"}

</button>



</div>


`;


}).join("");




}catch(e){


container.innerHTML =
"لا توجد مهام حالياً";


}


}





static async handleTaskAction(taskId){



if(
AppState.tasks.processing.has(taskId)
||
AppState.tasks.completed.has(taskId)
)
return;



try{


AppState.tasks.processing.add(taskId);



await CaptchaService.requireVerification();



const result =
await ApiClient.post(

CONFIG.ENDPOINTS.VERIFY_TASK,

{

task_id:taskId

}

);



AppState.tasks.completed.add(
taskId
);



AppState.setUser(
result.updated_user
);



this.showToast(
"تمت إضافة المكافأة"
);



}catch(e){


this.showToast(
e.message
);



}finally{


AppState.tasks.processing.delete(
taskId
);



}



}


} /* <-- إغلاق فعلي لـ class UIController، كان ناقص بالملف الأصلي */

/* ========================================================================== END OF UIController CLASS ========================================================================== */

/* ==========================================================================
   SyriCoin Telegram Mini App
   Production Hardened Version
   Part 4/4
   ========================================================================== */


/* ==========================================================================
   WITHDRAWAL SYSTEM
   ========================================================================== */


UIController.openWithdrawalModal = function(){


    const modal =
    this.safeGet(
        "withdrawal-modal"
    );


    if(modal)
        modal.classList.add("active");



    AppState.withdrawal.mode =
    "credit";

};





UIController.autoFillWithdrawal = function(){


    const name =
    this.safeGet(
        "withdrawal-fullname"
    );


    const phone =
    this.safeGet(
        "withdrawal-phone"
    );



    if(name)
        name.value =
        AppState.user.full_name || "";



    if(phone)
        phone.value =
        (
            AppState.user.phone_number || ""
        )
        .replace(/^09/,"");


};







UIController.handleWithdrawalSubmit = async function(){



    // منع الضغط المتكرر

    if(
        AppState.withdrawal.processing
    )
    return;



    const fullName =
    this.safeGet(
        "withdrawal-fullname"
    )?.value.trim();



    const phone =
    this.safeGet(
        "withdrawal-phone"
    )?.value.trim();



    const amount =
    Number(
        this.safeGet(
            "withdrawal-amount"
        )?.value
    );





    if(
        !fullName ||
        !phone ||
        !amount
    ){

        return this.showToast(
            "يرجى تعبئة جميع الحقول."
        );

    }





    if(
        !Number.isInteger(amount)
        ||
        amount <= 0
    ){

        return this.showToast(
            "أدخل عدد نقاط صحيح."
        );

    }





    if(
        amount <
        CONFIG.MIN_WITHDRAWAL_POINTS
    ){

        return this.showToast(
            `الحد الأدنى ${CONFIG.MIN_WITHDRAWAL_POINTS} نقطة`
        );

    }





    if(
        amount >
        AppState.getAvailablePoints()
    ){

        return this.showToast(
            "الرصيد غير كافٍ."
        );

    }






    const transaction =
    TransactionManager.create(
        "WITHDRAWAL",
        {
            amount
        }
    );



    AppState.withdrawal.transactionId =
    transaction.id;




    try{


        AppState.withdrawal.processing =
        true;



        await CaptchaService.requireVerification();





        const result =
        await ApiClient.post(

            CONFIG.ENDPOINTS.REQUEST_WITHDRAWAL,

            {


                withdrawal_id:
                transaction.id,


                withdrawal_type:
                AppState.withdrawal.mode,


                full_name:
                fullName,


                phone_number:
                "09"+phone,


                points_amount:
                amount,


                qr_code_url:
                AppState.withdrawal.qrUrl || null


            }

        );





        AppState.setUser(
            result.updated_user
        );



        TransactionManager.update(
            transaction.id,
            "completed"
        );



        this.showToast(
            "تم تسجيل طلب السحب بنجاح."
        );




        const modal =
        this.safeGet(
            "withdrawal-modal"
        );


        if(modal)
            modal.classList.remove(
                "active"
            );





    }catch(error){



        TransactionManager.update(
            transaction.id,
            "failed"
        );



        this.showToast(
            error.message
        );



    }
    finally{


        AppState.withdrawal.processing =
        false;


    }



};







/* ==========================================================================
   QR UPLOAD
   ========================================================================== */


UIController.handleQRFileSelection =
async function(event){



    const file =
    event.target.files[0];



    if(!file)
        return;




    try{


        this.showToast(
            "جاري رفع الصورة..."
        );



        const url =
        await UploadService.uploadQR(
            file
        );



        AppState.withdrawal.qrUrl =
        url;



        this.showToast(
            "تم رفع QR بنجاح ✓"
        );



    }catch(error){


        this.showToast(
            error.message
        );


    }



    event.target.value="";


};







/* ==========================================================================
   CAPTCHA MODAL
   ========================================================================== */


UIController.showCaptchaModal =
function(
challenge,
callback
){



    const modal =
    this.safeGet(
        "captcha-modal"
    );



    const box =
    this.safeGet(
        "captcha-container"
    );



    if(
        !modal ||
        !box
    )
    return;




    box.innerHTML = `


<p>

${Security.escapeHTML(
challenge.question
)}

</p>



${challenge.options.map(
option=>`

<button
class="captcha-btn"
data-answer="${Security.escapeHTML(option)}">

${Security.escapeHTML(option)}

</button>

`
).join("")}



<button
class="captcha-btn cancel-btn">

إلغاء

</button>



`;





    modal.classList.add(
        "active"
    );





    box
    .querySelectorAll(
        ".captcha-btn"
    )
    .forEach(btn=>{


        btn.onclick=function(){



            modal.classList.remove(
                "active"
            );



            if(
                btn.classList.contains(
                    "cancel-btn"
                )
            ){

                callback(null);

            }
            else{


                callback(
                    btn.dataset.answer
                );


            }


        };



    });


};






UIController.closeCaptchaModal =
function(){


const modal =
this.safeGet(
"captcha-modal"
);


if(modal)

modal.classList.remove(
"active"
);


};









/* ==========================================================================
   VPN OVERLAY
   ========================================================================== */


UIController.toggleVpnOverlay =
function(show){


const overlay =
this.safeGet(
"vpn-warning-overlay"
);



if(!overlay)
return;



if(show)

overlay.classList.remove(
"hidden"
);

else

overlay.classList.add(
"hidden"
);


};








/* ==========================================================================
   TOAST SYSTEM
   ========================================================================== */


UIController.showToast =
function(message){



const old =
document.getElementById(
"toast-notification"
);



if(old)
old.remove();




const toast =
document.createElement(
"div"
);



toast.id =
"toast-notification";



toast.textContent =
message;



toast.style.cssText = `

position:fixed;
bottom:30px;
left:50%;
transform:translateX(-50%);
background:#111;
color:white;
padding:12px 25px;
border-radius:30px;
z-index:99999;
font-size:14px;

`;



document.body.appendChild(
toast
);



setTimeout(
()=>toast.remove(),
3000
);



};







/* ==========================================================================
   FINAL ENTRY POINT
   ========================================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    UIController.init();



});

export const faqData = [
  {
    q: "Polar Inventory က Android app လား၊ IOS app လား?",
    a: "Progressive Web Application (PWA) လို့ခေါ်တဲ့ Web app တစ်မျိုးဖြစ်ပါတယ်။ ပုံမှန် Web app တွေနဲ့မတူတာက သူ့ကို Mobile application အနေနဲ့ Install လုပ်ပြီးသုံးလို့ရတာပဲဖြစ်ပါတယ်။",
  },
  {
    q: "ဒီ Application မှာ တခြား Web app / Mobile app သီးသန့်တွေထက် ဘာတွေအားသာချက်ရှိလဲ?",
    a: "PWA ဖြစ်တာကြောင့် Link တစ်မျိုးတည်းနဲ့ Android, IOS, Window, Mac စတဲ့ platform အစုံမှာသုံးလို့ရပါတယ်။ ဒါ့အပြင် Update တွေကို Server က တင်ပြီးပြီးချင်း One click နဲ့ တင်လို့ရမယ်။ Web app တွေလို Progress bar အမြဲမမြင်ရဘူး။ ခြုံပြောရရင် Web app နဲ့ Mobile app တို့ရဲ့ အားသာချက်တွေကို တစ်ခုတည်းအဖြစ်ပေါင်းထားတဲ့ App တစ်ခုဖြစ်ပါတယ်။",
  },
  {
    q: "Free trial ရှိလား?",
    a: "ရှိပါတယ်။ Account အသစ် sign up လုပ်လိုက်တာနဲ့ Premium feature ကို 7 ရက်အခမဲ့ အသုံးပြုနိုင်ပါတယ်။",
  },
  {
    q: "Internet မရှိဘဲ app ကို အသုံးပြုလို့ရလား?",
    a: "ရပါတယ်။ Polar Inventory app ကို offline အနေဖြင့်လည်း အသုံးပြုနိုင်ပြီး၊ internet ပြန်ရလာတဲ့အချိန်မှာ data တွေကို အလိုအလျောက် sync လုပ်ပေးပါတယ်။",
  },
  {
    q: "အသုံးပြုနေတုန်း Internet ပြတ်သွားရင် data ပျက်သွားမလား?",
    a: "မပျက်ပါဘူး။ Data တွေကို device ထဲမှာ သိမ်းထားပြီး connection ပြန်ရလာတဲ့အချိန်မှာ အလိုအလျောက် server နဲ့ sync လုပ်ပေးပါတယ်။",
  },
  {
    q: "Account တစ်ခုနဲ့ device ဘယ်နှစ်ခုအထိ အသုံးပြုနိုင်လဲ?",
    a: "Account တစ်ခုစီမှာ device limit သတ်မှတ်ထားပါတယ် (Default - 3 devices)။ Limit ကို ကျော်သွားရင် device အားလုံးကို system က အလိုအလျောက် logout သွားမှာပါ။",
  },
  {
    q: "သုံးနေရင်းနဲ့ device အားလုံးက logout ဖြစ်သွားတာဘာကြောင့်လဲ?",
    a: "Device အားလုံး Logout ဖြစ်သွားတာအကြောင်းနှစ်ခုပဲရှိပါတယ်။ (1) device limit ကျော်ပြီး login ဝင်ခြင်း၊ (2) device တစ်ခုခုမှ manual logout ပြုလုပ်ခြင်း တို့ပဲဖြစ်ပါတယ်",
  },
  {
    q: "အသုံးပြုသူရဲ့ data တွေ လုံခြုံရဲ့လား?",
    a: "လုံးဝလုံခြုံပါတယ်။ Data တွေကို authentication, encryption နဲ့ Row Level Security (RLS) အသုံးပြုပြီး ကာကွယ်ထားပါတယ်။",
  },
  {
    q: "SQL Injection နဲ့ data ကို hack လုပ်လို့ရလား?",
    a: "မရပါဘူး။ App က raw SQL query တွေကို client ဘက်က မခေါ်နိုင်အောင် တားဆီးထားပြီး Database API တွေက SQL injection ကို ကာကွယ်ပေးပါတယ်။",
  },
  {
    q: "Browser refresh လုပ်ရင် data ပျက်သွားမလား?",
    a: "မပျက်ပါဘူး။ Refresh လုပ်တာနဲ့ data ပျက်မသွားပါဘူး။ Session နဲ့ offline data တွေကို ဆက်လက်ထိန်းသိမ်းထားပါတယ်။",
  },
  {
    q: "Password ပြောင်းလို့ရလား?",
    a: "ရပါတယ်။ Profile page မှာ Password ကို ပြောင်းလဲနိုင်ပါတယ်။",
  },
  {
    q: "Premium သက်တမ်းကုန်သွားရင် ဘာဖြစ်မလဲ?",
    a: "Data တွေကို ဆက်လက်ကြည့်ရှုနိုင်ပေမယ့် Premium feature အချို့ကို ကန့်သတ်ထားနိုင်ပါတယ်။",
  },
  {
    q: "Premium သက်တမ်းတိုးတာ၊ Device limit တိုးတာတွေဘယ်လိုလုပ်မလဲ?",
    a: "Contact page မှာပေးထားတဲ့ Phone, Viber, Telegram, Messenger နှစ်သက်ရာကိုဆက်သွယ်ကာ Username, Email ပြောပြပြီး ဈေးနှုန်းချိုသာစွာနဲ့ Premium သက်တမ်း၊ Device limit တိုးလို့ရပါတယ်",
  },
];

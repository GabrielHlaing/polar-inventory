import signup from "./profile.png";
import addItem from "./addItem.png";
import updateQty from "./updateQty.png";
import cart from "./cart.png";
import history from "./history.png";
import setting from "./setting.png";

export const tutorialData = [
  {
    id: "signup",
    title: "Sign up လုပ်နည်း (Account ဖွင့်နည်း)",
    steps: [
      "App ကိုဖွင့်ပြီး Create One ကို နှိပ်ပါ။",
      "User Name, Email နှင့် Password ကို ထည့်ပြီး sign up လုပ်ပါ။",
      "Account ဖွင့်ပြီးပါက Home page သို့ အလိုအလျောက် ဝင်သွားပါမည်။",
      "Profile page တွင် မိမိ၏ User Name, Email, Account Expired Date နှင့် Device Limit ကို စစ်ဆေးကြည့်နိုင်ပါသည်။",
      "Profile ထဲမှ Change Password ကို အသုံးပြုပြီး Password အပြောင်းအလဲ ပြုလုပ်နိုင်ပါသည်။",
    ],
    image: [signup],
  },
  {
    id: "inventory-setup",
    title: "ပစ္စည်းစာရင်း ထည့်သွင်းနည်း (Inventory Setup)",
    steps: [
      "Home page မှ Inventory tab ကို နှိပ်ပါ။",
      "ညာဘက်အပေါ်ထောင့်တွင်ရှိသော + Add Item ကို နှိပ်ပါ။",
      "ပေါ်လာသော အကွက်ထဲတွင် Item Name, Purchase Price, Sale Price, MFG Date နှင့် EXP Date ကို ဖြည့်စွက်နိုင်ပါသည်။",
      "အချက်အလက်များ ပြည့်စုံပါက Save ကို နှိပ်ပါ။",
      "Inventory စာရင်းထဲတွင် Item အသစ် တစ်မျိုး အောင်မြင်စွာ ထည့်ပြီးသား ဖြစ်လာမည်ဖြစ်ပါသည်။",
      "Warn Exp In ကိုအသုံးပြု၍ Exp Date နီးသောပစ္စည်းများကို အရောင်ပြောင်းပြီး သတိပေးနိုင်ပါသည်။",
    ],
    image: [addItem],
  },
  {
    id: "update-qty",
    title: "ပစ္စည်းအရေအတွက် (Qty) ပြင်ဆင်နည်း",
    steps: [
      "Inventory စာရင်းမှ မိမိ ပြင်ဆင်လိုသော Item ကို နှိပ်ပါက အသေးစိတ်အချက်အလက် (Details page) အတွင်းရောက်ရှိသွားမည်။",
      "Item detail page ထဲတွင် Edit ကို နှိပ်ပါ။",
      "Qty (အရေအတွက်) ကို ထည့်သွင်း သို့မဟုတ် ပြင်ဆင်နိုင်ပါသည်။",
      "ပြီးပါက Save လုပ်ပြီး Inventory သို့ ပြန်သွားနိုင်ပါသည်။",
      "အကယ်၍ ပစ္စည်းအဝင်အထွက်စာရင်းကို အတိအကျမှတ်သားလိုပါက Cart အသုံးပြု၍ အဝယ်စာရင်းပြုလုပ်နိုင်သည်။",
    ],
    image: [updateQty],
  },
  {
    id: "sale-purchase",
    title: "အရောင်း / အဝယ် စာရင်းသွင်းနည်း (Sale & Purchase)",
    steps: [
      "Inventory မှ မိမိ အရောင်း သို့မဟုတ် အဝယ် ပြုလုပ်လိုသော Item ၏ ဘေးရှိ + (Add to cart) ကို နှိပ်ပါ။",
      "Item များရွေးပြီးပါက ညာဘက်အောက်ထောင့်တွင်ရှိသော Floating Cart Button ကို နှိပ်ပါ။",
      "Cart page တွင် Sale သို့မဟုတ် Purchase ကို ရွေးချယ်ပါ။ ",
      "Invoice Number, Invoice Date, Customer အချက်အလက်များနှင့် Item အရေအတွက်များကို စာရင်းသွင်းပါ။",
      "အချက်အလက်အားလုံး ပြည့်စုံပါက Checkout ကို နှိပ်ပါ။",
      "Checkout ပြီးပါက Inventory Qty အလိုအလျောက် ပြောင်းလဲပြီး History တွင် မှတ်တမ်း သိမ်းဆည်းသွားမည် ဖြစ်ပါသည်။",
    ],
    image: [cart],
  },
  {
    id: "history",
    title: "History စာရင်း ကြည့်နည်း",
    steps: [
      "Home page မှ History ကို နှိပ်ပါ။",
      "ယခင်ပြုလုပ်ခဲ့သော Sales, Purchases နှင့် Invoices များကို လအလိုက် ကြည့်ရှုနိုင်ပါသည်။",
      "Invoice တစ်ခုချင်းစီကို နှိပ်ပြီး အသေးစိတ်အချက်အလက်များကို ကြည့်နိုင်ပါသည်။",
      "လိုအပ်ပါက Invoice ၏ ညာဘက်အပေါ်ထောင့်တွင်ရှိသော Button များအသုံးပြု၍ ပစ္စည်းအမည်၊ အရေအတွက်၊ ဈေးနှုန်းတို့ကို ပြင်ဆင်ခြင်း (သို့မဟုတ်) Invoice ကို ဖျက်ခြင်းများ ပြုလုပ်နိုင်သည်။",
      "Print Button ကိုနှိပ်လိုက်ပါက Invoice Preview အနေနှင့်ကြည့်ရှုပြီး PNG ဖိုင်အနေဖြင့် သိမ်းဆည်းကာ ဈေးဝယ်သူထံသို့ ပို့ပေးနိုင်ပါသည်။",
    ],
    image: [history],
  },
  {
    id: "settings",
    title: "Settings page အသုံးပြုနည်း",
    steps: [
      "Home page မှ Settings tab ကို နှိပ်ပါ။",
      "Settings page တွင် သင့်ဆိုင်၏ Invoice အတွက် စိတ်တိုင်းကျ Customize ပြုလုပ်နိုင်ပါသည်။",
      "ဆိုင်အမည်၊ လိပ်စာ၊ ဖုန်းနံပါတ်၊ Email address များဖြည့်သွင်းပါ (မရှိသည်များကို ကွက်လပ်ချန်ခဲ့နိုင်သည်)၊",
      "ဆိုင် Logo၊ အရောင်၊ Font နှင့် Footer များရွေးချယ်ဖြည့်သွင်းပြီးလျှင် Preview Button နှိပ်ကာ အစမ်းကြည့်ရှုနိုင်ပါသည်။",
      "Setting ကိုစိတ်တိုင်းကျပြီဆိုပါက Save Settings ကိုနှိပ်ပြီး သိမ်းဆည်းပါ။",
    ],
    image: [setting],
  },

  {
    id: "offline",
    title: "Offline အသုံးပြုနည်း (Internet မရှိချိန်)",
    steps: [
      "Internet မရှိသည့်အချိန်တွင်လည်း Item ပြင်ဆင်ခြင်းနှင့် Sale / Purchase ပြုလုပ်ခြင်းများကို ဆက်လက် အသုံးပြုနိုင်ပါသည်။",
      "Internet ပြန်လည်ရရှိသည့်အချိန်တွင် Data များကို အလိုအလျောက် Sync လုပ်ပေးပါသည်။",
      "Data ပျောက်ဆုံးခြင်းမရှိပါ။",
      "Note: Item အသစ်ထည့်ခြင်း၊ ဖျက်ခြင်းကို Internet ရရှိချိန်မှသာပြုလုပ်ပါ။ Invoice ထုတ်ခြင်းကို Internet ရှိသည်ဖြစ်စေ မရှိသည်ဖြစ်စေ ပြုလုပ်နိုင်သည်။",
    ],
    image: [],
  },
  {
    id: "important-notes",
    title: "အရေးကြီး မှတ်ချက်များ",
    steps: [
      "Account တစ်ခုဖြင့် Login ဝင်ပြီးလျှင် Manual Logout သို့မဟုတ် Clear App Data (စက်ရှင်းခြင်းမဟုတ်) မပြုလုပ်ပါက Login ထပ်ဝင်စရာမလိုဘဲ တောက်လျှောက်အသုံးပြုနိုင်မည်ဖြစ်သည်။",
      "သတ်မှတ်ထားသော Device အရေအတွက်ထက်ပို၍ Login ဝင်မိပါက Device အားလုံးမှ Account များ Forced Logout ဖြစ်သွားပြီး ပြန်ဝင်ပေးရန်လိုအပ်သည်။",
      "ထို့ပြင် Device တစ်ခုမှ Manual Logout လုပ်လိုက်ပါကလည်း တခြား Device အားလုံး Logout ထွက်သွားမည်ဖြစ်သည်။",
    ],
    image: [],
  },
];


const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const botconfig = require("./bot-config.json");
(async() => {

  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
  puppeteer.use(StealthPlugin());
  puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')())
  puppeteer.use(require('puppeteer-extra-plugin-user-preferences')({userPrefs: {
    webkit: {
      webprefs: {
        default_font_size: 16
      }
    }
  }}))
  

  /**
   * browser puppeteer starter. you can choose to execute the bot and see all the action
   * or to execute bot on terminal only, by using the headless variable on puppeteer launch.
   */
  let browser = await puppeteer.launch({
    //headless:false,
    defaultViewport: null,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })

  const context = browser.defaultBrowserContext();
  //        URL                  An contentToFilter of permissions
  context.overridePermissions("https://www.facebook.com", ["geolocation", "notifications"]);
/**
 * BOILERPLATE CODE, do not touch.
 */




/**
 * Bot initialization variables
 * DO NOT TOUCH.
 */
let googlePage;
let facebookPage;
let responseNumber = 1;
let individualResponseValue = "";
let gaveInterval = false;
let hasResponsesLeft = true;

//getting facebook and google form admin accounts
let {facebookEmail,facebookPassword,googleEmail,googlePassword} = botconfig;

//getting bot configuration values.
let {startingPage,firstResponse,postURL,formURL} = botconfig;


const setUpPages = async () => {
     googlePage =  await browser.newPage();
     await googlePage.goto("https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fwww.google.com%2F&hl=pt-BR&flowName=GlifWebSignIn&flowEntry=ServiceLogin",{waitUntil: 'load', timeout: 0});
     facebookPage =  await browser.newPage();
     await facebookPage.goto('https://www.facebook.com/',{waitUntil: 'load', timeout: 0});
     await facebookPage.waitFor(3000);
};
const googleLogin = async ()=>{ 
    
    await googlePage.bringToFront();
    
    await googlePage.keyboard.type(googleEmail);
    await googlePage.keyboard.press('Enter');
    await googlePage.waitFor(1900);
    await googlePage.keyboard.type(googlePassword);
    await googlePage.keyboard.press('Enter');
    await googlePage.waitFor(1900);
    console.log("Has logged in google account.");
    
}

const goToForms = async (formURL)=>{
    await googlePage.bringToFront(); 
    await googlePage.goto(formURL,{waitUntil: 'load', timeout: 0});
    await googlePage.waitFor(2000);
    await googlePage.waitFor("div[class='freebirdFormeditorViewTabResponsesViewTabContent']");
    await googlePage.waitFor(2000);
    await googlePage.click("div[class='freebirdFormeditorViewTabResponsesViewTabContent']");
    let individualTab = 'div[data-view="4"]';

    
    await googlePage.waitFor(individualTab);
    await googlePage.waitFor(1000);
    await googlePage.click(individualTab);
    await googlePage.waitFor(1000);
    await googlePage.keyboard.press("Tab");
}



async function hasResponses() {
  let result = await googlePage.evaluate(async ()=> {
      let max =  document.getElementsByClassName("freebirdFormeditorViewResponsesResponsesCount");
      let min =  document.getElementsByClassName("quantumWizTextinputPaperinputInput exportInput");
      min = Number(min[3].value);
      max = Number(max[0].innerText.split(" ")[0]);
      return max > min;
  });
  console.log("Response number " + responseNumber.toString());
  console.log(result);
  if(result){
    gaveInterval = false;
  }else{
  gaveInterval = true;
  }
 
  return result;
}



const readResponse = async () => {

   individualResponseValue = await googlePage.evaluate(async ()=>{

        async function copyText(selector)  {
            var copyText = await document.querySelector(selector);
            return copyText.innerText;
        }
        return copyText('div[class="freebirdFormviewerViewItemsTextLongText freebirdFormviewerViewItemsTextDisabledText freebirdThemedInput"]');
    })

    await filter(individualResponseValue);
    await googlePage.waitFor(900);

}



const goToNextResponse = async () => {
    await googlePage.bringToFront();
    await googlePage.waitFor(4000);
    await googlePage.evaluate(async ()=>{
      let pageInputSelector = await document.querySelector(".freebirdFormeditorViewResponsesRecordviewNavigationLinksContainer > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input:nth-child(1)");
      await pageInputSelector.focus();
  
    });
    
    await googlePage.waitFor(400);
    if(startingPage > 0){
          responseNumber = startingPage;
          startingPage = startingPage-1;
          while(startingPage > 0){
            await googlePage.keyboard.press("ArrowUp");
            await googlePage.waitFor(10);
            startingPage =  startingPage -1;
        }
        await googlePage.keyboard.press("ArrowUp");
    }else{
          if(!firstResponse)
            await googlePage.keyboard.press("ArrowUp");
          else{
            firstResponse = false;
          }  
  }
    await googlePage.waitFor(6200);

}


const facebookLogin = async (postURL)=>{

    await facebookPage.bringToFront();
    await facebookPage.waitForSelector('button[name="login"]');
    await facebookPage.waitFor(1000);
    await facebookPage.type('input[id="email"]',facebookEmail);
    await facebookPage.waitFor(1000);
    await facebookPage.type('input[id="pass"]',facebookPassword);
    await facebookPage.click('button[name="login"]');
    await facebookPage.waitFor(3000);
    console.log("has logged in facebook account.");
}

const filter =  async (text) => {
	  let zuccWordDetected = "[Prohibited word detected - renamed zucc words to \"zucc\"]\n\n\n\n";
    let contentToFilter = ["in","this","array", "you", "can list the no-no words."];
    let wasAlreadyCensored = false;

    for (let index = 0; index < contentToFilter.length; index++) {
      if(text.toLowerCase().includes(contentToFilter[index])){
        if(!wasAlreadyCensored){ 
          individualResponseValue = zuccWordDetected + individualResponseValue;
          wasAlreadyCensored = true;
        }
        individualResponseValue = individualResponseValue.replace(contentToFilter[index],contentToFilter[index].toLowerCase());
        individualResponseValue = individualResponseValue.replace(contentToFilter[index],"zucc");
      }
    }
    individualResponseValue = individualResponseValue.replace(/(\r\n|\n|\r)/gm, "\n");
    if(individualResponseValue.length > 7999){
        individualResponseValue = "[LIMIT EXPLODED!!! bot detected a 8000 or bigger character length response, please try not to write the bible, its just a google form.]";
    }
    individualResponseValue = "[ " + responseNumber.toString() + " ]\n" + individualResponseValue;
    responseNumber++;
}

const postResponse = async () => {
    profileSelector = "#mount_0_0 > div > div:nth-child(1) > div.rq0escxv.l9j0dhe7.du4w35lb > div.rq0escxv.l9j0dhe7.du4w35lb > div > div > div.j83agx80.cbu4d94t.d6urw2fd.dp1hu0rb.l9j0dhe7.du4w35lb > div.l9j0dhe7.dp1hu0rb.cbu4d94t.j83agx80 > div.j83agx80.cbu4d94t > div > div > div > div > div > div.rq0escxv.l9j0dhe7.du4w35lb.qmfd67dx.hpfvmrgz.gile2uim.buofh1pr.g5gj957u.aov4n071.oi9244e8.bi6gxh9e.h676nmdw.aghb5jc5 > div > div > div > div > div > div > div > div > div > div > div:nth-child(2) > div > div:nth-child(4) > div > div > div.cwj9ozl2.tvmbv18p > div.ecm0bbzt.hv4rvrfc.e5nlhep0.dati1w0a.lzcic4wl.btwxx1t3.j83agx80 > div.nqmvxvec.s45kfl79.emlxlaya.bkmhp75w.spb7xbtv.a8c37x1j.fv0vnmcu.rs0gx3tq.l9j0dhe7 > div > div.q9uorilb.l9j0dhe7.pzggbiyp.du4w35lb > svg > g > image";
    await facebookPage.bringToFront();
    await facebookPage.goto(postURL,{waitUntil: 'load', timeout: 0});
    await facebookPage.waitFor(profileSelector);
    await facebookPage.waitFor(500);
    await facebookPage.click(profileSelector);
    await facebookPage.waitFor(1500);
    await facebookPage.waitFor(500);
    await facebookPage.keyboard.sendCharacter(individualResponseValue);
    await facebookPage.waitFor(500);
    await facebookPage.keyboard.press('ArrowRight');
    await facebookPage.waitFor(500);
    await facebookPage.keyboard.press('Space');
    await facebookPage.waitFor(500);
    await facebookPage.keyboard.press('Enter');
    await facebookPage.waitFor(4000);
    /**
     * debug mode
     */
    //await facebookPage.keyboard.down("Control");
    // await facebookPage.keyboard.press("KeyA");
    // await facebookPage.keyboard.up("Control");
    // await facebookPage.keyboard.press("Backspace");
    
    }



const interval = async ()=> {
  let timedResult;
  //5 min = 300000
  //1 min = 60000
  let maxMinutes = 5;
  for(let minutes = 1; minutes <= maxMinutes*2; minutes++){
    await facebookPage.waitFor(30000);
  timedResult = await hasResponses();
  console.log("round " +minutes+"/"+maxMinutes*2);
  if(timedResult)
    return;
    
  }
 
}    
const run = async () => {
    console.log("Bot is starting! Did you set the bot-config.json correctly? do not forget to check!");
    await setUpPages();
    await googleLogin();
    await facebookLogin(postURL);
    await goToForms(formURL);
    await goToNextResponse();
    while(hasResponsesLeft || !gaveInterval){
      hasResponsesLeft = await hasResponses();
        if(gaveInterval){
          await readResponse();
          await googlePage.waitFor(3000);
          await postResponse();
          individualResponseValue ="We got to the last response!" ;
          await postResponse();
          await interval();
        }else{
        await readResponse();
        await postResponse();
    }
    await goToNextResponse();
    await googlePage.waitFor(5000);
    
  }
    individualResponseValue = "No new response was given in the interval, closing!";
    await postResponse();
    await facebookPage.waitFor(5000);
    browser.close();
};
    



run();

   
  console.log(browser.wsEndpoint())
 })().catch((error)=>{
   
  console.error(error.message)
 });

# GFTFG
GFTFG (Google Forms To Facebook Groups), is a puppeteer based bot that can get Google Forms responses and comment every single one of them at a desired Facebook Group post.


**HOW TO USE**

 You need to make sure these 4 things are true:
  1.1: Your bot (a facebook account) is in the target group.
  1.2: You have access to the google form responses page.
  1.3: You have node at 10 > version installed.
  1.4: YOu have yarn installed.


 Now, we can start the configuration! Before anything, use "yarn" command to install all the necessary packages.
 
 Go to the bot-config.json file, fill in the information and execute the bot using "node main" command.


about bot-config.json fields:

startingPage: its the google form starting page at the individual view tab.

if startingPage is different from 0 or 1, make sure you set the "firstResponse" field to false.


 


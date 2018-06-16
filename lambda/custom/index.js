'use strict';

const _ = require('lodash');
const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
const AyrialService = require('./ayrialService');

AWS.config.update({
  region: 'us-east-1',
});

//secret key
//     /CAIcUBq5YVQa4hIQtSzUIR3MNdeuetDGhglk4zk

const states = {
  PHONE_NUMBER: '_PHONE_NUMBER',
  SEND_MESSAGE: '_SEND_MESSAGE',
  START: '_START',
};

const strings = require('./languageStrings');


// =================================================================================
//                              Universal Handlers
// =================================================================================

const canFullFillIntentHandler = {
  canHandle(handlerInput) {
      console.log("check if can handle reached");
      console.log("HanderlInput: ", JSON.stringify(handlerInput));
      return handlerInput.requestEnvelope.request.type === 'CanFulfillIntentRequest'
  },
  handle(handlerInput) {
    console.log("reached handle portion");
    if (handlerInput.requestEnvelope.request.intent.name === 'TipOfTheDayIntent'){
        return handlerInput.responseBuilder.withCanFulfillIntent({
          "canFulfill": "YES",
        }).getResponse();
    }else{
        return handlerInput.responseBuilder.withCanFulfillIntent({
          "canFulfill": "NO",
        }).getResponse();
    }
  }
}

const repeatAnyMessage = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput){
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        return handlerInput.responseBuilder.speak(attributes.prompt).reprompt(reprompt).getResponse();
    }
}

const endSession = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput){
        const prompt = strings.ClosingMessage;
        return handlerInput.responseBuilder.speak(prompt).getResponse();
    }
}

const helpRequest = {
    canHandle(handlerInput){
        return handlerInput.requestEnvelope.request.type === 'AMAZON.HelpIntent';
    },
    handle(handlerInput){
        const prompt = strings.Help.ask;
        const reprompt = strings.Help.reprompt;
        return handlerInput.responseBuilder.speak(prompt).reprompt(reprompt).getResponse();
    }
}

// =================================================================================
//                              Entry Handler
// =================================================================================

const LaunchHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const result =  request.type === 'LaunchRequest' || (request.type === 'IntentRequest' && request.intent.name === 'TipOfTheDay')
        console.log("newSessionHandler Result: ", result);
        return result;
    },
    handle(handlerInput){
        const response = strings.Launch.WelcomeFirstUser.ask;
        const reprompt = strings.Launch.WelcomeFirstUser.reprompt;
        setState(handlerInput, states.START, response, reprompt);
        var dbUpdate = {
            "speechUpdate" : response,
            "repromptSpeech" : reprompt
        }
        handlerInput.attributesManager.getPersistentAttributes()
        .then((data) => {
            console.log("data: ", data);
            resolve(handlerInput.responseBuilder.getResponse());
        })
        // handlerInput.attributesManager.setSessionAttributes(state);
        // handlerInput.attributesManager.setPersistentAttributes(dbUpdate);
        // return handlerInput.attributesManager.savePersistentAttributes()
        // .then(() => {
        //     resolve(handlerInput.responseBuilder
        //                 .speak(response)
        //                 .reprompt(reprompt)
        //                 .getResponse());
        // })
        // .catch((error) => {
        //     console.log("Error updating database ", error);
        // });
    }
}


// =================================================================================
//                              Tip State Handlers (states.START)
// =================================================================================
const tipRequested = {
    canHandle(handlerInput){
        console.log("start state canHandle");
        const state = determineState(handlerInput);
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.START && (intentName === 'TipOfTheDay' || intentName === 'AMAZON.YesIntent') );
    },
    handle(handlerInput){
        console.log("tip requested");
        return sayTipOfTheDay(handlerInput);
    }
};


const tipNotRequested = {
    canHandle(handlerInput){
        const state = determineState(handlerInput)
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.START && (intentName === 'AMAZON.NoIntent' || intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent'));
    },
    handle(handlerInput){
        console.log("tip not requested");
        setState(handlerInput, states.START);
        const prompt = strings.ClosingMessage;
        return handlerInput.responseBuilder
                .speak(prompt).getResponse();
    }
}

const unhandledTip = {
    canHandle(handlerInput){
        const state = determineState(handlerInput)
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.START);
    },
    handle(handlerInput){
        const prompt = strings.Launch.unhandledResponse;
        return handlerInput.responseBuilder
                .speak(prompt).getResponse();
    }
}


// =================================================================================
//                Send Message State Handlers (states.SEND_MESSAGE)
// =================================================================================
const sendMessage = {
    canHandle(handlerInput){
        const state = determineState(handlerInput);
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.SEND_MESSAGE && intentName === 'AMAZON.YesIntent');
    },
    handle(handlerInput){
        console.log("getting/asking phone number");
        //check if phone number is in database
        var prompt;
        var reprompt;
        const phonenumber = ""
        if (phonenumber){
            return sendTextMessage(handlerInput, true);
        }
        else{
            prompt = strings.Number.ask;
            reprompt = strings.Number.reprompt;
            setState(handlerInput, states.PHONE_NUMBER, prompt, reprompt);
            return handlerInput.responseBuilder
                    .speak(prompt).reprompt(reprompt).getResponse();
        }
    }
}

const dontSendMessage = {
    canHandle(handlerInput){
        const state = determineState(handlerInput);
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.SEND_MESSAGE && intentName === 'AMAZON.NoIntent');
    },
    handle(handlerInput){
        const prompt = strings.ClosingMessage;
        setState(handlerInput, states.START, prompt, "");
        return handlerInput.responseBuilder.speak(prompt).getResponse();
    }
}

const unhandledSendMessage = {
    canHandle(handlerInput){
        const state = determineState(handlerInput);
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.SEND_MESSAGE);
    },
    handle(handlerInput){
        const prompt = strings.UnhandledMessageReply.ask;
        const reprompt = strings.UnhandledMessageReply.reprompt;
        return handlerInput.responseBuilder.speak(prompt).reprompt(reprompt).getResponse();
    }
}


// =================================================================================
//                  Phone Number State Handlers (states.PHONE_NUMBER)
// =================================================================================

const phoneNumberIntent = {
     canHandle(handlerInput){
        const state = determineState(handlerInput);
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.PHONE_NUMBER && intentName === 'PhoneNumberIntent');
    },
    handle(handlerInput){
        return getPhoneNumber(handlerInput);
    }
}

const unhandledNumber = {
    canHandle(handlerInput){
        const state = determineState(handlerInput);
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        return (state === states.PHONE_NUMBER);
    },
    handle(handlerInput){
        const prompt = strings.unhandledNumber.ask;
        const reprompt = strings.unhandledNumber.reprompt;
        return handlerInput.responseBuilder.speak(prompt).reprompt(reprompt).getResponse();
    }
}



// =================================================================================
//                              ALEXA SKILL EXPORT
// =================================================================================


const APP_ID = 'amzn1.ask.skill.3fe84056-970f-4e59-9e1b-708510ad4315'
//'amzn1.ask.skill.677d2753-4ae5-4820-8f94-38e520188f20';

const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
                    .addRequestHandlers(
                                canFullFillIntentHandler,
                                LaunchHandler, 
                                repeatAnyMessage,
                                helpRequest,
                                tipRequested,
                                tipNotRequested,
                                unhandledTip,
                                sendMessage,
                                dontSendMessage,
                                unhandledSendMessage,
                                phoneNumberIntent,                                        
                                unhandledNumber
                                )
                    .withPersistenceAdapter(Adapter)
                    .withTableName('ayrial-365-alexa-skill')
                    .withSkillId(APP_ID)
                    .lambda();



                    
// =================================================================================
//                              HELPER FUNCTIONS
// =================================================================================

function determineState(handlerInput){
    try{
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        return attributes.state;
    }
    catch(error){
        console.log("Error Determining State: ", error);
        return '';
    }
}

function setState(handlerInput, state, currentPrompt, currentReprompt){
    var currentState = {
            "state" : state,
            "prompt" : currentPrompt,
            "reprompt" : currentReprompt
    };
    handlerInput.attributesManager.setSessionAttributes(currentState);
}

function sayTipOfTheDay(handler) {
    this.attributes.dateLastHeard = this.attributes.dateLastHeard || { day: -1, month: -1 };

    const { tipsHeard, lastKeyHeard, dateLastHeard } = this.attributes;

    AyrialService.getTip(tipsHeard, lastKeyHeard, dateLastHeard)
    .then((data) => {
        const reactionArray = strings.PositiveReaction;

        if (this.attributes.reactionIndex === undefined) {
            this.attributes.reactionIndex = 0;
        } else {
            this.attributes.reactionIndex += 1;
        }

        if (this.attributes.reactionIndex >= _.size(reactionArray)) {
            this.attributes.reactionIndex = 0;
        }
        
        const dbInfo = {
            tipsHeard : data.tipsHeard,
            lastKeyHeard : data.lastKeyHeard,
            lastLink : data.link,
            dateLastHeard : data.dateLastHeard
        }
        
        const tip = parseWords(data.tip.toLowerCase());
        const prompt = reactionArray[this.attributes.reactionIndex] + tip + strings.TipOfTheDay.ask;
        const reprompt = strings.TipOfTheDay.reprompt;
        setState(handler, states.SEND_MESSAGE, prompt, reprompt);
        return handler.responseBuilder.speak(prompt).reprompt(reprompt).getResponse();
    })
    .catch((err) => {
        console.log(handler.requestEnvelope.request.intent.name, 'tipOfTheDayRequest', 'err', err);
        const prompt = "There was an error getting the Tip of the Day, Sorry.";
        return handler.responseBuilder.speak(prompt).getResponse();
    });
}


function sendTextMessage(handler, isFirstTime) {
    this.handler.state = states.START;

    const valuesInSpeech = {
        link: this.attributes.lastLink,
        interpolation: { escapeValue: false },
    };

    const sms = this.t('MessageSent.SMS', valuesInSpeech);

    this.attributes.lastLink = undefined;

    AyrialService.sendMessage(this.attributes.phoneNumber, sms)
    .then(() => {
        let speechOutput = this.t('MessageSent.tell');

        if (isFirstTime) {
            speechOutput = `${this.t('MessageSent.NumberSaved')} <break time='0.5s'/> ${speechOutput}`;
        }

        this.emit(':tell', speechOutput);
    })
    .catch((err) => {
        console.log(this.event.request.intent.name, 'isFirstTime err', !!isFirstTime);
        console.log(this.event.request.intent.name, 'messageRequest', 'err', err);
        this.emit(':tell', this.t('Error'));
    });
}

function getPhoneNumber(handler) {
    const phoneNumber = _.get(this, 'event.request.intent.slots.phoneNumber.value', '').toLowerCase();

    if (phoneNumber) {
        AyrialService.getNumberInformation(phoneNumber)
        .then((data) => {
            console.log('data', data);

            if (data.status === 404) {
                this.attributes.speechOutput = this.t('InvalidNumber.ask', { phoneNumber });
                this.attributes.repromptSpeech = this.t('InvalidNumber.reprompt');

                this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);

                return;
            }

            this.attributes.phoneNumber = data.phoneNumber;
            this.attributes.speechOutput = this.t('ConfirmNumber.ask', { phoneNumber });
            this.attributes.repromptSpeech = this.t('ConfirmNumber.reprompt', { phoneNumber });

            this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
        })
        .catch((err) => {
            console.log(this.event.request.intent.name, 'err', err);

            this.attributes.speechOutput = this.t('InvalidNumber.ask', { phoneNumber });
            this.attributes.repromptSpeech = this.t('InvalidNumber.reprompt');

            this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
        });
    }else {
        this.attributes.repromptSpeech = this.t('Number.reprompt');
        this.attributes.speechOutput = `${this.t('Unhandled')} <break time='0.5s'/> ${this.attributes.repromptSpeech}`;
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    }

function parseWords(text) {
  _.forEach(MAPPING, (value, key) => {
    text = text.split(key).join(value);
  });

  return text;
}
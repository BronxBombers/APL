+'use strict';

module.exports = {
      Launch: {
        WelcomeFirstUser: {
          ask: 'Welcome to the AYRIAL Positive living skill. I can tell you the tip of the day. Do you want to hear it?',
          reprompt: 'Would you like to hear AYRIAL Positive living tip of the day?',
        },
        WelcomeReturningUser: {
          ask: 'Welcome back! Would you like to hear AYRIAL Positive living tip of the day?',
          reprompt: 'Would you like to hear AYRIAL Positive living tip of the day?',
        },
        unhandledResponse: {
            ask: "Sorry I didn't understand that. Please confirm whether you want to hear the tip of the day"
        }
      },

      TipOfTheDay: {
        ask: '<break time="0.5s"/> Would you like me to send member information via weblink to your mobile device?',
        reprompt: 'Would you like me to send member information via weblink to your mobile device?',
      },
      Number: {
        ask: 'Ok, what is your phone number?',
        reprompt: 'What is your phone number?',
      },

      unhandledNumber: {
        ask: "Sorry I didn't understand that. Please say your phone number.",
        reprompt: "What is your phone number?"
      },

      ConfirmNumber: {
        ask: 'I just heard <say-as interpret-as="telephone"> {{phoneNumber}} </say-as> <break time="0.5s"/> Is this correct?',
        reprompt: 'I heard <say-as interpret-as="telephone"> {{phoneNumber}} </say-as> <break time="0.5s"/> Is this correct?',
      },

      InvalidNumber: {
        ask: 'Sorry, <say-as interpret-as="telephone"> {{phoneNumber}} </say-as> is not a valid number. Let\'s try again',
        reprompt: 'What is your phone number?',
      },

      ClosingMessage: 'Ok. Tune in tomorrow for another AYRIAL Positive living tip. Explore AYRIAL.com to connect with a vetted lifestyle consultant to enhance your way of living. Goodbye',

      MessageSent: {
        SMS: 'From AYRIAL Positive Living: {{link}}',
        NumberSaved: 'Great. Next time, I will not ask you for your number',
        tell: 'I just sent the information in a text message to your phone. Tune in tomorrow for another AYRIAL Positive living tip. Explore AYRIAL.com to connect with a vetted lifestyle consultant to enhance your way of living. Goodbye.',
      },

      UnhandledMessageReply : {
          ask: "I didn't understand your response. Say Yes to receive your daily tip by text, or No, to not receive it.",
          reprompt: "Would you like me to send member information via weblink to your mobile device."
      },

      PositiveReaction: [
        'Happy you tuned in!',
        'Hi!',
        'Hello!',
        'Check this out',
        'Here\'s a hot tip.',
        'Here\'s something new',
        'Why not try this tip?',
        'Greetings!',
        'Happy day!',
      ],

      Help: {
        ask: 'With AYRIAL Positive living, you can listen to the tip of the day. You just need to ask for it and I\'ll play it. ' +
        'You can also receive a link with more information about the Spotlight to your phone via SMS. ' +
        'So, do you want to hear AYRIAL Positive living tip of the day?',
        reprompt: 'Do you want to hear AYRIAL Positive living tip of the day?',
      },
      Error: 'Sorry, there was a problem communicating with the server. Come back soon to check out more AYRIAL tips. Goodbye',
      Unhandled: 'Sorry, I didn\'t understand what you said',
      Exit: 'Ok. Goodbye.',
};

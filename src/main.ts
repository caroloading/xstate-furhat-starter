import { setup, createActor, fromPromise, assign } from "xstate";

const FURHATURI = "127.0.0.1:54321";

async function fhVoice(name: string) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  const encName = encodeURIComponent(name);
  return fetch(`http://${FURHATURI}/furhat/voice?name=${encName}`, {
    method: "POST",
    headers: myHeaders,
    body: "",
  });
}

async function fhAttend() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/attend?user=CLOSEST`, {
    method: "POST",
    headers: myHeaders,
    body: "",
  });
}

async function fhSay(text: string) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  const encText = encodeURIComponent(text);
  return fetch(`http://${FURHATURI}/furhat/say?text=${encText}&blocking=true`, {
    method: "POST",
    headers: myHeaders,
    body: "",
  });
}

async function LookDoubtful() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/gesture?blocking=false`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      name: "LookDoubtful",
      frames: [
        {
          time: [0.50,1.5], //ADD THE TIME FRAME OF YOUR LIKING
          persist: true,
          params: {
            NECK_ROLL: -35.0,
            BROW_DOWN_LEFT : 1.0,
            BROW_UP_RIGHT : 1.0,            
            BROW_IN_LEFT : 0.7,            
            BROW_IN_RIGHT : 1.0,            
            EYE_SQUINT_LEFT: 0.7,
            EYE_SQUINT_RIGHT: 0.4,
            SMILE_CLOSED: 0.4
            //ADD PARAMETERS HERE IN ORDER TO CREATE A GESTURE
          },
        },
        {
          time: [2.0], //ADD TIME FRAME IN WHICH YOUR GESTURE RESETS
          persist: true,
          params: {
            reset: true,
          },
        },
        {
          time: [0.0, 1.0], //ADD TIME FRAME IN WHICH YOUR GESTURE RESETS
          persist: false,
          params: {
            audio: "https://github.com/caroloading/xstate-furhat-starter/blob/4e95d8644084b6c556691632d45effcbdf04804d/src/Whirring.mp3",
          },
        },
      ],
      class: "furhatos.gestures.Gesture",
    }),
  });
}

async function LookSurprised() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/gesture?blocking=false`, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      name: "LookSurprised",
      frames: [
        {
          time: [0.50,1.0], //ADD THE TIME FRAME OF YOUR LIKING
          persist: true,
          params: {
            NECK_TILT: -10.0,
            BROW_UP_LEFT : 1.0,
            BROW_UP_RIGHT : 1.0,
            EYE_SQUINT_LEFT: 1.0,
            EYE_SQUINT_RIGHT: 1.0,
            SMILE_OPEN: 0.6,
            LOOK_DOWN: 0.5
            //ADD PARAMETERS HERE IN ORDER TO CREATE A GESTURE
          },
        },
        {
          time: [1.0,1.5], //ADD THE TIME FRAME OF YOUR LIKING
          persist: true,
          params: {
            NECK_ROLL: 20.0,
            EYE_SQUINT_LEFT: 1.0,
            EYE_SQUINT_RIGHT: 1.0,
            SMILE_CLOSED: 0.6,
            LOOK_DOWN_RIGHT: 0.5
            //ADD PARAMETERS HERE IN ORDER TO CREATE A GESTURE
          },
        },
        {
          time: [2.0], //ADD TIME FRAME IN WHICH YOUR GESTURE RESETS
          persist: true,
          params: {
            reset: true,
          },
        },
      ],
      class: "furhatos.gestures.Gesture",
    }),
  });
}

async function fhGesture(text: string) {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(
    `http://${FURHATURI}/furhat/gesture?name=${text}&blocking=true`,
    {
      method: "POST",
      headers: myHeaders,
      body: "",
    },
  );
}

async function fhListen() {
  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  return fetch(`http://${FURHATURI}/furhat/listen`, {
    method: "GET",
    headers: myHeaders,
  })
    .then((response) => response.body)
    .then((body) => body.getReader().read())
    .then((reader) => reader.value)
    .then((value) => JSON.parse(new TextDecoder().decode(value)).message);
}

const dmMachine = setup({
  actors: {
    fhVoice: fromPromise<any, null>(async () => {
      return fhVoice("en-US-EchoMultilingualNeural");
    }),
    fhHello: fromPromise<any, null>(async () => {
      return fhSay("Hi");
    }),
    fhSpeak: fromPromise<any, string>(async (input) => {
      return fhSay(input.input);
    }),
    fhL: fromPromise<any, null>(async () => {
     return fhListen();
    }),
    fhDoubtful: fromPromise<any, null>(async () => {
     return LookDoubtful();
    }),
    fhSurprise: fromPromise<any, null>(async () => {
     return LookSurprised();
    }),
    fhAttend: fromPromise<any, null>(async () => {
      return fhAttend();
    })
  },
}).createMachine({
  context: {
    last_user_utterance: ""
  },
  id: "root",
  initial: "Prepare",
  states: {
    Prepare: { 
      initial: "Voice",
      states: {
        Voice: {
          invoke: {
            src: "fhVoice",
            input: null,
            onDone: {
            target: "Attention",
            actions: ({ event }) => console.log(event.output),
            },
          },
        },
        Attention:{
          invoke: {
            src: "fhAttend",
            input: null,
          },
        }
      },
      after: { 1000: "Next" } },
    Next: {
      invoke: {
        src: "fhHello",      
        input: null,
        onDone: {
          target: "Listen",
          actions: ({ event }) => console.log(event.output),
        },
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      },
    },
    Listen: {
      id: "Listen",
      invoke: {
        src: "fhL",
        input: null,
        onDone: [
          {
          target: "Doubt",
          guard: ({event}) => event.output == "",
          actions: ({ event }) => console.log(event.output),
          },
          {
          target: "Surprise",
          actions: ({ event }) => console.log(event.output),
          }],
        onError: {
          target: "Fail",
          actions: ({ event }) => console.error(event),
        },
      }
    },
    Fail: {
      id: "Fail",
      invoke: {
        src: "fhSpeak",      
        input: "Sorry, give me a second. Something went wrong.",
        onDone: {
          target: "#Listen",
          actions: ({ event }) => console.log(event.output),
        },
        onError: {
              target: "#Fail",
              actions: ({ event }) => console.error(event),
        },
      }
    },
    Doubt:{
      type: "parallel",
      states: {
        Face: {
          invoke: {
            src: "fhDoubtful",
            input: null,
            onError: {
              target: "#Fail",
              actions: ({ event }) => console.error(event),
            },
          }
        },
        /*Say: {
          invoke: {
            src: "fhSpeak",      
            input: "I don't understand", 
            onDone: {
                target: "#Listen",
                actions: ({ event }) => console.log(event.output),
            },
            onError: {
              target: "#Fail",
              actions: ({ event }) => console.error(event),
            },
          },
        },*/
      },
    },
    Surprise:{
      type: "parallel",
      states: {
        Face: {
          invoke: {
            src: "fhSurprise",
            input: null,
            onDone: {
              target: "#Goodbye",
              actions: ({ event }) => console.log(event.output),
            },
            onError: {
              target: "#Fail",
              actions: ({ event }) => console.error(event),
            },
          }
        },
        Say: {
          invoke: {
            src: "fhSpeak",      
            input: "Oh! You asked my name! My name is Kione.",
            onError: {
              target: "#Fail",
              actions: ({ event }) => console.error(event),
            },
          },
        }
      }
    },
    Goodbye: {
      id: "Goodbye",
      invoke: {
        src: "fhSpeak",      
        input: "Oh! You asked my name! My name is Kione.",
        onError: {
              target: "#Fail",
              actions: ({ event }) => console.error(event),
        },
      }
    }
  },
});

const actor = createActor(dmMachine).start();
console.log(actor.getSnapshot().value);

actor.subscribe((snapshot) => {
  console.log(snapshot.value);
});
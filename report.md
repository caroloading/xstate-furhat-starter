# Report Lab 3

## Demo interaction

The demo interaction should go like this:

Sys: * hums *
Sys: Oh, hi!
User: * no input *
Sys: I don't understand.
User: I said, what's your name?
Sys: Oh! You asked my name! My name is Kione.
Sys: See you later!

## Challenges

The biggest challenge of this lab was getting started with the remote API. It was difficult at first to understand how to implement gestures in typescript, as I was unsure which parameters could be passed on. Adapting tutorials from Kotlin to a use-case with the API was harder than I thought. 

Once I found the list of gesture Basic Params, it was then smooth to create new gestures even though it involved a lot of testing to see exactly what each parameter controled. For example, I had to test out the NECK_TILT and NECK_ROLL parameters individually to understand which one controled the head left to right, and which one controled the head up and down.

Another challenge I had was including audio. My first intuition, based on the Kotlin tutorials, was to add it to a time frame when defining my gesture. I then realized with the help of Viktoria that rather than have it in the gesture itself, I should call the 'voice' in the same way as I do when calling speech, but with the url to the audio I wanted to use. I chose to include an audio of someone humming, as if Furhat was distracted before the interaction. 
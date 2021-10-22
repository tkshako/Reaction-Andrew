class Game {
    win() {
        console.log('Wow, you figured it out!')
        new Audio('sounds/closer.mp3').play()
    }
}

let game = new Game()

const viewerGoal = 100000
let viewers = []
let started = false
let intro = false
let win = false

let eventTimeout = null
let eventActive = false
let eventAnswer = null

$(function() {
    console.log('%cWhat are you doing here?', 'color:red; font-size: 32pt')
    console.log('It\'s not like there\'s a secret way to win from the console, like typing \'game.win()\' or something...')
    
    window.addEventListener("keydown", function(event) {
        if (event.defaultPrevented) {
            return
        }

        if (event.code == "Space") {
            if (!intro) {
                intro = true
                $("h1").text('Reaction Andrew: The Game')
                new Audio('sounds/intro.mp3').play()
            } else if (!started) {
                started = true
                setTimeout(startEvent, 1000)
            }
        } else {
            eventHitHandler(event.code)
        }
        
    })
})

function getEventDuration() {
    let mod = 0
    if (viewers.length >= 10) {
        mod = Math.log10(viewers.length)
    }

    return 2000 - (250 * mod)
}

function getEventDowntimeDuration() {
    return randomNum(500,5000)
}

function startEvent() {
    if (win) {
        return
    }

    doEvent()

    let duration = getEventDuration()
    eventActive = true
    eventTimeout = setTimeout(function() {
        eventMissedHandler()
    }, duration);
}

function eventMissedHandler() {
    if (win) {
        return
    }

    $('#content').css('background-image', 'url(pog)')
    updateViewers(false)
    clearEvent()
}

function eventHitHandler(key) {
    if (win || !eventActive) {
        return
    }

    doReact(key)

    if (key != eventAnswer) {
        eventMissedHandler()
    } else {
        updateViewers(true)
        clearEvent()
    }
}

function clearEvent() {
    if (win) {
        return
    }

    eventActive = false
    clearTimeout(eventTimeout)

    setTimeout(function() {
        startEvent()
    }, getEventDowntimeDuration())
}

function updateViewers(add) {
    let num = 0
    if (add) {
        num = Math.max(1, Math.ceil(viewers.length * 0.1))
    } else {
        num = -Math.ceil(viewers.length * 0.25)
    }

    addViewers(num)
    $("#viewerCount").text(viewers.length)
    boostChat(add)

    if (viewers.length > viewerGoal) {
        win = true
        eventActive = false
        clearTimeout(eventTimeout)
        setTimeout(function() {
            new Audio('sounds/win.mp3').play()
        }, 3000)
    }
}

function addViewers(num) {
    if (num < 0) {
        for (let i = 0; i < Math.abs(num); i++) {
            viewers.shift()
        }
    }
    else if (num > 0) {
        for (let i = 0; i < num; i++) {
            viewers.push(getUserName())
        }
    }
}

function doEvent() {
    new Audio('sounds/react.mp3').play()
    let event = getRandom(events)
    eventAnswer = event.answer
    $('#content').css('background-image', 'url(' + event.image + ')')
}

let imageTimeout = null
let previous = null
function doReact(key) {
    reacts = null
    if (key == "KeyP") {
        reacts = pogReacts
    } else {
        reacts = weirdReacts
    }

    react = getRandom(reacts)
    while (react.name == previous) {
        react = getRandom(reacts)
    }
    previous = react.name

    gif = 'images/' + react.name + '.gif'
    timeout = react.time

    $('#camImg').attr('src', gif)

    clearTimeout(imageTimeout)
    imageTimeout = setTimeout(function() {
        $('#camImg').attr('src', 'images/andrew.png')
    }, timeout)

    new Audio('sounds/' + react.name + '.mp3').play()

    $('#content').css('background-image', 'url(pog)')
}

function resetChat() {
    clearTimeout(chatTimeout)
    chat()
}

let chatId = 0
let maxChats = 30
let chatTimeout = null
let chatBoost = false
let goodBoost = true
function chat() {
    if (viewers.length > 0) {
        $('#chat>ul').append('<li id="chat' + chatId + '">' + getChatMessage() + '</li>')
        chatId = (chatId + 1) % maxChats

        chatIdToRemove = (chatId + 1) % maxChats
        $('#chat' + chatIdToRemove).remove()
    }

    chatTimeout = setTimeout(chat, calculateChatTimeout())
}

function calculateChatTimeout() {
    if (viewers.length == 0) {
        return 1
    }

    let timeout = 0
    if (viewers.length <= 10) {
        timeout = 30000 - (10000 * (viewers.length / 10)) + randomNum(-5000, 5000)
    } else if (viewers.length <= 100) {
        timeout = 20000 - (15000 * (viewers.length / 90)) + randomNum(-1000, 1000)
    } else if (viewers.length <= 1000) {
        timeout = 5000 - (4000 * (viewers.length / 900)) + randomNum(-200, 200)
    } else if (viewers.length <= 10000) {
        timeout = 1000 - (900 * (viewers.length / 9000)) + randomNum(-50, 50)
    } else {
        timeout = 100 - (90 * viewers.length / 90000) + randomNum(-5, 5)
    }

    if (chatBoost) {
        timeout /= 10
    }

    return timeout
}

function getChatMessage() {
    return '<span style="color:' + getRandom(colors) + '">' + getRandom(viewers) + ': </span>' + getMessage()
}

function getMessage() {
    if (chatBoost) {
        if (goodBoost == true) {
            return getRandom(goodMessages)
        } else {
            return getRandom(badMessages)
        }
    } else {
        return getRandom(neutralMessages)
    }
}

function getUserName() {
    let prefix = getRandom(adjectives)
    let suffix = getRandom(animals)
    return capitalize(prefix) + capitalize(suffix) + randomNum(1, 1000)
}

function getRandom(arr) {
    return arr[randomNum(0, arr.length)]
}

function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

function boostChat(good) {
    setTimeout(function() {
        chatBoost = true

        if (good) {
            goodBoost = true
        } else {
            goodBoost = false
        }

        setTimeout(function() {
            chatBoost = false
        }, 5000)

        resetChat()
    }, 1000)
}

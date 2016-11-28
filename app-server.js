'use strict'
const express = require('express');
const app = express();
const _ = require('underscore');

let connections = [];
let audience = [];
let speaker = {};
let title = 'Untitled Presentation'
let questions = require('./app-questions');
let currentQuestion = false;
let results = {
  a: 0,
  b: 0,
  c: 0,
  d: 0
}


app.use(express.static('./public'));
app.use(express.static('./node_modules/bootstrap/dist'));



const server = app.listen(process.env.PORT || 3000);
const io = require('socket.io').listen(server);

io.sockets.on('connection', (socket)=>{

  socket.once('disconnect', function(){

    let member = _.findWhere(audience, { id: this.id });

    if (member){
      audience.splice(audience.indexOf(member), 1);
      io.sockets.emit('audience', audience);
      console.log('Left: %s (%s audience members)', member.name, audience.length);
    } else if (this.id === speaker.id){
      console.log("%s has left. '%s' is over.", speaker.name, title);
      speaker = {}
      title = 'Untitled Presentation';
      io.sockets.emit('end', { title: title, speaker: '' });
    }

    connections.splice(connections.indexOf(socket), 1);
    socket.disconnect();
    console.log(`disconnected: ${connections.length} sockets remaining.`)
  });

  socket.on('join', function(payload){
    let newMember = {
      id: this.id,
      name: payload.name,
      type: 'member'
    };
    this.emit('joined', newMember);
    audience.push(newMember);
    io.sockets.emit('audience', audience);
    console.log("Audience Joined %s", payload.name);
  })

  socket.on('start', function(payload){
    speaker.name = payload.name;
    speaker.id = this.id;
    speaker.type = 'speaker';
    title = payload.title;
    this.emit('joined', speaker);
    io.sockets.emit('start', { title: title, speaker: speaker.name });
    console.log("Presentation Started: '%s' by %s", title, speaker.name);
  })

  socket.on('ask', function(question){
      currentQuestion = question;
      results = { a: 0, b: 0, c: 0, d: 0 };
      io.sockets.emit('ask', currentQuestion);
      console.log("Question Asked: '%s'", question.q);
  });

  socket.on('answer', function(payload){
    results[payload.choice]++;
    io.sockets.emit('results', results);
    console.log("Answer: '%s' - %j", payload.choice, results);
  });

  socket.emit('welcome', {
    title: title,
    audience: audience,
    speaker: speaker.name,
    questions: questions,
    currentQuestion: currentQuestion,
    results: results
  });

  connections.push(socket);
  console.log(`connected: %s sockets connected`, connections.length);
});


console.log('Polling server is running at localhost:3000');

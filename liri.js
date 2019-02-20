// Read and set environment variables
require("dotenv").config();
// Import the node-spotify-api NPM package.
var Spotify = require("node-spotify-api");
// Import the API keys
var keys = require("./keys");
// Import moment and axios npm package.
var axios = require('axios');
var moment = require("moment");
// Import the FS package for read/write.
var fs = require("fs");
// Initialize the spotify API client using our client id and secret
var spotify = new Spotify(keys.spotify);

// Store the action/command
var action = process.argv[2];
// Joining the remaining arguments
var input = process.argv.slice(3).join(" ");

// Commands for liri 
//concert-this, spotify-this-song, movie-this, do-what-it-says
switch (action) {
    case "concert-this":
        getConcert(input);
        break;

    case "spotify-this-song":
        getSong(input);
        break;

    case "movie-this":
        getMovie(input);
        break;

    case "do-what-it-says":
        getRandom();
        break;

    //If no command is entered, this is the default message to user
    default:
        console.log("\nYou must pass an argument [concert-this, spotify-this-song, movie-this, do-what-it-says] and a value");
        console.log("\nFor Example: node liri.js concert-this Iron Maiden");
}


function getConcert(input) {
    if (!input) {
        input = "Iron Maiden"
    };
    // Remove quotes from the ends of input string.
    input = input.replace(/^"(.*)"$/, '$1');

    axios.get('https://rest.bandsintown.com/artists/' + input + '/events?app_id=codingbootcamp')
        .then(function (response) {
            var bands = response.data;
            var venueName = bands[0].venue.name;
            var venueCity = bands[0].venue.city;
            var venueRegion = bands[0].venue.region;
            var venueCountry = bands[0].venue.country;
            var timeUTC = bands[0].datetime;
            // LOG--Venue Name
            console.log(input + "'s next show is at: " + venueName + '.');
            // LOG--Venue Location
            console.log("Located in " + venueCity + ', ' + venueRegion + ', ' + venueCountry + '.');
            // LOG--Date of the event
            // Moment turns timeUTC to MM/DD/YYYY
            var time = moment(timeUTC).format('MM/DD/YYYY');
            console.log('On ' + time);
            console.log('\n=============================')
        })
        .catch(function (error) {
            console.log(error.response.data);
            console.log('Please try again!');
        });
}

function getSong(input) {
    if (!input) {
        input = "The Winner Takes It All";
    }

    spotify
        .search({ type: 'track', query: input, limit: 3}, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            for (var i = 0; i < data.tracks.items[0].album.artists.length; i++) {
                console.log("Artist(s): " + data.tracks.items[0].album.artists[i].name);
                console.log("Song: " + data.tracks.items[0].name);
                console.log("Album: " + data.tracks.items[0].album.name);
                console.log("Song Link: " + data.tracks.items[0].external_urls.spotify);
            }
        });
}

function getMovie(input) {
    if (!input) {
        var movieName = "The+Godfather";
        console.log("You have not entered a movie to search for but...");
        console.log("If you haven't watched 'The Godfather', then you should: https://www.imdb.com/title/tt0068646/");
        console.log("It's on Netflix Too!");
        console.log("Seriously, watch it. It's a classic.")
    }
    else {
        // Prepare the input for axios get function
        // If movie has more than 1 word replace " " with "+"
        movieName = input.split(" ");
        movieName = movieName.join("+");
    }
    // Then run a request with axios to the OMDB API with the movie specified
    var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

    axios.get(queryUrl).then(
        function (response) {
            console.log("Movie title: " + response.data.Title);
            console.log("Release Year: " + response.data.Year);
            console.log("The movie's rating is: " + response.data.imdbRating);
            console.log("Rotten Tomatoes Rating: " + response.data.Ratings[1].Value);
            console.log("Country where the movie was produced: " + response.data.Country);
            console.log("Language of the movie: " + response.data.Language);
            console.log("Plot: " + response.data.Plot);
            console.log("Actors: " + response.data.Actors);
        })
        .catch(function (error) {
            console.log(error);
            console.log('Please try again!');
        });
}

function getRandom() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");

        if (dataArr[0] === "spotify-this-song") {
            getSong(dataArr[1]);
        }
        else if (dataArr[0] === "movie-this") {
            getMovie(dataArr[1]);
        }
        else if (dataArr[0] === "concert-this") {
            getConcert(dataArr[1]);
        }
        else {
            console.log("Nothing to do!");
        }
    });
}
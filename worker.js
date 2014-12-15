var timers = require("timers"),
    http = require("http"),
    async = require ("async"),
    ___backgroundTimer;

process.on('message',function(msg){

    var  ___wxArray = [];

    this._longRunningTask = function(data){

        ___wxArray = [];

        Object.keys(data).forEach(function(data){
            var stationAsyncConstructor = function(callback){
                callback (null, data.toUpperCase());
            }.bind(this)
            ___wxArray.push(stationAsyncConstructor);
        }.bind(this))
    }

    /**
     * Asynchronous background task for loading weather station data
     * Utilizes: https://github.com/caolan/async#parallel
     * @param data An array of functions that include the GET requests
     * @private
     */
    this._async = function(/* Array */ data){

        try{
            async.parallel(data,function(err,results){
                console.log("Station data retrieved! COUNT = " + results.length);

                try{
                    var data = {
                        "content":results
                    }
                    process.send(data);
                }
                catch(err){
                    console.log("retriever.js: " + err.message + "\n" + err.stack);
                }

            })
        }
        catch(err){
            console.log("_async() " +  err.message + ", " + err.stack);
        }
    }

    this._startTimer = function(){
        var count = 0;

        ___backgroundTimer = timers.setInterval(function(){

            try{
                var date = new Date();
                console.log("retriever.js: datetime tick: " + date.toUTCString());
                this._longRunningTask(msg.content);
                this._async(___wxArray);
            }
            catch(err){
                count++;
                if(count == 3){
                    console.log("retriever.js: shutdown timer...too many errors. " + err.message);
                    clearInterval(___backgroundTimer);
                    process.disconnect();
                }
                else{
                    console.log("timer.js: " + err.message + "\n" + err.stack);
                }
            }
        }.bind(this),msg.interval);
    }

    this._init = function(){
        if(msg.content != null || msg.content != "" && msg.start == true){
            this._longRunningTask(msg.content);
            this._async(___wxArray);
            this._startTimer();
        }
        else{
            console.log("retriever.js: content empty. Unable to start timer.");
        }
    }.bind(this)()

})

process.on('uncaughtException',function(err){
    console.log("retriever.js: " + err.message + "\n" + err.stack + "\n Stopping background timer");
    clearInterval(___backgroundTimer);
})
/*
    Copyright (c) 2009 prodigic inc.

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    Neither the name(s) of the author(s) or copyright holder(s) nor 
    the names of its contributors may be used to endorse or promote 
    products derived from this software without specific prior 
    written permission.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

(function(){

// override uneval to provide common functionality xbrowser
uneval = JSON.stringify;

var log = (window.console && window.console.firebug) ? window.console.log : function(){};

var MIX121 = { 
    serverURL   : "http://evtsvr.121mix.com/test"
,   slots       : {}
,   DOMTAG      : ".mix121" 
};

MIX121.registerSlot = function(slotid, slotlabels){
    MIX121.slots[slotid] = { labels : [] } ;

	$.each(slotlabels.split(/ /), function(){
		if (this.indexOf(":") > -1) {
			var kvp = this.split(/:/);
			MIX121.slots[slotid][kvp[0]] = kvp[1];
		}
		else {
			MIX121.slots[slotid].labels.push(this.toString());
		}
	});
	
	if (slotlabels.length > 0) {
		delete MIX121.slots[slotid].labels;
	}
	
    $('#'+slotid).addClass('registered');
};

MIX121.send = function(message, callback){
	$.getJSON(MIX121.reqURL + "?callback=?", { json: JSON.stringify(message) }, callback);
};

MIX121.put = function(message, callback) { //TBD
	$.getJSON(MIX121.notifyURL + "?callback=?", { json: JSON.stringify(message) }, callback);
};

MIX121.onJSON = function onJSON(data){
    $.each(data, function() { $.extend(MIX121.slots[this.slotid], this); });

    $(MIX121.DOMTAG).each(function() {
		if ($(this).hasClass('registered')){
			if (this.id == 'pagestyle' && MIX121.slots[this.id].offer.length > 0 ) {
				$('BODY').addClass('style_A');
			} else {
				this.innerHTML = MIX121.slots[this.id].offer;
			}
		}
	});

    $(MIX121.DOMTAG).click(function(){
        var targetData = {
            offerid      : (MIX121.slots[this.id]) ? MIX121.slots[this.id].offerid : ""
        ,   slotlabels   : (MIX121.slots[this.id]) ? MIX121.slots[this.id].labels  : ""
        ,   domid        : this.id
        };
        MIX121.put($.extend(targetData,{ channelMeta : MIX121.channelMeta}));
    });

    $(MIX121.DOMTAG+'ClickLink').click(function(){
        var targetData = {
            type   : "goal"
        ,   name   : "ClickLink"
        ,   target : this.href 
        };
        MIX121.put($.extend(targetData,{ channelMeta : MIX121.channelMeta}));
    });
};

MIX121.init = function(pubId, config){
    MIX121.publisherId	= pubId; // TODO needs error handling
	MIX121.serverURL    = config.URL           || MIX121.serverURL;
    MIX121.DOMTAG   	= config.domTag        || MIX121.DOMTAG;
	MIX121.channelMeta	= config.channelMeta   || {};
	
	MIX121.reqURL	 	= [MIX121.serverURL,MIX121.publisherId].join('/');
	MIX121.notifyURL 	= [MIX121.serverURL,MIX121.publisherId,'notify'].join('/');
	
	MIX121.channelMeta 	= $.extend({ 
			referrer	: document.referrer 
		,	GMTOffset 	: (new Date().getTimezoneOffset()/60)
		,	screenWidth : screen.width
		,   screenHeight: screen.height 
		}
		, MIX121.channelMeta);

    MIX121.send({ 
		slots: MIX121.slots 
	, 	channelMeta : MIX121.channelMeta
	} , MIX121.onJSON ); 
};

window.mx = MIX121;

})();



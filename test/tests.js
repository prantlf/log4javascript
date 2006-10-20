function array_contains(arr, val) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == val) {
			return true;
		}
	}
	return false;
}

// Recursively checks that obj2's interface contains all of obj1's
// interface (functions and objects only)
function compareObjectInterface(obj1, obj1_name, obj2, obj2_name, namePrefix) {
	if (!namePrefix) {
		namePrefix = "";
	}
	var obj1PropertyNames = new Array();
	for (var i in obj1) {
		if (i != "prototype" && i != "arguments") {
			obj1PropertyNames.push(i);
		}
	}
	if (obj1 && obj1.prototype && !array_contains(obj1PropertyNames, "prototype")) {
		obj1PropertyNames.push("prototype");
	}
	for (var j = 0; j < obj1PropertyNames.length; j++) {
		var propertyName = obj1PropertyNames[j];
		if ((typeof obj1[propertyName] == "function" || typeof obj1[propertyName] == "object") && !(obj1[propertyName] instanceof Array)) {
			var propertyFullyQualifiedName = (namePrefix == "") ? propertyName : namePrefix + "." + propertyName;
			try {
				if (typeof obj2[propertyName] == "undefined") {
					throw new Error(obj2_name + " does not contain " + propertyFullyQualifiedName + " in " + obj1_name);
				} else if (typeof obj2[propertyName] != typeof obj1[propertyName]){
					throw new Error(obj2_name + "'s " + propertyFullyQualifiedName + " is of the wrong type: " + typeof obj2[propertyName] + " when it is type " + typeof obj1[propertyName] + " in " + obj1_name);
				} else if (obj1[propertyName] != Function.prototype.apply) {
					if (!compareObjectInterface(obj1[propertyName], obj1_name, obj2[propertyName], obj2_name, propertyFullyQualifiedName)) {
						throw new Error("Interfaces don't match");
					}
				}
			} catch(ex) {
				throw new Error("Exception while checking property name " + propertyFullyQualifiedName + " in " + obj2_name + ": " + ex.message);
			}
		}
	}
	return true;
};

xn.test.enableTestDebug = true;
xn.test.suite("log4javascript test suite", function(s) {
	log4javascript.logLog.setQuietMode(true);
	var ArrayAppender = function(layout) {
		if (layout) {
			this.setLayout(layout);
		}
		this.logMessages = [];
	};

	ArrayAppender.prototype = new log4javascript.Appender();

	ArrayAppender.prototype.layout = new log4javascript.NullLayout();

	ArrayAppender.prototype.append = function(loggingEvent) {
		var formattedMessage = this.getLayout().format(loggingEvent);
		if (this.getLayout().ignoresThrowable()) {
			formattedMessage += loggingEvent.getThrowableStrRep();
		}
		this.logMessages.push(formattedMessage);
	};

	ArrayAppender.prototype.toString = function() {
		return "[ArrayAppender]";
	};

	/* ---------------------------------------------------------- */
	
	var getSampleDate = function() {
		var date = new Date();
		date.setFullYear(2006);
		date.setMonth(7);
		date.setDate(30);
		date.setHours(15);
		date.setMinutes(38);
		date.setSeconds(45);
		return date;
	};
	
	/* ---------------------------------------------------------- */
	
	s.setUp = function(t) {
		t.logger = log4javascript.getLogger("test");
		t.appender = new ArrayAppender();
		t.logger.addAppender(t.appender);
	};

	s.tearDown = function(t) {
		t.logger.removeAppender(t.appender);
	};
	
	s.test("SimpleDateFormat test 1", function(t) {
		var sdf = new SimpleDateFormat("EEE MMM dd HH:mm:ss yyyy GG");
		var date = getSampleDate();
		t.assertEquals(sdf.format(date), "Wed Aug 30 15:38:45 2006 AD");
	});

	s.test("SimpleDateFormat test 2", function(t) {
		var sdf = new SimpleDateFormat("EEEE d/MM (MMMM)/yy KK:mm:ss a");
		var date = getSampleDate();
		t.assertEquals(sdf.format(date), "Wednesday 30/08 (August)/06 03:38:45 PM");
	});

	s.test("SimpleDateFormat test 3", function(t) {
		var sdf = new SimpleDateFormat("D F w W");
		var date = getSampleDate();
		t.assertEquals(sdf.format(date), "242 5 35 5");
	});

	s.test("String.replace test", function(t) {
		t.assertEquals("Hello world".replace(/o/g, "Z"), "HellZ wZrld");
	});

	/*
	s.test("Dummy script interface test", function(t) {
		try {
			compareObjectInterface(log4javascript, "log4javascript", log4javascript_dummy, "log4javascript_dummy");
		} catch (ex) {
			t.fail(ex);
		}
	});
	*/

	s.test("Array.splice test 1", function(t) {
		var a = ["Marlon", "Ashley", "Darius", "Lloyd"];
		var deletedItems = a.splice(1, 2);
		t.assertEquals(a.join(","), "Marlon,Lloyd");
		t.assertEquals(deletedItems.join(","), "Ashley,Darius");
	});

	s.test("Array.splice test 2", function(t) {
		var a = ["Marlon", "Ashley", "Darius", "Lloyd"];
		var deletedItems = a.splice(1, 1, "Malky", "Jay");
		t.assertEquals(a.join(","), "Marlon,Malky,Jay,Darius,Lloyd");
		t.assertEquals(deletedItems.join(","), "Ashley");
	});
	
	s.test("array_remove test", function(t) {
		var array_remove = log4javascript.evalInScope("array_remove");
		var a = ["Marlon", "Ashley", "Darius"];
		array_remove(a, "Darius");
		t.assertEquals(a.join(","), "Marlon,Ashley");
	});
	
	s.test("escapeNewLines test", function(t) {
		var escapeNewLines = log4javascript.evalInScope("escapeNewLines");
		var str = "1\r2\n3\n4\r\n5\r6\r\n7";
		t.assertEquals(escapeNewLines(str), "1\\r\\n2\\r\\n3\\r\\n4\\r\\n5\\r\\n6\\r\\n7");
	});
	
	s.test("Logger logging test", function(t) {
		// Should log since the default level for loggers is DEBUG and 
		// the default threshold for appenders is ALL
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages.length, 1);
	});
	
	s.test("Logger levels test", function(t) {
		var originalLevel = t.logger.getLevel();
		t.logger.setLevel(log4javascript.Level.INFO);
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages.length, 0);
		t.logger.setLevel(originalLevel);
	});

	s.test("Appender threshold test", function(t) {
		t.appender.setThreshold(log4javascript.Level.INFO);
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages.length, 0);
	});

	s.test("Disable log4javascript test", function(t) {
		log4javascript.setEnabled(false);
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages.length, 0);
		log4javascript.setEnabled(true);
	});
	
	s.test("Basic appender / layout test", function(t) {
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages[0], "TEST");
	});
	
	s.test("SimpleLayout test", function(t) {
		t.appender.setLayout(new log4javascript.SimpleLayout());
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages[0], "DEBUG - TEST");
	});

	s.test("NullLayout test", function(t) {
		t.appender.setLayout(new log4javascript.NullLayout());
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages[0], "TEST");
	});

	s.test("XmlLayout test", function(t) {
		t.appender.setLayout(new log4javascript.XmlLayout());
		t.logger.debug("TEST");
		t.assertTrue(/^<log4javascript:event logger="test" timestamp="\d+" level="DEBUG">\s*<log4javascript:message><!\[CDATA\[TEST\]\]><\/log4javascript:message>\s*<\/log4javascript:event>\s*$/.test(t.appender.logMessages[0]));
	});

	s.test("XmlLayout with exception test", function(t) {
		t.appender.setLayout(new log4javascript.XmlLayout());
		t.logger.debug("TEST", new Error("Test error"));
		var regex;
		var isMatch = /^<log4javascript:event logger="test" timestamp="\d+" level="DEBUG">\s*<log4javascript:message><!\[CDATA\[TEST\]\]><\/log4javascript:message>\s*<log4javascript:exception>\s*<!\[CDATA\[.*\]\]><\/log4javascript:exception>\s*<\/log4javascript:event>\s*$/.test(t.appender.logMessages[0]);
		t.assertTrue(isMatch);
	});

	s.test("JsonLayout test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug("TEST");
		t.assertTrue(/^{"logger":"test","timestamp":\d+,"level":"DEBUG","url":".*","message":"TEST"}$/.test(t.appender.logMessages[0]));
	});

	s.test("JsonLayout JSON validity test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug("TEST");
		eval("var o = " + t.appender.logMessages[0]);
		t.assertEquals(o.message, "TEST");
	});

	s.test("JsonLayout with number type message test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug(15);
		t.assertTrue(/^{"logger":"test","timestamp":\d+,"level":"DEBUG","url":".*","message":15}$/.test(t.appender.logMessages[0]));
	});

	s.test("JsonLayout with object type message test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug({});
		t.assertTrue(/^{"logger":"test","timestamp":\d+,"level":"DEBUG","url":".*","message":"\[object Object\]"}$/.test(t.appender.logMessages[0]));
	});

	s.test("JsonLayout with boolean type message test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug(false);
		t.assertTrue(/^{"logger":"test","timestamp":\d+,"level":"DEBUG","url":".*","message":false}$/.test(t.appender.logMessages[0]));
	});

	s.test("JsonLayout with quote test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug("TE\"S\"T");
		t.assertTrue(/^{"logger":"test","timestamp":\d+,"level":"DEBUG","url":".*","message":"TE\\"S\\"T"}$/.test(t.appender.logMessages[0]));
	});

	s.test("JsonLayout with exception test", function(t) {
		t.appender.setLayout(new log4javascript.JsonLayout());
		t.logger.debug("TEST", new Error("Test error"));
		t.assertTrue(/^{"logger":"test","timestamp":\d+,"level":"DEBUG","url":".*","message":"TEST","exception":.*}$/.test(t.appender.logMessages[0]));
	});

	s.test("HttpPostDataLayout test", function(t) {
		t.appender.setLayout(new log4javascript.HttpPostDataLayout());
		t.logger.debug("TEST");
		t.assertTrue(/^logger=test&timestamp=\d+&level=DEBUG&url=.*&message=TEST$/.test(t.appender.logMessages[0]));
	});

	s.test("HttpPostDataLayout URL encoding test", function(t) {
		t.appender.setLayout(new log4javascript.HttpPostDataLayout());
		t.logger.debug("TEST +\"1\"");
		t.assertTrue(/^logger=test&timestamp=\d+&level=DEBUG&url=.*&message=TEST%20%2B%221%22$/.test(t.appender.logMessages[0]));
	});

	s.test("HttpPostDataLayout with exception test", function(t) {
		t.appender.setLayout(new log4javascript.HttpPostDataLayout());
		t.logger.debug("TEST", new Error("Test error"));
		t.assertTrue(/^logger=test&timestamp=\d+&level=DEBUG&url=.*&message=TEST&exception=.*$/.test(t.appender.logMessages[0]));
	});

	s.test("PatternLayout dates test", function(t) {
		var layout = new log4javascript.PatternLayout("%d %d{DATE} %d{HH:ss}");
		t.appender.setLayout(layout);
		t.logger.debug("TEST");
		t.assertTrue(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2},\d{3} \d{2}:\d{2}$/.test(t.appender.logMessages[0]));
	});

	s.test("PatternLayout modifiers test", function(t) {
		var layout = new log4javascript.PatternLayout("%m|%3m|%-3m|%6m|%-6m|%.2m|%1.2m|%6.8m|%-1.2m|%-6.8m|");
		t.appender.setLayout(layout);
		t.logger.debug("TEST");
		t.assertEquals(t.appender.logMessages[0], "TEST|TEST|TEST|  TEST|TEST  |ST|ST|  TEST|ST|TEST  |");
	});

	s.test("PatternLayout conversion characters test", function(t) {
		var layout = new log4javascript.PatternLayout("%c %n %p %r literal %%");
		t.appender.setLayout(layout);
		t.logger.debug("TEST");
		t.assertTrue(/^test \s+ DEBUG \d+ literal %$/.test(t.appender.logMessages[0]));
	});

	s.test("PatternLayout message test", function(t) {
		var layout = new log4javascript.PatternLayout("%m{1} %m{2}");
		t.appender.setLayout(layout);
		var testObj = {
			strikers: {
				quick: "Marlon"
			}
		};
		t.logger.debug(testObj);
		t.assertEquals("{\r\n  strikers: [object Object]\r\n} {\r\n\  strikers: {\r\n    quick: Marlon\r\n  }\r\n}", t.appender.logMessages[0]);
	});

	s.test("AjaxAppender test", function(t) {
		t.async(1000);
		// Create and add an Ajax appender
		var ajaxAppender = new log4javascript.AjaxAppender("ajaxappender.txt");
		ajaxAppender.setRequestSuccessCallback(
			function(xmlHttp) {
				t.assertEquals(xmlHttp.responseText, "test");
				t.succeed();
			}
		);
		ajaxAppender.setFailCallback(
			function(msg) {
				t.fail(msg);
				ajaxErrorMessage = msg;
			}
		);
		t.logger.addAppender(ajaxAppender);
		t.logger.debug("TEST");
	});
	
	var testConsoleAppender = function(t, appender, delay) {
		t.logger.addAppender(appender);
		t.logger.debug("TEST MESSAGE");
		
		// Set a timeout to allow the pop-up to appear
		setTimeout(function() {
			var win = appender.getConsoleWindow();
			var success = true, errorMsg;
			if (win && win.loaded) {
				// Check that the log container element contains
				// the log message
				var logContainer = win.getLogContainer();
				if (logContainer.hasChildNodes()) {
					if (logContainer.firstChild.innerHTML.indexOf("TEST MESSAGE") == -1) {
						success = false;
						errorMsg = "Log message not correctly logged (log container innerHTML: " + logContainer.innerHTML + ")";
					}
				} else {
					success = false;
					errorMsg = "Console has no log messages";
				}
			} else {
				success = false;
				errorMsg = "Console didn't load in time";
			}
			appender.close();
			if (success) {
				t.succeed();
			} else {
				t.fail(errorMsg);
			}
		}, delay);
	};

	s.test("InlineAppender test", function(t) {
		t.async(2000);
		var inlineAppender = new log4javascript.InlineAppender(document.body);
		inlineAppender.setInitiallyMinimized(false);
		inlineAppender.setNewestMessageAtTop(false);
		inlineAppender.setScrollToLatestMessage(true);
		inlineAppender.setWidth(600);
		inlineAppender.setHeight(200);
		
		testConsoleAppender(t, inlineAppender, 500);
	});

	s.test("PopUpAppender test", function(t) {
		t.async(10000);
		var popUpAppender = new log4javascript.PopUpAppender();
		popUpAppender.setFocusPopUp(true);
		popUpAppender.setUseOldPopUp(false);
		popUpAppender.setNewestMessageAtTop(false);
		popUpAppender.setScrollToLatestMessage(true);
		popUpAppender.setComplainAboutPopUpBlocking(false);
		popUpAppender.setWidth(600);
		popUpAppender.setHeight(200);
		
		testConsoleAppender(t, popUpAppender, 3000);
	});
});
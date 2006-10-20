var words = ["Watford", "booked", "their", "place", "in", "the", "Premiership",
	"with", "a", "convincing", "victory", "over", "Leeds", "in", "a", "frantic",
	"play-off", "final", "The", "Hornets", "went", "in", "front", "through",
	"Jay", "DeMerit", "powerful", "header", "from", "five", "yards", "after",
	"Ashley", "Young", "corner", "Aidy", "Boothroyd", "side", "were", "two",
	"up", "when", "James", "Chambers", "shot", "deflected", "off", "Eddie",
	"Lewis", "and", "looped", "on", "to", "the", "post", "before", "dropping",
	"in", "off", "Neil", "Sullivan", "Darius", "Henderson", "completed", "the",
	"rout", "with", "a", "cool", "penalty", "after", "Shaun", "Derry",
	"cynically", "felled", "Marlon", "King"];


function generateRandom(numberOfEntries) {
	for (var i = 0; i < numberOfEntries; i++) {
		var numberOfWords = 1 + Math.floor(10 * Math.random());
		var entryWords = [];
		for (var j = 0; j < numberOfWords; j++) {
			entryWords.push(words[Math.floor(Math.random() * words.length)]);
		}
		var entryMessage = entryWords.join(" ");
		var levelNum = Math.floor(Math.random() * 6);
		switch (levelNum) {
			case 0:
				log(log4javascript.Level.TRACE, entryMessage);
				break;
			case 1:
				log(log4javascript.Level.DEBUG, entryMessage);
				break;
			case 2:
				log(log4javascript.Level.INFO, entryMessage);
				break;
			case 3:
				log(log4javascript.Level.WARN, entryMessage);
				break;
			case 4:
				log(log4javascript.Level.ERROR, entryMessage);
				break;
			case 5:
				log(log4javascript.Level.FATAL, entryMessage);
				break;
		}
	}
}

generateRandom(50);
log(log4javascript.Level.DEBUG, "Line 1\r\nLine 2");
log(log4javascript.Level.DEBUG, "Line 1\nLine 2");
log(log4javascript.Level.DEBUG, "Line 1\rLine 2");

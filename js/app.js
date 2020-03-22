var Suit;
(function (Suit) {
    Suit[Suit["Hearts"] = 0] = "Hearts";
    Suit[Suit["Spades"] = 1] = "Spades";
    Suit[Suit["Diamonds"] = 2] = "Diamonds";
    Suit[Suit["Clubs"] = 3] = "Clubs";
})(Suit || (Suit = {}));
var Card = /** @class */ (function () {
    function Card(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }
    Object.defineProperty(Card.prototype, "rankName", {
        get: function () {
            return Card.rankNames[this.rank - 1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "suitName", {
        get: function () {
            return Suit[this.suit];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "name", {
        get: function () {
            return this.rankName + ' of ' + this.suitName;
        },
        enumerable: true,
        configurable: true
    });
    Card.rankNames = [
        'Ace',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        'Jack',
        'Queen',
        'King'
    ];
    return Card;
}());
var Deck = /** @class */ (function () {
    function Deck() {
        this.cards = [];
        for (var s = 0; s < 4; s++) {
            for (var r = 1; r <= 13; r++) {
                this.cards.push(new Card(r, s));
            }
        }
    }
    Deck.prototype.shuffle = function () {
        var _a;
        for (var i = this.cards.length; i > 0; i--) {
            var j = Math.floor(Math.random() * i);
            _a = [this.cards[j], this.cards[i - 1]], this.cards[i - 1] = _a[0], this.cards[j] = _a[1];
        }
    };
    Deck.prototype.draw = function () {
        return this.cards.shift();
    };
    return Deck;
}());
var Ranks = {
    ROYAL_FLUSH: {
        name: 'Royal Flush',
        payout: 800
    },
    STRAIGHT_FLUSH: {
        name: 'Straight Flush',
        payout: 50
    },
    FOUR_OF_A_KIND: {
        name: 'Four of a Kind',
        payout: 25
    },
    FULL_HOUSE: {
        name: 'Full House',
        payout: 9
    },
    FLUSH: {
        name: 'Flush',
        payout: 6
    },
    STRAIGHT: {
        name: 'Straight',
        payout: 4
    },
    THREE_OF_A_KIND: {
        name: 'Three of a Kind',
        payout: 3
    },
    TWO_PAIR: {
        name: 'Two Pair',
        payout: 2
    },
    JACKS_OR_BETTER: {
        name: 'Jacks or Better',
        payout: 1
    },
    NOTHING: {
        name: 'Nothing',
        payout: 0
    }
};
var Kinds = /** @class */ (function () {
    function Kinds(cards) {
        var _this = this;
        this.kinds = {};
        cards.forEach(function (c) {
            var r = c.rank;
            if (_this.kinds[r] === undefined)
                _this.kinds[r] = [];
            _this.kinds[r].push(c);
        });
    }
    Kinds.prototype.has = function (numOfKinds) {
        var kg = this.all(numOfKinds);
        if (kg)
            return kg[0];
        return false;
    };
    Kinds.prototype.all = function (numOfKinds) {
        var result = [];
        for (var _i = 0, _a = Object.keys(this.kinds); _i < _a.length; _i++) {
            var rank = _a[_i];
            if (this.kinds[+rank].length === numOfKinds) {
                result.push({
                    cards: this.kinds[+rank],
                    rank: +rank
                });
            }
        }
        if (result.length === 0)
            return false;
        return result;
    };
    return Kinds;
}());
var Hand = /** @class */ (function () {
    function Hand(cards) {
        if (cards !== undefined) {
            this.cards = cards;
        }
        else {
            this.cards = [];
        }
    }
    Hand.prototype.isFlush = function () {
        var suit = this.cards[0].suit;
        return this.cards.every(function (c) { return c.suit === suit; });
    };
    Hand.prototype.isStraight = function () {
        var sum = 0;
        for (var i = 1; i < this.cards.length; i++) {
            sum = sum + Math.abs(this.cards[i].rank - this.cards[i - 1].rank);
        }
        return sum === 4;
    };
    Hand.prototype.has = function () {
        var ranks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            ranks[_i] = arguments[_i];
        }
        return this.cards.some(function (c) {
            var r = c.rank, i = ranks.indexOf(r);
            if (i !== -1) {
                ranks.splice(i, 1);
            }
            return ranks.length === 0;
        });
    };
    Hand.prototype.getScore = function () {
        if (this.isFlush() && this.isStraight()) {
            if (this.has(1, 10, 11, 12, 13)) {
                // Royal flush
                return {
                    rank: Ranks.ROYAL_FLUSH,
                    scoringCards: this.cards
                };
            }
            // Straight flush
            return {
                rank: Ranks.STRAIGHT_FLUSH,
                scoringCards: this.cards
            };
        }
        var kinds = new Kinds(this.cards);
        var has4 = kinds.has(4);
        if (has4) {
            return {
                rank: Ranks.FOUR_OF_A_KIND,
                scoringCards: has4.cards
            };
        }
        var has3 = kinds.has(3), has2 = kinds.has(2);
        if (has3 && has2) {
            return {
                rank: Ranks.FULL_HOUSE,
                scoringCards: this.cards
            };
        }
        if (this.isFlush()) {
            return {
                rank: Ranks.FLUSH,
                scoringCards: this.cards
            };
        }
        if (this.isStraight()) {
            return {
                rank: Ranks.STRAIGHT,
                scoringCards: this.cards
            };
        }
        if (has3) {
            return {
                rank: Ranks.THREE_OF_A_KIND,
                scoringCards: has3.cards
            };
        }
        var all2 = kinds.all(2);
        if (all2 && all2.length === 2) {
            return {
                rank: Ranks.TWO_PAIR,
                scoringCards: (function () {
                    var cards = [];
                    all2.forEach(function (kg) {
                        cards = cards.concat(kg.cards);
                    });
                    return cards;
                })()
            };
        }
        if (has2 && (has2.rank >= 11 || has2.rank === 1)) {
            return {
                rank: Ranks.JACKS_OR_BETTER,
                scoringCards: has2.cards
            };
        }
        return {
            rank: Ranks.NOTHING,
            scoringCards: []
        };
    };
    return Hand;
}());
var d = new Deck();
d.shuffle();
console.log(d.draw().name);
//# sourceMappingURL=app.js.map
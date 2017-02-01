/**
 * Generates a UUID
 * @returns {String} UUID
 */
export const guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
};

export const createId = () => {
  var names = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india',
      'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra',
      'uniform', 'victor', 'whiskey', 'x-ray', 'yankee', 'zulu'
  ],
  adjectives = ['hot', 'cold', 'colorful', 'spastic', 'kitchy', 'fast', 'slow', 'tiny', 'large', 'tasty', 'bubbly',
    'effervescent', 'cool', 'outdated', 'mean', 'angry', 'rustic', 'tense', 'relaxing', 'fragmented', 'savory', 'slimy',
    'little', 'green', 'maple', 'syrupy', 'gooey', 'crunchy', 'scintillating', 'beefy', 'spectacular', 'fabulous', 'moist',
    'caustic', 'burning', 'shocking', 'solar', 'itchy', 'artisanal'
  ],
  words = ['pickle', 'meatball', 'dirt', 'road', 'area', 'johnny', 'soapbox', 'waffle', 'brisket', 'flapjacks', 'fridge',
      'mario', 'luigi', 'mushroom', 'cheeseburger', 'spoon', 'beans', 'tickle', 'cheddar', 'slag', 'void', 'enemy', 'friend',
      'tree', 'hoops', 'yoyo', 'checkers', 'pop', 'meal', 'potato', 'football', 'haberdashery', 'buddy', 'worm',
      'ketchup', 'liquid', 'cowbell', 'peppergrinder', 'honeydew', 'sparkle', 'rainbow', 'unicorn', 'whisperer',
      'chicken nugget', 'broccoli', 'vegeta', 'goku', 'samus', 'brolli', 'bibbity', 'bobbity', 'boo', 'android',
      'cell', 'king kai', "nouget", "peanut", "chocolate", "frog", 'hopscotch', 'rainbow', 'cabbage', 'papa', 'mama'
  ];

  return names[Math.floor(Math.random() * names.length)] + " " + adjectives[Math.floor(Math.random() * adjectives.length)] + " " + words[Math.floor(Math.random() * words.length)];
};

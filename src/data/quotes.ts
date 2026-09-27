// Famous short quotes for quote mode. Kept lowercase with only basic
// punctuation so every character is typable on the blocky keyboard.
export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "stay hungry, stay foolish.", author: "steve jobs" },
  { text: "simplicity is the ultimate sophistication.", author: "leonardo da vinci" },
  { text: "what we think, we become.", author: "buddha" },
  { text: "the best way out is always through.", author: "robert frost" },
  { text: "be yourself; everyone else is already taken.", author: "oscar wilde" },
  { text: "in the middle of difficulty lies opportunity.", author: "albert einstein" },
  { text: "do what you can, with what you have, where you are.", author: "theodore roosevelt" },
  { text: "it always seems impossible until it is done.", author: "nelson mandela" },
  { text: "well begun is half done.", author: "aristotle" },
  { text: "action is the foundational key to all success.", author: "pablo picasso" },
  { text: "dream big and dare to fail.", author: "norman vaughan" },
  { text: "less is more.", author: "ludwig mies van der rohe" },
  { text: "done is better than perfect.", author: "sheryl sandberg" },
  { text: "the only way to do great work is to love what you do.", author: "steve jobs" },
];

export function randomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

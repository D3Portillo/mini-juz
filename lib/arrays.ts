export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffledArray = [...array]
  // Fisher-Yates shuffle algorithm
  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }

  // Return the shuffled array
  return shuffledArray
}
